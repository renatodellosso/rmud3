import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socketiotypes";
import {
  getFromOptionalFunc,
  getSingleton,
  restoreFieldsAndMethods,
} from "lib/utils";
import locations from "lib/locations";
import getPlayerManager from "lib/PlayerManager";
import { ExitData, GameState } from "./types";
import { EJSON } from "bson";
import Session from "./Session";
import { PlayerInstance } from "./entities/player";
import ClientFriendlyIo from "lib/ClientFriendlyIo";
import getSocketsByPlayerInstanceIds from "lib/getSocketsByPlayerInstanceIds";
import { LocationId } from "lib/gamedata/rawLocations";
import entities from "lib/gamedata/entities";
import { EntityInstance } from "./entity";
import { CreatureInstance } from "./entities/creature";
import LocationMap from "./LocationMap";
import Guild, { ClientGuild, GuildMember } from "./Guild";
import { socket } from "../socket";

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export class TypedServer extends Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {}

export function getRawIoSingleton() {
  return getSingleton<TypedServer>("io");
}

export function addMsgToSession(session: Session, msg: string) {
  if (!session.messages) {
    session.messages = [];
  }
  session.messages.push(msg);

  if (session.messages.length > 100) {
    session.messages.shift(); // Keep the last 100 messages
  }
}

export async function sendMsgToRoomServerOnly(roomId: string, msg: string) {
  const io = getRawIoSingleton();
  if (!io) return;

  const room = io.to(roomId);
  const sockets = await room.fetchSockets();

  for (const socket of sockets) {
    if (!socket.data.session) {
      console.warn(
        `Socket ${socket.id} does not have a session. Message not added to session.`
      );
      continue;
    }

    addMsgToSession(socket.data.session, msg);
  }

  if (sockets.length === 0) {
    return;
  }

  room.emit("addMessage", msg);
  console.log(
    `Message sent to room ${roomId} with ${sockets.length} users: ${msg}`
  );
}

export function sendMsgToSocket(socket: TypedSocket, msg: string) {
  if (!socket.data.session) {
    console.warn(
      `Socket ${socket.id} does not have a session. Message not added to session.`
    );
    return Promise.resolve();
  }

  addMsgToSession(socket.data.session, msg);
  socket.emit("addMessage", msg);

  return Promise.resolve();
}

export function getExitData(
  locationId: LocationId,
  map: LocationMap,
  currentLocationId: LocationId
): ExitData {
  const location = locations[locationId];

  const direction = map.getDirection(currentLocationId, locationId);

  let dirText = "";
  if (direction) {
    // The directions are a little weird here
    if (direction[0] > 0) dirText = " (D)";
    else if (direction[0] < 0) dirText = " (U)";
    else if (direction[1] > 0) dirText = " (S)";
    else if (direction[1] < 0) dirText = " (N)";
    else if (direction[2] > 0) dirText = " (E)";
    else if (direction[2] < 0) dirText = " (W)";
  }

  return {
    id: locationId,
    name: location.name + dirText,
  };
}

export function getPlayer(socket: TypedSocket) {
  const playerManager = getPlayerManager()!;

  if (
    !socket.data.session?.playerInstanceId ||
    !socket.data.session?.playerProgressId
  ) {
    throw new Error(
      `Socket session does not have playerInstanceId or playerProgressId. Session: ${socket.data.session}`
    );
  }

  const player = playerManager.getPlayerByInstanceId(
    socket.data.session!.playerInstanceId
  );
  if (!player) {
    throw new Error(
      `Player with instance ID ${
        socket.data.session!.playerInstanceId
      } not found`
    );
  }

  return player;
}

export async function updateGameState(socket: TypedSocket) {
  const gameState = await getGameState(socket);

  socket.emit("setGameState", EJSON.stringify(gameState));

  return Promise.resolve();
}

export async function updateGameStateForRoom(roomId: string) {
  const io = getRawIoSingleton();
  if (!io) return Promise.resolve();

  const room = io.to(roomId);
  const sockets = await room.fetchSockets();

  return Promise.all(
    sockets.map((s) => updateGameState(s as any as TypedSocket))
  ).then(() => {});
}

async function getGameState(socket: TypedSocket): Promise<GameState> {
  const player = getPlayer(socket);

  let location = locations[player.instance.location];

  if (!location) {
    locations["dungeon-entrance"].enter(player.instance);
    location = locations[player.instance.location];
  }

  // Clone entities to avoid modifying the original objects
  const entityList = Array.from(location.entities).map((e) => {
    const { damagers, ...newEntity } = e as CreatureInstance;

    return newEntity as any as EntityInstance;
  }) as (EntityInstance & {
    interactable: boolean;
  })[];

  player.instance.prepForGameState();
  player.instance.recalculateStats();

  for (const entity of entityList) {
    const def = entities[entity.definitionId];

    entity.interactable =
      (def.interact &&
        (def.canInteract
          ? def.canInteract(entity, player.instance as PlayerInstance)
          : true)) ??
      false;

    if (entity instanceof CreatureInstance) entity.prepForGameState();
  }

  player.instance.recalculateMaxWeight();

  const guild =
    player.instance.guildId && (await Guild.fromId(player.instance.guildId));
  const clientGuild = guild ? await getClientGuild(guild) : undefined;

  // Clean up player instance
  player.instance.prepForGameState();

  socket.data.session!.interactions = socket.data.session!.interactions.filter(
    (i) => entityList.some((e) => e._id.equals(i.entityId))
  );

  return {
    self: player.instance,
    progress: player.progress,
    location: {
      // Leave out floor from dungeon locations
      id: location.id,
      name: location.name,
      description: getFromOptionalFunc(
        location.description,
        player.instance as PlayerInstance
      ),
      entities: entityList,
      exits: Array.from(location.exits)
        .filter((e) => e != location.id)
        .map((e) =>
          getExitData(e, socket.data.session!.map, player.instance.location)
        ),
    },
    messages: socket.data.session!.messages,
    interactions: socket.data.session!.interactions || [],
    map: socket.data.session!.map,
    guild: clientGuild,
  };
}

