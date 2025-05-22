import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

export async function getMongoClient(): Promise<Db> {
  const mongoDb = (globalThis as any as { mongoDb: Db | undefined }).mongoDb;
  if (mongoDb) {
    return mongoDb;
  }

  dotenv.config();

  const client: MongoClient = new MongoClient(process.env.MONGODB_URI!);

  await client.connect();

  const db: Db = client.db(process.env.DB_NAME);

  return db;
}
