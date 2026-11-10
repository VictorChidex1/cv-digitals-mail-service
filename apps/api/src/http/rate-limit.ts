import type { NextFunction, Request, Response } from "express";

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  /** Injectable clock, so tests do not have to sleep. */
  now?: () => number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_BUCKETS = 10_000;

/**
 * Fixed-window, in-memory limiter keyed by client IP.
 *
 * Deliberate scope: one local process, one user. A shared store (Redis) would be
 * needed for multiple instances — which this project explicitly does not run.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();
  const now = options.now ?? Date.now;

  return function rateLimit(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const key = req.ip ?? "unknown";
    const current = now();

    let bucket = buckets.get(key);
    if (bucket === undefined || bucket.resetAt <= current) {
      bucket = { count: 0, resetAt: current + options.windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, options.max - bucket.count);

    res.setHeader("X-RateLimit-Limit", String(options.max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));

    if (bucket.count > options.max) {
      const retryAfter = Math.max(
        1,
        Math.ceil((bucket.resetAt - current) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({
        error: "rate_limited",
        requestId: String(res.locals["requestId"] ?? ""),
      });
      return;
    }

    if (buckets.size > MAX_BUCKETS) {
      for (const [bucketKey, candidate] of buckets) {
        if (candidate.resetAt <= current) buckets.delete(bucketKey);
      }
    }

    next();
  };
}
