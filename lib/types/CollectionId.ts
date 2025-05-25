import Account from "./Account";
import { PlayerInstance, PlayerProgress } from "./player";

enum CollectionId {
  Accounts = "Accounts",
  PlayerInstances = "PlayerInstances",
  PlayerProgresses = "PlayerProgress",
}

export default CollectionId;

export type CollectionIdToType<T extends CollectionId> = {
  [CollectionId.Accounts]: Account;
  [CollectionId.PlayerInstances]: PlayerInstance;
  [CollectionId.PlayerProgresses]: PlayerProgress;
}[T];
