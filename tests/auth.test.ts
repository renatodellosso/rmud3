import { hashPassword, verifyPassword } from "lib/auth";

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
