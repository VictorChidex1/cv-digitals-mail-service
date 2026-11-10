import cors from "cors";
import express from "express";
import { describe, expect, it } from "vitest";

import { createCorsOptions, createOriginGuard } from "../../src/http/cors.js";
import { errorHandler, notFoundHandler } from "../../src/http/errors.js";
import { requestId } from "../../src/http/request-id.js";
import { withServer } from "../http.js";

const ALLOWED = "http://allowed.test";

function buildApp() {
  const app = express();
  app.use(requestId);
  app.use(cors(createCorsOptions([ALLOWED])));
  app.use(createOriginGuard([ALLOWED]));
  app.get("/x", (_req, res) => {
    res.json({ ok: true });
  });
  app.post("/x", (_req, res) => {
    res.json({ ok: true });
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("CORS and origin policy", () => {
  const app = buildApp();

  it("allows an allowlisted origin", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/x`, {
        headers: { origin: ALLOWED },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("access-control-allow-origin")).toBe(ALLOWED);
    });
  });

  it("does not grant CORS headers to an unknown origin", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/x`, {
        headers: { origin: "http://evil.test" },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("access-control-allow-origin")).toBeNull();
    });
  });

  it("answers a preflight request for an allowlisted origin", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/x`, {
        method: "OPTIONS",
        headers: {
          origin: ALLOWED,
          "access-control-request-method": "GET",
          "access-control-request-headers": "authorization",
        },
      });

      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-origin")).toBe(ALLOWED);
    });
  });

  it("rejects a state-changing request from a disallowed origin", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/x`, {
        method: "POST",
        headers: { origin: "http://evil.test" },
      });

      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        error: "origin_not_allowed",
      });
    });
  });

  it("allows state-changing requests with no Origin (CLI, server-to-server)", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/x`, { method: "POST" });
      expect(response.status).toBe(200);
    });
  });
});
