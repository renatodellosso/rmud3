import { PlayerInstance, PlayerProgress } from "./types/player";
import { ObjectId } from "bson";
import { getSingleton } from "./utils";

export class PlayerManager {
  instances: Map<string, PlayerInstance>;
  progresses: Map<string, PlayerProgress>;

  constructor() {
    this.instances = new Map<string, PlayerInstance>();
    this.progresses = new Map<string, PlayerProgress>();
  }

  public getPlayerByInstanceId(id: ObjectId) {
    const instance = this.instances.get(id.toString());
    if (!instance) {
      return undefined;
    }

    const progress = this.progresses.get(instance._id.toString());

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

    const instance = this.instances.get(progress._id.toString());

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
  getSingleton<PlayerManager>("playerManager", () => new PlayerManager());

export default getPlayerManager;
