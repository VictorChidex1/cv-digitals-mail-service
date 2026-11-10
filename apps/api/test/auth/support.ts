import type { Express } from "express";

import { createApp } from "../../src/app.js";
import { createAllowlist } from "../../src/auth/allowlist.js";
import type {
  VerifiedIdentity,
  VerifyToken,
} from "../../src/auth/verify-token.js";
import { openDatabase } from "../../src/db/client.js";
import { runMigrations } from "../../src/db/migrate.js";

export const OPERATOR: VerifiedIdentity = {
  uid: "uid-operator",
  email: "operator@example.test",
  emailVerified: true,
  provider: "password",
  token: { uid: "uid-operator" } as VerifiedIdentity["token"],
};

export const OUTSIDER: VerifiedIdentity = {
  uid: "uid-outsider",
  email: "outsider@example.test",
  emailVerified: true,
  provider: "google.com",
  token: { uid: "uid-outsider" } as VerifiedIdentity["token"],
};

export interface TestAppOptions {
  verifyToken?: VerifyToken;
  allowedEmails?: string[];
  allowedUids?: string[];
}

export function buildTestApp(options: TestAppOptions = {}): {
  app: Express;
  close: () => void;
} {
  const database = openDatabase(":memory:");
  const appliedMigrations = runMigrations(database);

  const verifyToken: VerifyToken =
    options.verifyToken ??
    (async (token) => {
      if (token === "valid-token") return OPERATOR;
      if (token === "outsider-token") return OUTSIDER;
      throw new Error("invalid token");
    });

  const allowlist = createAllowlist({
    emails: options.allowedEmails ?? [OPERATOR.email ?? ""],
    uids: options.allowedUids ?? [],
  });

  const app = createApp({
    database,
    appliedMigrations,
    auth: { verifyToken, allowlist },
  });

  return { app, close: () => database.close() };
}
