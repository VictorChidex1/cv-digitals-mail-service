export interface EnvironmentConfig {
  nodeEnv: string;
  firebaseAuthEmulatorHost: string | undefined;
  authAllowedEmails: string[];
  authAllowedUids: string[];
}

/**
 * Emulator configuration is local-only. Refusing to start is deliberate: a
 * production process pointed at the Auth emulator would authenticate nobody and
 * silently trust a local service.
 */
export function assertEnvironmentSeparation(config: EnvironmentConfig): void {
  const isProduction = config.nodeEnv === "production";
  if (isProduction && config.firebaseAuthEmulatorHost !== undefined) {
    throw new Error(
      "Refusing to start: FIREBASE_AUTH_EMULATOR_HOST is set in production. " +
        "Emulator configuration must never reach a production environment.",
    );
  }
}

export function environmentWarnings(config: EnvironmentConfig): string[] {
  const warnings: string[] = [];

  if (
    config.nodeEnv !== "production" &&
    config.firebaseAuthEmulatorHost === undefined
  ) {
    warnings.push(
      "FIREBASE_AUTH_EMULATOR_HOST is not set; development is using the real Firebase project.",
    );
  }

  if (
    config.authAllowedEmails.length === 0 &&
    config.authAllowedUids.length === 0
  ) {
    warnings.push(
      "No auth allowlist configured. Every authenticated request will be rejected with 403.",
    );
  }

  return warnings;
}
