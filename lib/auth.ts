import argon2 from "argon2";
import Account from "./types/Account";
import { ObjectId } from "bson";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}

/**
 * Does not actually add the account to the database.
 */
export async function createAccount(
  email: string,
  username: string,
  password: string
): Promise<Account> {
  const hashedPassword = await hashPassword(password);

  return {
    _id: new ObjectId(),
    email,
    username,
    password: hashedPassword,
    createdAt: new Date(),
    playerProgresses: [],
  };
}
