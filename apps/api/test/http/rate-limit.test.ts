import express from "express";
import { describe, expect, it } from "vitest";

import { errorHandler, notFoundHandler } from "../../src/http/errors.js";
import {
  createRateLimiter,
  type RateLimitOptions,
} from "../../src/http/rate-limit.js";
import { requestId } from "../../src/http/request-id.js";
import { withServer } from "../http.js";

function buildApp(options: RateLimitOptions) {
  const app = express();
  app.use(requestId);
  app.use(createRateLimiter(options));
  app.get("/x", (_req, res) => {
    res.json({ ok: true });
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("rate limiting", () => {
  it("allows up to the limit, then returns 429 with Retry-After", async () => {
    const app = buildApp({ windowMs: 60_000, max: 2 });

    await withServer(app, async (baseUrl) => {
      expect((await fetch(`${baseUrl}/x`)).status).toBe(200);
      expect((await fetch(`${baseUrl}/x`)).status).toBe(200);

      const limited = await fetch(`${baseUrl}/x`);
      expect(limited.status).toBe(429);
      expect(limited.headers.get("retry-after")).toBeTruthy();
      expect(await limited.json()).toMatchObject({ error: "rate_limited" });
    });
  });

  it("resets after the window elapses", async () => {
    let current = 0;
    const app = buildApp({
      windowMs: 1_000,
      max: 1,
      now: () => current,
    });

    await withServer(app, async (baseUrl) => {
      expect((await fetch(`${baseUrl}/x`)).status).toBe(200);
      expect((await fetch(`${baseUrl}/x`)).status).toBe(429);

      current += 1_000;
      expect((await fetch(`${baseUrl}/x`)).status).toBe(200);
    });
  });

  it("reports remaining requests in headers", async () => {
    const app = buildApp({ windowMs: 60_000, max: 3 });

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/x`);
      expect(response.headers.get("x-ratelimit-limit")).toBe("3");
      expect(response.headers.get("x-ratelimit-remaining")).toBe("2");
    });
  });
});
