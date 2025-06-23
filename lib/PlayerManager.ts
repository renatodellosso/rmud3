import { PlayerInstance, PlayerProgress } from "./types/entities/player";
import { ObjectId } from "bson";
import { getSingleton, restoreFieldsAndMethods } from "./utils";
import locations from "./locations";
import getCollectionManager from "./getCollectionManager";
import CollectionId from "./types/CollectionId";
import { getMongoClient } from "./getMongoClient";

export class PlayerManager {
  instances: Map<string, PlayerInstance>;
  progresses: Map<string, PlayerProgress>;
  isOnline: Map<string, boolean> = new Map();

  constructor() {
    this.instances = new Map<string, PlayerInstance>();
    this.progresses = new Map<string, PlayerProgress>();
    this.isOnline = new Map<string, boolean>();
  }

  public getPlayerByInstanceId(id: ObjectId) {
    const instance = this.instances.get(id.toString());
    if (!instance) {
      return undefined;
    }

    const progress = this.progresses.get(instance.progressId.toString());

    if (!progress) {
      return undefined;
    }

    return {
      instance,
      progress,
    };
  }

  public getPlayerByProgressId(id: ObjectId) {
    const progress = this.progresses.get(id.toString());
    if (!progress) {
      return undefined;
    }

    const instance = this.instances.get(progress.playerInstanceId.toString());

    if (!instance) {
      return undefined;
    }

    return {
      instance,
      progress,
    };
  }

  public addPlayer(instance: PlayerInstance, progress: PlayerProgress): void {
    this.instances.set(instance._id.toString(), instance);
    this.progresses.set(progress._id.toString(), progress);
  }

  public removePlayerByInstanceId(id: ObjectId): boolean {
    const instance = this.instances.get(id.toString());
    if (!instance) {
      return false;
    }

    this.instances.delete(instance._id.toString());
    this.progresses.delete(instance._id.toString());
    return true;
  }

  public removePlayerByProgressId(id: ObjectId): boolean {
    const progress = this.progresses.get(id.toString());
    if (!progress) {
      return false;
    }

    this.progresses.delete(progress._id.toString());
    this.instances.delete(progress._id.toString());
    return true;
  }
}

const getPlayerManager = () =>
  getSingleton<PlayerManager>("playerManager", () => new PlayerManager())!;

export default getPlayerManager;

export function spawnPlayer(
  playerManager: PlayerManager,
  instance: PlayerInstance,
  progress: PlayerProgress
): void {
  const existingInstance = playerManager.getPlayerByInstanceId(instance._id);

  if (existingInstance) {
    console.warn(`Player instance with ID ${instance._id} already exists.`);
    return;
  }

  restoreFieldsAndMethods(instance, new PlayerInstance());

  playerManager.addPlayer(instance, progress);

  // Move player outside the dungeon
  if (
    instance.location.startsWith("dungeon-") &&
    instance.location !== "dungeon-entrance"
  ) {
    instance.location = "dungeon-entrance";
  }

  locations[instance.location].enter(instance);
}

export async function savePlayerServerOnly(instance: PlayerInstance) {
  console.log(
    `Saving player instance with ID ${instance._id} and progress ID ${instance.progressId}`
  );

  const progress = getPlayerManager().progresses.get(
    instance.progressId.toString()
  );

  const db = await getMongoClient();
  const collectionManager = getCollectionManager(db);
  const instanceCollection = collectionManager.getCollection(
    CollectionId.PlayerInstances
  );
  const progressCollection = collectionManager.getCollection(
    CollectionId.PlayerProgresses
  );

  const { damagers, ...instanceData } = instance as PlayerInstance;

  instanceCollection.upsert(instanceData as PlayerInstance);
  progressCollection.upsert(progress!);
}
