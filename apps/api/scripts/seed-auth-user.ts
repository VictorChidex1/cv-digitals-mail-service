import "dotenv/config";

import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { env } from "../src/config/env.js";

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

const email = process.env.SEED_AUTH_EMAIL ?? "operator@cvdigitals.test";
const password = process.env.SEED_AUTH_PASSWORD ?? "Password123!";

if (getApps().length === 0) {
  initializeApp({ projectId: env.firebaseProjectId });
}

const auth = getAuth();

try {
  const existing = await auth.getUserByEmail(email);
  console.log(`[auth:seed] existing user ${existing.uid} <${email}>`);
} catch {
  const created = await auth.createUser({
    email,
    password,
    emailVerified: true,
  });
  console.log(`[auth:seed] created user ${created.uid} <${email}>`);
}
