import Account from "./Account";
import { PlayerInstance, PlayerProgress } from "./entities/player";
import Guild from "./Guild";

enum CollectionId {
  Accounts = "Accounts",
  PlayerInstances = "PlayerInstances",
  PlayerProgresses = "PlayerProgress",
  Guilds = "Guilds",
}

export default CollectionId;

export type CollectionIdToType<T extends CollectionId> = {
  [CollectionId.Accounts]: Account;
  [CollectionId.PlayerInstances]: PlayerInstance;
  [CollectionId.PlayerProgresses]: PlayerProgress;
  [CollectionId.Guilds]: Guild;
}[T];
