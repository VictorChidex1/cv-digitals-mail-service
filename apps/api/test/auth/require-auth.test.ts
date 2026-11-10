import { afterAll, describe, expect, it } from "vitest";

import { buildTestApp } from "./support.js";
import { withServer } from "../http.js";

const { app, close } = buildTestApp();
afterAll(close);

describe("route protection", () => {
  it("serves /health without a token", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/health`);
      expect(response.status).toBe(200);
    });
  });

  it("rejects a request with no Authorization header", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`);
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ error: "unauthorized" });
    });
  });

  it("rejects a malformed Authorization header", async () => {
    const headers = ["Token abc", "Bearer", "Bearer ", "Basic abc", "Bearer a b"];
    await withServer(app, async (baseUrl) => {
      for (const authorization of headers) {
        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: { authorization },
        });
        expect(response.status, authorization).toBe(401);
      }
    });
  });

  it("rejects an invalid, expired, or revoked token", async () => {
    // The verifier rejecting models every failure mode the Admin SDK reports,
    // including expired and revoked tokens.
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { authorization: "Bearer expired-or-revoked" },
      });
      expect(response.status).toBe(401);
    });
  });

  it("returns 403 for a valid token that is not allowlisted", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { authorization: "Bearer outsider-token" },
      });
      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({ error: "forbidden" });
    });
  });

  it("returns the identity taken from the verified token", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { authorization: "Bearer valid-token" },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        uid: "uid-operator",
        email: "operator@example.test",
        emailVerified: true,
        provider: "password",
      });
    });
  });

  it("ignores client-supplied identifiers", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/auth/me?uid=evil&email=evil@example.test`, {
        headers: {
          authorization: "Bearer valid-token",
          "x-user-id": "evil",
          "x-firebase-uid": "evil",
        },
      });

      const body = (await response.json()) as { uid: string; email: string };
      expect(body.uid).toBe("uid-operator");
      expect(body.email).toBe("operator@example.test");
    });
  });
});
