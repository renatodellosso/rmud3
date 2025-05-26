import { Db, OptionalId, Document, Filter, WithId } from "mongodb";
import { ObjectId } from "bson";
import NodeCache from "node-cache";
import CollectionId, { CollectionIdToType } from "./types/CollectionId";
import Account from "./types/Account";
import { PlayerInstance, PlayerProgress } from "./types/player";
import { getSingleton } from "./utils";

export class CachedCollection<T extends WithId<Document>> {
  private cache: NodeCache;
  private db: Db | undefined;
  private id: CollectionId;

  constructor(db: Db | undefined, id: CollectionId) {
    this.db = db;
    this.id = id;
    this.cache = new NodeCache({ stdTTL: 100 });
  }

  getCollection() {
    return this.db?.collection(this.id);
  }

  async get(key: ObjectId): Promise<T | null> {
    const cachedData = this.cache.get<T>(key.toString());
    if (cachedData) {
      return cachedData;
    }

    const collection = this.getCollection();
    const data = await collection?.findOne({ _id: key });
    if (data) {
      this.cache.set(key.toString(), data);
      return data as T;
    }

    return null;
  }

  async find(
    mongoFilter: Filter<T> | undefined,
    cacheFilter: Partial<T> | undefined
  ): Promise<T[]> {
    if (cacheFilter) {
      const cachedData = this.cache.keys().map((key) => this.cache.get<T>(key));
      const cachedResults = cachedData.filter((data) =>
        Object.entries(cacheFilter).every(([k, v]) => data && data[k] === v)
      );

      if (cachedResults.length > 0) {
        return cachedResults as T[];
      }
    }

    if (!mongoFilter) {
      return [];
    }

    const collection = this.getCollection();

    const cursor = collection?.find(mongoFilter as Filter<Document>);
    const results: T[] = cursor ? ((await cursor.toArray()) as T[]) : [];

    return results;
  }

  async findWithOneFilter(filter: Filter<T> & Partial<T>): Promise<T[]> {
    return this.find(filter, filter);
  }

  async upsert(data: T): Promise<ObjectId> {
    if (!data._id) {
      data._id = new ObjectId();
    }

    const collection = this.getCollection();

    if (!collection) {
      this.cache.set(data._id.toString(), data);
      return data._id;
    }

    const result = await collection?.updateOne(
      { _id: data._id },
      {
        $set: data,
      },
      {
        upsert: true,
      }
    );

    if (result.acknowledged && result.upsertedId) {
      this.cache.set(result.upsertedId.toString(), data);
      return result.upsertedId;
    }

    throw new Error("Insert failed");
  }

  async setInCache(key: ObjectId, data: T): Promise<void> {
    this.cache.set(key.toString(), data);
  }
}

export class CollectionManager {
  private db: Db | undefined;
  private collections: {
    [CollectionId.Accounts]: CachedCollection<Account>;
    [CollectionId.PlayerInstances]: CachedCollection<PlayerInstance>;
    [CollectionId.PlayerProgresses]: CachedCollection<PlayerProgress>;
  };

  constructor(db: Db | undefined) {
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

  getCollection<TId extends CollectionId, TObj extends CollectionIdToType<TId>>(
    id: TId
  ): CachedCollection<TObj> {
    return this.collections[id] as unknown as CachedCollection<TObj>;
  }
}

const getCollectionManager = (db: Db | undefined) =>
  getSingleton("collectionManager", () => new CollectionManager(db));

export default getCollectionManager;
