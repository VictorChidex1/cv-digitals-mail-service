import type { CorsOptions } from "cors";
import type { NextFunction, Request, Response } from "express";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

export const EXPOSED_HEADERS = [
  "x-request-id",
  "retry-after",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
];

/**
 * Explicit origin policy. Requests with no Origin (curl, server-to-server) are
 * allowed to proceed; requests carrying an Origin only receive CORS headers if
 * that origin is on the allowlist.
 */
export function createCorsOptions(origins: string[]): CorsOptions {
  return {
    origin(origin, callback) {
      if (origin === undefined) {
        callback(null, false);
        return;
      }
      callback(null, origins.includes(origin));
    },
    methods: ALLOWED_METHODS,
    allowedHeaders: ["authorization", "content-type"],
    exposedHeaders: EXPOSED_HEADERS,
    credentials: false,
    maxAge: 600,
  };
}

/**
 * Defense in depth for state-changing requests. CORS is enforced by browsers,
 * not servers: without this guard a disallowed origin can still reach the API.
 */
export function createOriginGuard(origins: string[]) {
  const allowed = new Set(origins);

  return function originGuard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const method = req.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      next();
      return;
    }

    const origin = req.header("origin");
    if (origin !== undefined && !allowed.has(origin)) {
      res.status(403).json({
        error: "origin_not_allowed",
        requestId: String(res.locals["requestId"] ?? ""),
      });
      return;
    }

    next();
  };
}
