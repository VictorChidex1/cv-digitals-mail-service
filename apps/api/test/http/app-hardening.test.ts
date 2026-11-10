import { afterAll, describe, expect, it } from "vitest";

import { buildTestApp } from "../auth/support.js";
import { withServer } from "../http.js";

const { app, close } = buildTestApp();
afterAll(close);

describe("app hardening", () => {
  it("never issues cookies (no CSRF surface)", async () => {
    await withServer(app, async (baseUrl) => {
      const responses = await Promise.all([
        fetch(`${baseUrl}/health`),
        fetch(`${baseUrl}/auth/me`),
        fetch(`${baseUrl}/`),
      ]);

      for (const response of responses) {
        expect(response.headers.get("set-cookie")).toBeNull();
      }
    });
  });

  it("marks protected responses as non-cacheable", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { authorization: "Bearer valid-token" },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
    });
  });

  it("creates a request id on every response", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/`);
      expect(response.headers.get("x-request-id")?.length).toBeGreaterThan(8);
    });
  });

  it("does not throttle health checks", async () => {
    await withServer(app, async (baseUrl) => {
      for (let attempt = 0; attempt < 125; attempt += 1) {
        const response = await fetch(`${baseUrl}/health`);
        expect(response.status).toBe(200);
      }
    });
  });

  it("throttles protected routes separately and more strictly", async () => {
    await withServer(app, async (baseUrl) => {
      let lastStatus = 0;
      let retryAfter: string | null = null;

      for (let attempt = 0; attempt < 31; attempt += 1) {
        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: { authorization: "Bearer valid-token" },
        });
        lastStatus = response.status;
        if (response.status === 429) {
          retryAfter = response.headers.get("retry-after");
          break;
        }
      }

      expect(lastStatus).toBe(429);
      expect(retryAfter).not.toBeNull();
    });
  });
});
