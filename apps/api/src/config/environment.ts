export interface EnvironmentConfig {
  nodeEnv: string;
  firebaseAuthEmulatorHost: string | undefined;
  authAllowedEmails: string[];
  authAllowedUids: string[];
}

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "localhost"]);

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

/**
 * The API is a local service. Binding to anything other than loopback exposes
 * it to the LAN, which the project rules forbid without explicit approval.
 */
export function assertLoopbackBinding(
  host: string,
  allowNonLoopback: boolean,
): void {
  if (LOOPBACK_HOSTS.has(host)) return;
  if (allowNonLoopback) return;

  throw new Error(
    `Refusing to start: HOST is "${host}", which is not loopback. ` +
      "Set ALLOW_NON_LOOPBACK=true only with explicit approval to expose the API.",
  );
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
