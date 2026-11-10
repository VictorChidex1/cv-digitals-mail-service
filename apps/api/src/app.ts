import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import type { AuthDependencies } from "./auth/require-auth.js";
import { createRequireAuth } from "./auth/require-auth.js";
import { env } from "./config/env.js";
import type { DatabaseHandle } from "./db/client.js";
import { createAuthRouter } from "./routes/auth.js";
import { createHealthRouter } from "./routes/health.js";

export interface AppDependencies {
  database: DatabaseHandle;
  appliedMigrations: number;
  auth: AuthDependencies;
}

/**
 * Builds the Express app without binding a port, so tests can mount it directly.
 *
 * Route policy:
 * - GET /health   public (liveness must not require a token)
 * - /auth/*       protected: valid token (401), allowlisted identity (403)
 */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.webOrigins,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.use(
    "/health",
    createHealthRouter({
      database: deps.database,
      appliedMigrations: deps.appliedMigrations,
    }),
  );

  const requireAuth = createRequireAuth(deps.auth);
  app.use("/auth", requireAuth, createAuthRouter());

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  return app;
}
