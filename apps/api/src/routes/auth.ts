import { Router } from "express";

import { getIdentity } from "../auth/require-auth.js";

/**
 * Mounted behind requireAuth. Everything returned here comes from the verified
 * token, never from the request.
 */
export function createAuthRouter(): Router {
  const router = Router();

  router.get("/me", (_req, res) => {
    const identity = getIdentity(res);

    res.json({
      uid: identity.uid,
      email: identity.email,
      emailVerified: identity.emailVerified,
      provider: identity.provider,
    });
  });

  return router;
}
