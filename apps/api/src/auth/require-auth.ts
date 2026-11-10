import type { NextFunction, Request, Response } from "express";

import type { VerifiedIdentity, VerifyToken } from "./verify-token.js";

export interface AuthDependencies {
  verifyToken: VerifyToken;
  allowlist: {
    allows(identity: VerifiedIdentity): boolean;
  };
}

function bearerToken(header: string | undefined): string | null {
  if (header === undefined) return null;

  const parts = header.split(" ");
  if (parts.length !== 2) return null;

  const [scheme, token] = parts;
  if (scheme?.toLowerCase() !== "bearer") return null;
  if (token === undefined || token.length === 0) return null;

  return token;
}

/**
 * Reads the identity attached by requireAuth. Throws rather than returning
 * undefined so a misconfigured route fails loudly instead of running anonymously.
 */
export function getIdentity(res: Response): VerifiedIdentity {
  const identity = res.locals["auth"] as VerifiedIdentity | undefined;
  if (identity === undefined) {
    throw new Error("getIdentity called on a route that is not authenticated");
  }
  return identity;
}

/**
 * Protected routes: a valid token is required (401), and the identity must be on
 * the allowlist (403). Client-supplied identifiers (headers, body, query) are
 * never read.
 */
export function createRequireAuth(deps: AuthDependencies) {
  return async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = bearerToken(req.header("authorization"));

    if (token === null) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    let identity: VerifiedIdentity;
    try {
      identity = await deps.verifyToken(token);
    } catch {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    if (!deps.allowlist.allows(identity)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }

    res.locals["auth"] = identity;
    next();
  };
}
