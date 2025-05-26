import { ObjectId } from "bson";
import {
  canCreateAccount,
  createAccount,
  hashPassword,
  signIn,
  verifyPassword,
} from "lib/auth";
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

describe(canCreateAccount.name, () => {
  test("returns true for valid email and username", async () => {
    const collectionManager = new CollectionManager(undefined);
    const email = "test@test.com";
    const username = "testuser";

    const result = await canCreateAccount(collectionManager, email, username);

    expect(result).toBe(true);
  });

  test("returns error message for invalid email", async () => {
    const collectionManager = new CollectionManager(undefined);
    const email = "invalid-email";
    const username = "testuser";

    const result = await canCreateAccount(collectionManager, email, username);

    expect((result as string).toLowerCase()).toContain("email");
  });

  test("returns error message for existing email", async () => {
    const collectionManager = new CollectionManager(undefined);
    const email = "test@test.com";
    const username = "testuser";

    await collectionManager
      .getCollection(CollectionId.Accounts)
      .upsert({ email, username, password: "password" } as Account);

    const result = await canCreateAccount(collectionManager, email, username);

    expect((result as string).toLowerCase()).toContain("email");
  });

  test("returns error message for existing username", async () => {
    const collectionManager = new CollectionManager(undefined);
    const email = "test@test.com";
    const username = "testuser";

    await collectionManager
      .getCollection(CollectionId.Accounts)
      .upsert({ email, username, password: "password" } as Account);

    const result = await canCreateAccount(collectionManager, email, username);

    expect((result as string).toLowerCase()).toContain("username");
  });
});

describe(createAccount.name, () => {
  function getAccount() {
    return {
      email: "test@test.com",
      username: "testuser",
      password: "password",
    };
  }

  test("creates a new account with valid data", async () => {
    const collectionManager = new CollectionManager(undefined);

    const template = getAccount();

    const account = await createAccount(
      collectionManager,
      template.email,
      template.username,
      template.password
    );

    expect(account).not.toBeInstanceOf(String); // Should not be an error message
    expect((account as Account).email).toBe(template.email);
    expect((account as Account).username).toBe(template.username);
    expect((account as Account).password).not.toBe(template.password); // Password should be hashed
  });

  test("returns an error message for existing email", async () => {
    const collectionManager = new CollectionManager(undefined);
    const template = getAccount();

    await createAccount(
      collectionManager,
      template.email,
      template.username,
      template.password
    );

    const result = await createAccount(
      collectionManager,
      template.email,
      template.username + "1",
      template.password
    );

    expect((result as string).toLowerCase()).toContain("email");
  });

  test("returns an error message for existing username", async () => {
    const collectionManager = new CollectionManager(undefined);
    const template = getAccount();

    await createAccount(
      collectionManager,
      template.email,
      template.username,
      template.password
    );

    const result = await createAccount(
      collectionManager,
      "other@test.com",
      template.username,
      template.password
    );

    expect((result as string).toLowerCase()).toContain("username");
  });

  test("returns an error message for invalid email format", async () => {
    const collectionManager = new CollectionManager(undefined);
    const template = getAccount();

    const result = await createAccount(
      collectionManager,
      "invalid-email",
      template.username,
      template.password
    );

    expect((result as string).toLowerCase()).toContain("email");
  });

  test("returns an error message for invalid username", async () => {
    const collectionManager = new CollectionManager(undefined);
    const template = getAccount();

    const result = await createAccount(
      collectionManager,
      template.email,
      "invalid username",
      template.password
    );

    expect((result as string).toLowerCase()).toContain("username");
  });

  test("does not allow HTML tags in username", async () => {
    const collectionManager = new CollectionManager(undefined);
    const template = getAccount();

    const result = await createAccount(
      collectionManager,
      template.email,
      "<script>alert('test')</script>",
      template.password
    );

    expect((result as string).toLowerCase()).toContain("username");
  });

  test("adds the account to the database", async () => {
    const collectionManager = new CollectionManager(undefined);
    const template = getAccount();

    const created = await createAccount(
      collectionManager,
      template.email,
      template.username,
      template.password
    );
    const accounts = await collectionManager
      .getCollection(CollectionId.Accounts)
      .find(undefined, { email: template.email });

    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toEqual(created);
  });
});
