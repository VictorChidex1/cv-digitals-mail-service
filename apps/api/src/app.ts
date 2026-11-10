import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import {
  createRequireAuth,
  type AuthDependencies,
} from "./auth/require-auth.js";
import { env } from "./config/env.js";
import type { DatabaseHandle } from "./db/client.js";
import { createCorsOptions, createOriginGuard } from "./http/cors.js";
import { errorHandler, notFoundHandler } from "./http/errors.js";
import { httpLogger } from "./http/logger.js";
import { createRateLimiter } from "./http/rate-limit.js";
import { requestId } from "./http/request-id.js";
import { createAuthRouter } from "./routes/auth.js";
import { createHealthRouter } from "./routes/health.js";
import { createIndexRouter } from "./routes/index.js";

export interface AppDependencies {
  database: DatabaseHandle;
  appliedMigrations: number;
  auth: AuthDependencies;
}

/**
 * Builds the Express app without binding a port, so tests can mount it directly.
 *
 * Order matters: identity of the request first, then security headers and origin
 * policy, then body parsing, then throttling, then routes, then error handling.
 */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", false);

  app.use(requestId);
  app.use(httpLogger());
  app.use(helmet());

  app.use(cors(createCorsOptions(env.webOrigins)));
  app.use(createOriginGuard(env.webOrigins));

  app.use(express.json({ limit: "1mb", strict: true }));

  // Health is mounted before the limiter: monitors must never be throttled.
  app.use(
    "/health",
    createHealthRouter({
      database: deps.database,
      appliedMigrations: deps.appliedMigrations,
    }),
  );

  app.use(
    createRateLimiter({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMax,
    }),
  );

  app.use(createIndexRouter());

  const requireAuth = createRequireAuth(deps.auth);

  app.use("/auth", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(
    "/auth",
    createRateLimiter({
      windowMs: env.rateLimitWindowMs,
      max: env.authRateLimitMax,
    }),
    requireAuth,
    createAuthRouter(),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
