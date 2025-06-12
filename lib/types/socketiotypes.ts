import { LocationId } from "./Location";
import Session from "./Session";
import { GameState, PlayerSave, SerializedEJSON } from "./types";

export interface ServerToClientEvents {
  hello: () => void;
  setGameState: (gameState: SerializedEJSON<GameState>) => void;
  addMessage: (message: string) => void;
  tookDamage: (amount: number) => void;
  died: () => void;
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
  createNewSave: (saveName: string) => void;
  selectSave: (progressId: string) => void;
  requestGameState: () => void;
  move: (newLocationId: LocationId) => void;
  activateAbility: (
    abilityName: string,
    sourceName: string,
    targetIds: string[]
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  session: Session | undefined;
}
