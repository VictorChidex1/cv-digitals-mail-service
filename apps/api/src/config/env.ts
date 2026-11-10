import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

/**
 * Runtime configuration for the local API.
 *
 * Parsed once at startup. Invalid configuration fails fast with a named field
 * rather than surfacing later as a confusing runtime error.
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

const LogLevelSchema = z.enum([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4100),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  FIREBASE_PROJECT_ID: z.string().min(1).default("cv-digitals-mail-dev"),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  AUTH_ALLOWED_EMAILS: z.string().default(""),
  AUTH_ALLOWED_UIDS: z.string().default(""),
  DATABASE_PATH: z.string().optional(),
  LOG_LEVEL: LogLevelSchema.default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  ALLOW_NON_LOOPBACK: z.enum(["true", "false"]).default("false"),
});

export type LogLevel = z.infer<typeof LogLevelSchema>;

export interface AppEnv {
  nodeEnv: "development" | "test" | "production";
  host: string;
  port: number;
  webOrigins: string[];
  firebaseProjectId: string;
  firebaseAuthEmulatorHost: string | undefined;
  authAllowedEmails: string[];
  authAllowedUids: string[];
  databasePath: string;
  logLevel: LogLevel;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  authRateLimitMax: number;
  allowNonLoopback: boolean;
}

function readList(raw: string): string[] {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function parseEnv(source: NodeJS.ProcessEnv): AppEnv {
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${details}`);
  }

  const raw = result.data;
  const origins = readList(raw.WEB_ORIGIN);

  return {
    nodeEnv: raw.NODE_ENV,
    host: raw.HOST,
    port: raw.PORT,
    webOrigins: origins.length > 0 ? origins : ["http://localhost:3000"],
    firebaseProjectId: raw.FIREBASE_PROJECT_ID,
    firebaseAuthEmulatorHost:
      raw.FIREBASE_AUTH_EMULATOR_HOST?.trim() || undefined,
    authAllowedEmails: readList(raw.AUTH_ALLOWED_EMAILS),
    authAllowedUids: readList(raw.AUTH_ALLOWED_UIDS),
    databasePath: raw.DATABASE_PATH?.trim() || defaultDatabasePath,
    logLevel: raw.LOG_LEVEL,
    rateLimitWindowMs: raw.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: raw.RATE_LIMIT_MAX,
    authRateLimitMax: raw.AUTH_RATE_LIMIT_MAX,
    allowNonLoopback: raw.ALLOW_NON_LOOPBACK === "true",
  };
}

export const env = parseEnv(process.env);
