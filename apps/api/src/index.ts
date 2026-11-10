import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { openDatabase } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { initFirebaseAdmin } from "./lib/firebase-admin.js";
import { createHealthRouter } from "./routes/health.js";

/**
 * Open the database and bring its schema up to date before serving. A failure
 * here aborts startup on purpose: serving requests against a stale or newer
 * schema is worse than not serving at all.
 */
const database = openDatabase(env.databasePath);
const appliedMigrations = runMigrations(database);

initFirebaseAdmin();

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.webOrigin,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/health", createHealthRouter({ database, appliedMigrations }));

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

const server = app.listen(env.port, env.host, () => {
  console.log(`[api] listening on http://${env.host}:${env.port}`);
  console.log(`[api] database: ${database.path} (${appliedMigrations} migration(s))`);
  console.log(
    `[api] firebase auth emulator: ${env.firebaseAuthEmulatorHost ?? "not configured"}`,
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
