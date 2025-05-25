import { ObjectId } from "bson";
import { hashPassword, signIn, verifyPassword } from "lib/auth";
import { CollectionManager } from "lib/getCollectionManager";
import { SessionManager } from "lib/SessionManager";
import Account from "lib/types/Account";
import CollectionId from "lib/types/CollectionId";

describe(hashPassword.name, () => {
  test("produces a hash that is not the same as the password", async () => {
    const password = "password";
    const hash = await hashPassword(password);
    expect(hash).not.toEqual(password);
  });

  test("different passwords produce different hashes", async () => {
    const password1 = "password1";
    const password2 = "password2";
    const hash1 = await hashPassword(password1);
    const hash2 = await hashPassword(password2);
    expect(hash1).not.toEqual(hash2);
  });
});

describe(verifyPassword.name, () => {
  test("returns true for correct password", async () => {
    const password = "password";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  test("returns false for incorrect password", async () => {
    const password = "password";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword("wrongpassword", hash);
    expect(isValid).toBe(false);
  });
});

describe(signIn.name, () => {
  const VALID_PASSWORD = "password";

  async function getTestAccount() {
    return {
      _id: new ObjectId(),
      email: "test@test.com",
      username: "testuser",
      password: await hashPassword(VALID_PASSWORD),
      createdAt: new Date(),
      playerProgresses: [],
    } as Account;
  }

  test("returns a session ID for valid credentials", async () => {
    const collectionManager = new CollectionManager(undefined);
    const sessionManager = new SessionManager();

    const user = await getTestAccount();

    collectionManager.getCollection(CollectionId.Accounts).upsert(user);

    const sessionId = await signIn(
      collectionManager,
      sessionManager,
      user.email,
      VALID_PASSWORD
    );

    expect(sessionId).toBeInstanceOf(ObjectId);
  });

  test("returns null for invalid credentials", async () => {
    const collectionManager = new CollectionManager(undefined);
    const sessionManager = new SessionManager();

    const user = await getTestAccount();

    collectionManager.getCollection(CollectionId.Accounts).upsert(user);

    const sessionId = await signIn(
      collectionManager,
      sessionManager,
      user.email,
      "wrongpassword"
    );

    expect(sessionId).toBeNull();
  });

  test("adds a new session for valid sign-in", async () => {
    const collectionManager = new CollectionManager(undefined);
    const sessionManager = new SessionManager();

    const user = await getTestAccount();

    collectionManager.getCollection(CollectionId.Accounts).upsert(user);

    const sessionId = await signIn(
      collectionManager,
      sessionManager,
      user.email,
      VALID_PASSWORD
    );

    expect(sessionId).toBeDefined();
    expect(sessionManager.getSession(sessionId!)).toBeDefined();
  });

  test("does not create a session for invalid sign-in", async () => {
    const collectionManager = new CollectionManager(undefined);
    const sessionManager = new SessionManager();

    const user = await getTestAccount();

    collectionManager.getCollection(CollectionId.Accounts).upsert(user);

    const sessionId = await signIn(
      collectionManager,
      sessionManager,
      user.email,
      "wrongpassword"
    );

    expect(sessionId).toBeNull();
    expect(sessionManager.getSession(sessionId!)).toBeUndefined();
  });
});
