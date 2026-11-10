import { describe, expect, it } from "vitest";

import { parseEnv } from "../../src/config/env.js";

describe("environment parsing", () => {
  it("applies safe defaults", () => {
    const env = parseEnv({});

    expect(env.port).toBe(4100);
    expect(env.host).toBe("127.0.0.1");
    expect(env.webOrigins).toEqual(["http://localhost:3000"]);
    expect(env.rateLimitWindowMs).toBe(60_000);
    expect(env.rateLimitMax).toBe(120);
    expect(env.authRateLimitMax).toBe(30);
    expect(env.allowNonLoopback).toBe(false);
  });

  it("splits comma-separated origins and allowlists", () => {
    const env = parseEnv({
      WEB_ORIGIN: "http://a.test, http://b.test",
      AUTH_ALLOWED_EMAILS: "a@example.test, b@example.test",
      AUTH_ALLOWED_UIDS: "uid-1,uid-2",
    });

    expect(env.webOrigins).toEqual(["http://a.test", "http://b.test"]);
    expect(env.authAllowedEmails).toEqual([
      "a@example.test",
      "b@example.test",
    ]);
    expect(env.authAllowedUids).toEqual(["uid-1", "uid-2"]);
  });

  it("rejects a non-numeric port and names the field", () => {
    expect(() => parseEnv({ PORT: "not-a-number" })).toThrow(/PORT/);
  });

  it("rejects an out-of-range port", () => {
    expect(() => parseEnv({ PORT: "70000" })).toThrow(/PORT/);
  });

  it("rejects an unknown log level", () => {
    expect(() => parseEnv({ LOG_LEVEL: "verbose" })).toThrow(/LOG_LEVEL/);
  });

  it("treats an empty emulator host as unset", () => {
    const env = parseEnv({ FIREBASE_AUTH_EMULATOR_HOST: "" });
    expect(env.firebaseAuthEmulatorHost).toBeUndefined();
  });

  it("recognises an explicitly approved non-loopback setting", () => {
    expect(parseEnv({ ALLOW_NON_LOOPBACK: "true" }).allowNonLoopback).toBe(true);
  });
});
