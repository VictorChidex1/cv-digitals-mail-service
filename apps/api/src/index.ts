import "dotenv/config";

import { createAllowlist } from "./auth/allowlist.js";
import { createFirebaseTokenVerifier } from "./auth/verify-token.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import {
  assertEnvironmentSeparation,
  environmentWarnings,
} from "./config/environment.js";
import { openDatabase } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { initFirebaseAdmin } from "./lib/firebase-admin.js";

assertEnvironmentSeparation(env);
for (const warning of environmentWarnings(env)) {
  console.warn(`[api] warning: ${warning}`);
}

/**
 * Open the database and bring its schema up to date before serving. A failure
 * here aborts startup on purpose: serving requests against a stale or newer
 * schema is worse than not serving at all.
 */
const database = openDatabase(env.databasePath);
const appliedMigrations = runMigrations(database);

initFirebaseAdmin();

const allowlist = createAllowlist({
  emails: env.authAllowedEmails,
  uids: env.authAllowedUids,
});

const app = createApp({
  database,
  appliedMigrations,
  auth: {
    verifyToken: createFirebaseTokenVerifier(false),
    allowlist,
  },
});

const server = app.listen(env.port, env.host, () => {
  console.log(`[api] listening on http://${env.host}:${env.port}`);
  console.log(
    `[api] database: ${database.path} (${appliedMigrations} migration(s))`,
  );
  console.log(
    `[api] firebase auth emulator: ${env.firebaseAuthEmulatorHost ?? "not configured"}`,
  );
  console.log(
    `[api] auth allowlist: ${allowlist.isConfigured ? "configured" : "EMPTY (all requests will be rejected)"}`,
  );
});

function shutdown(signal: string): void {
  console.log(`[api] ${signal} received, closing server`);
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
