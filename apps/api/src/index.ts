import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { initFirebaseAdmin } from "./lib/firebase-admin.js";
import { healthRouter } from "./routes/health.js";

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

app.use("/health", healthRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

const server = app.listen(env.port, env.host, () => {
  console.log(`[api] listening on http://${env.host}:${env.port}`);
  console.log(
    `[api] firebase auth emulator: ${env.firebaseAuthEmulatorHost ?? "not configured"}`,
  );
});

function shutdown(signal: string): void {
  console.log(`[api] ${signal} received, closing server`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
