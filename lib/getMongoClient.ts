import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import { getSingleton } from "./utils";

export async function getMongoClient(): Promise<Db> {
  return getSingleton<Db>("mongoDb", async () => {
    dotenv.config();

    const client: MongoClient = new MongoClient(process.env.MONGODB_URI!);

    await client.connect();

    const db: Db = client.db(process.env.DB_NAME);

    return db;
  });
}
