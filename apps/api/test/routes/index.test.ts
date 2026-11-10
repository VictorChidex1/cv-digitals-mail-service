import { afterAll, describe, expect, it } from "vitest";

import { buildTestApp } from "../auth/support.js";
import { withServer } from "../http.js";

const { app, close } = buildTestApp();
afterAll(close);

describe("API index", () => {
  it("describes the service and its endpoints at /", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/`);
      expect(response.status).toBe(200);

      const body = (await response.json()) as {
        service: string;
        endpoints: Record<string, string>;
      };

      expect(body.service).toBe("cv-digitals-mail-api");
      expect(Object.keys(body.endpoints)).toEqual(
        expect.arrayContaining(["GET /health", "GET /auth/me"]),
      );
    });
  });

  it("still returns 404 for unknown paths", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/banana`);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "not_found" });
    });
  });
});
