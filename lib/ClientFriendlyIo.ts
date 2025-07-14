import { ServerToClientEvents } from "./types/socketiotypes";

export default interface ClientFriendlyIo {
  sendMsgToRoom(room: string, msg: string): Promise<void>;
  sendMsgToPlayer(playerId: string, msg: string): Promise<void>;
  sendMsgToAll(msg: string): Promise<void>;
  updateGameState(playerId: string): Promise<void>;
  updateGameStateForRoom(roomId: string): Promise<void>;
  joinRoom(roomId: string, playerId: string): Promise<void>;
  leaveRoom(roomId: string, playerId: string): Promise<void>;
  emit(
    playerId: string,
    event: keyof ServerToClientEvents,
    ...args: any[]
  ): Promise<void>;
  clearMessages(playerId: string): Promise<void>;
  clearInteractions(playerId: string): Promise<void>;
  addChatMessage(playerName: string, message: string): Promise<void>;
}

export class DisabledIo implements ClientFriendlyIo {
  sendMsgToRoom(room: string, msg: string): Promise<void> {
    return Promise.resolve();
  }
  sendMsgToPlayer(playerId: string, msg: string): Promise<void> {
    return Promise.resolve();
  }
  sendMsgToAll(msg: string): Promise<void> {
    return Promise.resolve();
  }
  updateGameState(playerId: string): Promise<void> {
    return Promise.resolve();
  }
  updateGameStateForRoom(roomId: string): Promise<void> {
    return Promise.resolve();
  }
  joinRoom(roomId: string, playerId: string): Promise<void> {
    return Promise.resolve();
  }
  leaveRoom(roomId: string, playerId: string): Promise<void> {
    return Promise.resolve();
  }
  emit(
    playerId: string,
    event: keyof ServerToClientEvents,
    ...args: any[]
  ): Promise<void> {
    return Promise.resolve();
  }
  clearMessages(playerId: string): Promise<void> {
    return Promise.resolve();
  }
  clearInteractions(playerId: string): Promise<void> {
    return Promise.resolve();
  }
  addChatMessage(playerName: string, message: string): Promise<void> {
    return Promise.resolve();
  }
}

export function getIo(): ClientFriendlyIo {
  if (typeof window === "undefined") {
    // Server-side
    const type = require("./types/socketioserverutils").Io;

    return new type();
  } else {
    // Client-side
    return new DisabledIo();
  }
}
