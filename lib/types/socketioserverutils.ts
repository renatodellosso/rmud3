import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socketiotypes";
import { getFromOptionalFunc, getSingleton } from "lib/utils";
import locations from "lib/locations";
import getPlayerManager from "lib/PlayerManager";
import { ExitData, GameState } from "./types";
import { EJSON } from "bson";
import Session from "./Session";
import { socket } from "../socket";
import { restoreFieldsAndMethods } from "../utils";
import { PlayerInstance } from "./player";
import { LocationId } from "./Location";

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

export function getIo() {
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

export async function sendMsgToRoom(roomId: string, msg: string) {
  const io = getIo();
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
    return;
  }

  addMsgToSession(socket.data.session, msg);
  socket.emit("addMessage", msg);
  console.log(`Message sent to player ${socket.id}: ${msg}`);
}

export function getExitData(locationId: LocationId): ExitData {
  const location = locations[locationId];

  return {
    id: locationId,
    name: location.name,
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

export function updateGameState(socket: TypedSocket) {
  const player = getPlayer(socket);

  const location = locations[player.instance.location];

  const gameState: GameState = {
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
      creatures: Array.from(location.creatures),
      exits: Array.from(location.exits).map(getExitData),
    },
    messages: socket.data.session!.messages,
  };

  socket.emit("setGameState", EJSON.stringify(gameState));
}

export function updateGameStateForRoom(roomId: string) {
  const io = getIo();
  if (!io) return;

  const room = io.to(roomId);
  const sockets = room.fetchSockets();

  sockets.then((sockets) => {
    for (const socket of sockets) {
      updateGameState(socket as any as TypedSocket);
    }
  });
}
