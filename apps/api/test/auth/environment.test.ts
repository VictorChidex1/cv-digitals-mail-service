import { describe, expect, it } from "vitest";

import {
  assertEnvironmentSeparation,
  environmentWarnings,
  type EnvironmentConfig,
} from "../../src/config/environment.js";

const BASE: EnvironmentConfig = {
  nodeEnv: "development",
  firebaseAuthEmulatorHost: "127.0.0.1:9099",
  authAllowedEmails: ["operator@example.test"],
  authAllowedUids: [],
};

describe("environment separation", () => {
  it("refuses to start production with the auth emulator configured", () => {
    expect(() =>
      assertEnvironmentSeparation({
        ...BASE,
        nodeEnv: "production",
        firebaseAuthEmulatorHost: "127.0.0.1:9099",
      }),
    ).toThrow(/never reach a production environment/i);
  });

  it("allows production without the auth emulator", () => {
    expect(() =>
      assertEnvironmentSeparation({
        ...BASE,
        nodeEnv: "production",
        firebaseAuthEmulatorHost: undefined,
      }),
    ).not.toThrow();
  });

  it("allows development with the auth emulator", () => {
    expect(() => assertEnvironmentSeparation(BASE)).not.toThrow();
  });

  it("warns when development is not pointed at the emulator", () => {
    const warnings = environmentWarnings({
      ...BASE,
      firebaseAuthEmulatorHost: undefined,
    });
    expect(warnings.join(" ")).toMatch(/real Firebase project/i);
  });

  it("warns when the allowlist is empty", () => {
    const warnings = environmentWarnings({
      ...BASE,
      authAllowedEmails: [],
      authAllowedUids: [],
    });
    expect(warnings.join(" ")).toMatch(/rejected with 403/i);
  });

  it("has no warnings when correctly configured", () => {
    expect(environmentWarnings(BASE)).toEqual([]);
  });
});
