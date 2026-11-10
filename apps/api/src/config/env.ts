import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Runtime configuration for the local API.
 *
 * Values come from apps/api/.env (local, gitignored) or the process
 * environment. Nothing here is a secret.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultDatabasePath = path.resolve(
  here,
  "..",
  "..",
  "..",
  "..",
  "data",
  "cv-digitals-mail.db",
);

function readPort(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Invalid PORT value: ${raw}`);
  }
  return value;
}

function readList(raw: string | undefined): string[] {
  if (raw === undefined) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

const webOriginsFromEnv = readList(process.env.WEB_ORIGIN);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "127.0.0.1",
  port: readPort(process.env.PORT, 4100),
  webOrigins:
    webOriginsFromEnv.length > 0
      ? webOriginsFromEnv
      : ["http://localhost:3000"],
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "cv-digitals-mail-dev",
  /**
   * Local/test only. The Admin SDK reads this variable automatically; it must
   * never be set in production.
   */
  firebaseAuthEmulatorHost:
    process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim() || undefined,
  /**
   * Server-side allowlist. A valid Firebase token is not sufficient on its own:
   * the identity must also be listed here. Empty means "deny everyone".
   */
  authAllowedEmails: readList(process.env.AUTH_ALLOWED_EMAILS),
  authAllowedUids: readList(process.env.AUTH_ALLOWED_UIDS),
  databasePath: process.env.DATABASE_PATH?.trim() || defaultDatabasePath,
} as const;

export type Env = typeof env;
