/**
 * Runtime configuration for the local API.
 *
 * Values come from apps/api/.env (local, gitignored) or the process
 * environment. Nothing here is a secret; secrets are introduced in later
 * phases through an approved credential mechanism.
 */

function readPort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Invalid PORT value: ${raw}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "127.0.0.1",
  port: readPort(process.env.PORT, 4100),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "cv-digitals-mail-dev",
  /**
   * Local/test only. The Admin SDK reads this variable automatically; it must
   * never be set in production.
   */
  firebaseAuthEmulatorHost: process.env.FIREBASE_AUTH_EMULATOR_HOST,
} as const;
