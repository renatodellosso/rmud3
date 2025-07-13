import argon2 from "argon2";
import Account, { getRandomDiscordLinkCode } from "./types/Account";
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

/**
 * @returns true if the account can be created, or an error message if it cannot.
 */
export async function canCreateAccount(
  collectionManager: CollectionManager,
  email: string,
  username: string
) {
  if (email.length < 5 || username.length < 3) {
    return "Email and username must be at least 5 and 3 characters long, respectively.";
  }

  if (username.length > 20 || email.length > 50) {
    return "Email and username must be at most 50 and 20 characters long, respectively.";
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores.";
  }

  if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
    return "Email is not valid.";
  }

  const collection = collectionManager.getCollection(CollectionId.Accounts);

  const existingAccounts = (
    await collection.find({ $or: [{ email }, { username }] }, undefined)
  )
    .concat(await collection.find(undefined, { email }))
    .concat(await collection.find(undefined, { username }));

  return existingAccounts.length === 0
    ? true
    : "Email or username already exists.";
}

/**
 * @returns the account if it was created, or an error message if it was not.
 */
export async function createAccount(
  collectionManager: CollectionManager,
  email: string,
  username: string,
  password: string
): Promise<Account | string> {
  const canCreate = await canCreateAccount(collectionManager, email, username);
  if (canCreate !== true) {
    return canCreate;
  }

  const accountCollection = collectionManager.getCollection(
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
    discordLinkCode: getRandomDiscordLinkCode(),
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
  const accountCollection = collectionManager.getCollection(
    CollectionId.Accounts
  );

  const accounts = await accountCollection.findWithOneFilter({ email });

  if (accounts.length === 0) {
    return null;
  }

  const account = accounts[0];

  const isValidPassword = await verifyPassword(password, account.password);

  if (!isValidPassword) {
    return null;
  }

  accountCollection.setInCache(account._id, account);

  if (!account.discordLinkCode) {
    account.discordLinkCode = getRandomDiscordLinkCode();
    await accountCollection.upsert(account);
  }

  const session = sessionManager.createSession(account._id);
  return session._id;
}
