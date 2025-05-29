import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socketiotypes";
import { getSingleton } from "lib/utils";
import locations from "lib/gamedata/locations";
import getPlayerManager from "lib/PlayerManager";
import { ExitData, GameState } from "./types";
import { EJSON } from "bson";
import Session from "./Session";
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

export function getIo() {
  return getSingleton<TypedServer>("io");
}

function addMsgToSession(session: Session, msg: string) {
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

export function sendMsgToPlayer(socket: TypedSocket, msg: string) {
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

export function getExitData(locationId: string): ExitData {
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

  const exits = Array.from(location.exits).map(getExitData);

  const gameState: GameState = {
    self: player.instance,
    progress: player.progress,
    location,
    messages: socket.data.session!.messages,
    exits,
  };

  socket.emit("setGameState", EJSON.stringify(gameState));
}
