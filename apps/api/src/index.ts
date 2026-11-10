import "dotenv/config";

import { createAllowlist } from "./auth/allowlist.js";
import { createFirebaseTokenVerifier } from "./auth/verify-token.js";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import {
  assertEnvironmentSeparation,
  assertLoopbackBinding,
  environmentWarnings,
} from "./config/environment.js";
import { openDatabase } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { logger } from "./http/logger.js";
import { initFirebaseAdmin } from "./lib/firebase-admin.js";

assertEnvironmentSeparation(env);
assertLoopbackBinding(env.host, env.allowNonLoopback);

for (const warning of environmentWarnings(env)) {
  logger.warn(warning);
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
  logger.info(
    {
      host: env.host,
      port: env.port,
      migrations: appliedMigrations,
      authEmulator: env.firebaseAuthEmulatorHost !== undefined,
      allowlistConfigured: allowlist.isConfigured,
    },
    "api listening",
  );
});

function shutdown(signal: string): void {
  logger.info({ signal }, "shutting down");
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
