import { LocationId } from "lib/gamedata/rawLocations";
import Session from "./Session";
import { GameState, PlayerSave, SerializedEJSON } from "./types";
import { ItemInstance } from "./item";
import Difficulty from "./Difficulty";

export interface ServerToClientEvents {
  hello: () => void;
  setGameState: (gameState: SerializedEJSON<GameState>) => void;
  addMessage: (message: string) => void;
  tookDamage: (amount: number) => void;
  died: () => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  ping: (callback: () => void) => void;
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
  getSaveSelectPageData: (
    callback: (
      saves: SerializedEJSON<PlayerSave[]>,
      discordLinkCode: string,
      linkedDiscordAccount: boolean,
      primarySaveId: string | undefined
    ) => void
  ) => void;
  setPrimarySave: (instanceId: string) => void;
  createNewSave: (saveName: string, difficulty: Difficulty) => void;
  selectSave: (progressId: string) => void;
  deleteSave: (progressId: string) => void;
  requestGameState: () => void;
  move: (newLocationId: LocationId) => void;
  activateAbility: (
    abilityName: string,
    sourceName: string,
    targetIds: string[]
  ) => void;
  startInteraction: (entityId: string) => void;
  interact: (entityId: string, action: any) => void;
  equip: (item: ItemInstance) => void;
  unequip: (item: ItemInstance) => void;
  dropItem: (item: SerializedEJSON<ItemInstance>) => void;
  kickGuildMember(guildId: string, memberId: string): void;
  chat: (message: string) => void;
  quickLoot: () => void;
  pinRecipe: (entityId: string, recipeIndex: number) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  session: Session | undefined;
}
