import { Router } from "express";

/**
 * Human-readable index of the API surface. JSON only: this is documentation,
 * not a second UI.
 */
export function createIndexRouter(): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({
      service: "cv-digitals-mail-api",
      version: "0.1.0",
      description: "Local API for CV Digitals Mail",
      endpoints: {
        "GET /": "This index.",
        "GET /health": "Public. Liveness, database status, schema version.",
        "GET /auth/me": "Protected. Requires Authorization: Bearer <idToken>.",
      },
    });
  });

  return router;
}
