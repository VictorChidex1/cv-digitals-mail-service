import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { Express } from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import { createAllowlist } from "../../src/auth/allowlist.js";
import { createFirebaseTokenVerifier } from "../../src/auth/verify-token.js";
import { openDatabase, type DatabaseHandle } from "../../src/db/client.js";
import { runMigrations } from "../../src/db/migrate.js";
import { withServer } from "../http.js";

const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const projectId = process.env.FIREBASE_PROJECT_ID ?? "cv-digitals-mail-dev";

const OPERATOR_EMAIL = "emulator-operator@example.test";
const OUTSIDER_EMAIL = "emulator-outsider@example.test";
const PASSWORD = "Password123!";
const API_KEY = "fake-api-key";

const describeWithEmulator =
  emulatorHost === undefined ? describe.skip : describe;

async function signIn(email: string, password: string): Promise<string> {
  const response = await fetch(
    `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  const body = (await response.json()) as {
    idToken?: string;
    error?: { message?: string };
  };

  if (!response.ok || body.idToken === undefined) {
    throw new Error(`emulator sign-in failed: ${body.error?.message ?? response.status}`);
  }

  return body.idToken;
}

describeWithEmulator("Firebase Auth emulator integration", () => {
  let operatorUid = "";
  let outsiderUid = "";
  let database: DatabaseHandle;
  let app: Express;

  beforeAll(async () => {
    if (getApps().length === 0) {
      initializeApp({ projectId });
    }

    const auth = getAuth();
    for (const email of [OPERATOR_EMAIL, OUTSIDER_EMAIL]) {
      try {
        const existing = await auth.getUserByEmail(email);
        await auth.deleteUser(existing.uid);
      } catch {
        // Not present; nothing to remove.
      }
    }

    operatorUid = (
      await auth.createUser({
        email: OPERATOR_EMAIL,
        password: PASSWORD,
        emailVerified: true,
      })
    ).uid;

    outsiderUid = (
      await auth.createUser({
        email: OUTSIDER_EMAIL,
        password: PASSWORD,
        emailVerified: true,
      })
    ).uid;

    database = openDatabase(":memory:");
    const appliedMigrations = runMigrations(database);

    app = createApp({
      database,
      appliedMigrations,
      auth: {
        verifyToken: createFirebaseTokenVerifier(false),
        allowlist: createAllowlist({
          emails: [OPERATOR_EMAIL],
          uids: [],
        }),
      },
    });
  });

  afterAll(async () => {
    database?.close();
    const auth = getAuth();
    for (const uid of [operatorUid, outsiderUid]) {
      if (uid === "") continue;
      try {
        await auth.deleteUser(uid);
      } catch {
        // Already gone.
      }
    }
  });

  it("accepts a real emulator-issued ID token and derives identity from it", async () => {
    const idToken = await signIn(OPERATOR_EMAIL, PASSWORD);

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { authorization: `Bearer ${idToken}` },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        uid: operatorUid,
        email: OPERATOR_EMAIL,
        provider: "password",
      });
    });
  });

  it("rejects a syntactically invalid token", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { authorization: "Bearer not-a-real-token" },
      });
      expect(response.status).toBe(401);
    });
  });

  it("rejects a valid token whose identity is not allowlisted", async () => {
    const idToken = await signIn(OUTSIDER_EMAIL, PASSWORD);

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { authorization: `Bearer ${idToken}` },
      });
      expect(response.status).toBe(403);
    });
  });

  it("rejects wrong credentials at the emulator (invalid credentials path)", async () => {
    await expect(signIn(OPERATOR_EMAIL, "wrong-password")).rejects.toThrow(
      /emulator sign-in failed/i,
    );
  });
});
