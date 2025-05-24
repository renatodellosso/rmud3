import argon2 from "argon2";
import Account from "./types/Account";
import { ObjectId } from "bson";
import { CollectionManager } from "./getCollectionManager";
import CollectionId from "./types/CollectionId";
import { SessionManager } from "./SessionManager";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}

export async function canCreateAccount(
  collectionManager: CollectionManager,
  email: string,
  username: string
) {
  if (email.length < 5 || username.length < 3) {
    return false;
  }

  if (username.length > 20 || email.length > 50) {
    return false;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return false;
  }

  if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
    return false;
  }

  const existingAccounts = await collectionManager
    .getCollection<Account>(CollectionId.Accounts)
    .find({ $or: [{ email }, { username }] });

  return existingAccounts.length === 0;
}

export async function createAccount(
  collectionManager: CollectionManager,
  email: string,
  username: string,
  password: string
): Promise<Account | null> {
  if (!(await canCreateAccount(collectionManager, email, username))) {
    return null;
  }

  const accountCollection = collectionManager.getCollection<Account>(
    CollectionId.Accounts
  );

  const hashedPassword = await hashPassword(password);

  const account: Account = {
    _id: new ObjectId(),
    email,
    username,
    password: hashedPassword,
    createdAt: new Date(),
    playerProgresses: [],
  };

  await accountCollection.upsert(account);

  return account;
}

export async function signIn(
  collectionManager: CollectionManager,
  sessionManager: SessionManager,
  email: string,
  password: string
): Promise<ObjectId | null> {
  const accountCollection = collectionManager.getCollection<Account>(
    CollectionId.Accounts
  );

  const accounts = await accountCollection.find({ email });

  if (accounts.length === 0) {
    return null;
  }

  const account = accounts[0];

  const isValidPassword = await verifyPassword(password, account.password);

  if (!isValidPassword) {
    return null;
  }

  accountCollection.setInCache(account._id, account);

  const sessionId = sessionManager.createSession(account._id);
  return sessionId._id;
}