async function getClientGuild(guild: Guild): Promise<ClientGuild> {
  const playerManager = getPlayerManager()!;

  const memberInstances: GuildMember[] = (
    await Promise.all(
      guild.members.map((memberId) =>
        playerManager.getInstanceById(memberId, true)
      )
    )
  )
    .filter((m) => m !== undefined)
    .map(
      (m) =>
        restoreFieldsAndMethods(
          {
            ...m,
            isOnline: playerManager.isOnline.get(m!._id.toString()),
            isOwner: m!._id.equals(guild.owner),
          } as GuildMember,
          new PlayerInstance()
        ) as GuildMember
    );

  return restoreFieldsAndMethods(guild, {
    ...guild,
    memberInstances,
  });
}

export class Io implements ClientFriendlyIo {
  sendMsgToRoom(room: string, msg: string) {
    return sendMsgToRoomServerOnly(room, msg);
  }

  sendMsgToPlayer(playerId: string, msg: string) {
    const socketMap = getSocketsByPlayerInstanceIds();
    if (!socketMap) {
      throw new Error("SocketsByPlayerInstanceIds not initialized");
    }

    const socket = socketMap.get(playerId);

    if (!socket) {
      throw new Error(`Socket for player ${playerId} not found`);
    }

    return sendMsgToSocket(socket, msg);
  }

  sendMsgToAll(msg: string): Promise<void> {
    const io = getRawIoSingleton();
    io!.emit("addMessage", msg);

    return Promise.resolve();
  }

  updateGameState(playerId: string) {
    const socketMap = getSocketsByPlayerInstanceIds();
    if (!socketMap) {
      throw new Error("SocketsByPlayerInstanceIds not initialized");
    }

    const socket = socketMap.get(playerId);

    if (!socket) {
      throw new Error(`Socket for player ${playerId} not found`);
    }

    return updateGameState(socket as any as TypedSocket);
  }

  updateGameStateForRoom(roomId: string) {
    return updateGameStateForRoom(roomId);
  }

  joinRoom(roomId: string, playerId: string) {
    const io = getRawIoSingleton();
    if (!io) return Promise.resolve();

    const socketMap = getSocketsByPlayerInstanceIds();
    if (!socketMap) {
      throw new Error("SocketsByPlayerInstanceIds not initialized");
    }

    const socketId = socketMap.get(playerId)?.id;
    if (!socketId) {
      console.warn(
        `Socket for player ${playerId} not found. Cannot join room.`
      );
      return Promise.resolve();
    }

    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
      console.warn(`Socket ${socketId} not found. Cannot join room ${roomId}.`);
      return Promise.resolve();
    }

    const result = socket.join(roomId);

    if (result instanceof Promise) {
      return result;
    }

    return Promise.resolve(result);
  }

  leaveRoom(roomId: string, playerId: string) {
    const io = getRawIoSingleton();
    if (!io) return Promise.resolve();

    const socketMap = getSocketsByPlayerInstanceIds();
    if (!socketMap) {
      throw new Error("SocketsByPlayerInstanceIds not initialized");
    }

    const socketId = socketMap.get(playerId)?.id;
    if (!socketId) {
      console.warn(
        `Socket for player ${playerId} not found. Cannot leave room.`
      );
      return Promise.resolve();
    }

    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
      console.warn(
        `Socket ${socketId} not found. Cannot leave room ${roomId}.`
      );
      return Promise.resolve();
    }

    const result = socket.leave(roomId);

    if (result instanceof Promise) {
      return result;
    }

    return Promise.resolve(result);
  }

  emit(playerId: string, event: keyof ServerToClientEvents, ...args: any[]) {
    const socketMap = getSocketsByPlayerInstanceIds();
    if (!socketMap) {
      throw new Error("SocketsByPlayerInstanceIds not initialized");
    }

    const socket = socketMap.get(playerId);

    if (!socket) {
      throw new Error(`Socket for player ${playerId} not found`);
    }

    socket.emit(event, ...(args as any));
    return Promise.resolve();
  }

  clearMessages(playerId: string) {
    const socketMap = getSocketsByPlayerInstanceIds();
    if (!socketMap) {
      throw new Error("SocketsByPlayerInstanceIds not initialized");
    }

    const socket = socketMap.get(playerId);

    if (!socket) {
      throw new Error(`Socket for player ${playerId} not found`);
    }

    if (!socket.data.session) {
      console.warn(
        `Socket ${socket.id} does not have a session. Cannot clear messages.`
      );
      return Promise.resolve();
    }

    socket.data.session.messages = [];
    return Promise.resolve();
  }

  clearInteractions(playerId: string): Promise<void> {
    const socketMap = getSocketsByPlayerInstanceIds();
    if (!socketMap) {
      throw new Error("SocketsByPlayerInstanceIds not initialized");
    }

    const socket = socketMap.get(playerId);

    if (!socket) {
      throw new Error(`Socket for player ${playerId} not found`);
    }

    if (!socket.data.session) {
      console.warn(
        `Socket ${socket.id} does not have a session. Cannot clear interactions.`
      );
      return Promise.resolve();
    }

    socket.data.session.interactions = [];
    return Promise.resolve();
  }
}
