import { ObjectId } from "bson";
import Session from "./Session";
import { GameState, PlayerSave, SerializedEJSON } from "./types";
import { Dungeon } from "lib/dungeongeneration/types";

export interface ServerToClientEvents {
  hello: () => void;
  setGameState: (gameState: SerializedEJSON<GameState>) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  signIn: (
    email: string,
    password: string,
    /**
     * If the sessionId is undefined, the sign in failed.
     */
    callback: (sessionId: string | undefined) => void
  ) => void;
  signUp: (
    email: string,
    username: string,
    password: string,
    callback: (sessionId: string | undefined, error: string | undefined) => void
  ) => void;
  setSessionId: (
    sessionId: string,
    callback: (success: boolean) => void
  ) => void;
  getSaves: (callback: (saves: SerializedEJSON<PlayerSave[]>) => void) => void;
  createNewSave: () => void;
  selectSave: (progressId: string) => void;
  requestGameState: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  session: Session | undefined;
}
