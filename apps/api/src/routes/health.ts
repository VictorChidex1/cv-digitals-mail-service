import { Router } from "express";

import { env } from "../config/env.js";
import type { DatabaseHandle } from "../db/client.js";

export interface HealthDependencies {
  database: DatabaseHandle;
  appliedMigrations: number;
}

/**
 * Liveness/readiness summary. Contains no secrets, credentials, or absolute
 * file paths.
 */
export function createHealthRouter(deps: HealthDependencies): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    let status: "ok" | "error" = "ok";
    try {
      deps.database.sqlite.prepare("SELECT 1").get();
    } catch {
      status = "error";
    }

    res.status(status === "ok" ? 200 : 503).json({
      status,
      service: "cv-digitals-mail-api",
      version: "0.1.0",
      environment: env.nodeEnv,
      database: {
        status,
        migrations: deps.appliedMigrations,
      },
      firebase: {
        projectId: env.firebaseProjectId,
        authEmulator: env.firebaseAuthEmulatorHost !== undefined,
      },
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
