import { ObjectId } from "bson";
import Session from "./Session";
import { PlayerSave, SerializedEJSON } from "./types";

export interface ServerToClientEvents {
  hello: () => void;
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
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  session: Session | undefined;
}
