import { Router } from "express";

import { env } from "../config/env.js";

export const healthRouter = Router();

/**
 * Liveness/readiness summary. Deliberately contains no secrets and no
 * credentials, per the project security rules.
 */
healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "cv-digitals-mail-api",
    version: "0.1.0",
    environment: env.nodeEnv,
    firebase: {
      projectId: env.firebaseProjectId,
      authEmulator: env.firebaseAuthEmulatorHost !== undefined,
    },
    timestamp: new Date().toISOString(),
  });
});
