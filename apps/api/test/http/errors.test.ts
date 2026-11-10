import express from "express";
import { describe, expect, it } from "vitest";

import {
  AppError,
  errorHandler,
  notFoundHandler,
} from "../../src/http/errors.js";
import { requestId } from "../../src/http/request-id.js";
import { withServer } from "../http.js";

function buildApp() {
  const app = express();
  app.use(requestId);
  app.use(express.json({ limit: "1mb" }));

  app.get("/boom", () => {
    throw new AppError(418, "teapot");
  });
  app.get("/explode", () => {
    throw new Error("database exploded at /secret/path");
  });
  app.post("/echo", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

describe("error handling", () => {
  const app = buildApp();

  it("returns a structured 404 with a request id", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/missing`);
      const body = (await response.json()) as {
        error: string;
        requestId: string;
      };

      expect(response.status).toBe(404);
      expect(body.error).toBe("not_found");
      expect(body.requestId.length).toBeGreaterThan(0);
      expect(response.headers.get("x-request-id")).toBe(body.requestId);
    });
  });

  it("maps AppError to its status and code", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/boom`);
      expect(response.status).toBe(418);
      expect(await response.json()).toMatchObject({ error: "teapot" });
    });
  });

  it("hides internal error details from clients", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/explode`);
      const text = await response.text();

      expect(response.status).toBe(500);
      expect(text).toContain("internal_error");
      expect(text).not.toContain("database exploded");
      expect(text).not.toContain("/secret/path");
    });
  });

  it("returns 400 for malformed JSON", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/echo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{ not valid json",
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: "invalid_json" });
    });
  });

  it("returns 413 for an oversized body", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/echo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: "x".repeat(1_100_000) }),
      });

      expect(response.status).toBe(413);
      expect(await response.json()).toMatchObject({
        error: "payload_too_large",
      });
    });
  });

  it("accepts a client-supplied safe request id", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/missing`, {
        headers: { "x-request-id": "client-supplied-id-123" },
      });

      expect(response.headers.get("x-request-id")).toBe("client-supplied-id-123");
    });
  });
});
