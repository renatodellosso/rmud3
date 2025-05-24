import { Db, OptionalId, Document } from "mongodb";
import { ObjectId } from "bson";
import NodeCache from "node-cache";
import CollectionId from "./types/CollectionId";
import Account from "./types/Account";
import { PlayerInstance, PlayerProgress } from "./types/player";
import { getSingleton } from "./utils";

export class CachedCollection<T extends OptionalId<Document>> {
  private cache: NodeCache;
  private db: Db;
  private id: CollectionId;

  constructor(db: Db, id: CollectionId) {
    this.db = db;
    this.id = id;
    this.cache = new NodeCache({ stdTTL: 100 });
  }

  getCollection() {
    return this.db.collection(this.id);
  }

  async getCachedData(key: ObjectId): Promise<T | null> {
    const cachedData = this.cache.get<T>(key.toString());
    if (cachedData) {
      return cachedData;
    }

    const collection = this.getCollection();
    const data = await collection.findOne({ _id: key });
    if (data) {
      this.cache.set(key.toString(), data);
      return data as T;
    }

    return null;
  }

  async insertData(data: T): Promise<ObjectId> {
    const collection = this.getCollection();
    const result = await collection.updateOne({ _id: data._id }, data, {
      upsert: true,
    });

    if (result.acknowledged && result.upsertedId) {
      this.cache.set(result.upsertedId.toString(), data);
      return result.upsertedId;
    }

    throw new Error("Insert failed");
  }
}

export class CollectionManager {
  private db: Db;
  private collections: {
    [CollectionId.Accounts]: CachedCollection<Account>;
    [CollectionId.PlayerInstances]: CachedCollection<PlayerInstance>;
    [CollectionId.PlayerProgresses]: CachedCollection<PlayerProgress>;
  };

  constructor(db: Db) {
    this.db = db;
    this.collections = {
      [CollectionId.Accounts]: new CachedCollection(
        this.db,
        CollectionId.Accounts
      ),
      [CollectionId.PlayerInstances]: new CachedCollection(
        this.db,
        CollectionId.PlayerInstances
      ),
      [CollectionId.PlayerProgresses]: new CachedCollection(
        this.db,
        CollectionId.PlayerProgresses
      ),
    };
  }

  getCollection<T extends OptionalId<Document>>(
    id: CollectionId
  ): CachedCollection<T> {
    return this.collections[id] as unknown as CachedCollection<T>;
  }
}

const getCollectionManager = (db: Db) =>
  getSingleton("collectionManager", () => new CollectionManager(db));

export default getCollectionManager;
