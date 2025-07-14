import Account from "./Account";
import { PlayerInstance, PlayerProgress } from "./entities/player";
import Guild from "./Guild";
import { BuyOrder } from "./types";

enum CollectionId {
  Accounts = "Accounts",
  PlayerInstances = "PlayerInstances",
  PlayerProgresses = "PlayerProgress",
  Guilds = "Guilds",
  BuyOrders = "BuyOrders",
}

export default CollectionId;

export type CollectionIdToType<T extends CollectionId> = {
  [CollectionId.Accounts]: Account;
  [CollectionId.PlayerInstances]: PlayerInstance;
  [CollectionId.PlayerProgresses]: PlayerProgress;
  [CollectionId.Guilds]: Guild;
  [CollectionId.BuyOrders]: BuyOrder;
}[T];
