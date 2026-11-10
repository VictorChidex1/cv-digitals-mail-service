import type { IncomingMessage, ServerResponse } from "node:http";

import type { Response } from "express";
import pino, { type DestinationStream, type Logger } from "pino";
import pinoHttpModule, {
  type HttpLogger,
  type Options as PinoHttpOptions,
} from "pino-http";

/**
 * pino-http ships a CommonJS function while its types expose a namespace under
 * `verbatimModuleSyntax`. The runtime export is the factory; narrow it once here.
 */
const pinoHttp = pinoHttpModule as unknown as (
  options?: PinoHttpOptions,
) => HttpLogger;

/**
 * Fields that must never appear in logs, whatever the call site does.
 */
export const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers['set-cookie']",
  "authorization",
  "cookie",
  "password",
  "token",
  "idToken",
  "*.authorization",
  "*.cookie",
  "*.password",
  "*.token",
  "*.idToken",
];

export interface LoggerOptions {
  level?: string;
  destination?: DestinationStream;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  return pino(
    {
      level: options.level ?? process.env.LOG_LEVEL ?? "info",
      base: { service: "cv-digitals-mail-api" },
      redact: { paths: REDACT_PATHS, censor: "[redacted]" },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    options.destination,
  );
}

export const logger = createLogger();

/**
 * Request summaries deliberately exclude the query string: query parameters are
 * user data and have no business in an access log.
 */
export function requestSummary(
  url: string | undefined,
  method: string | undefined,
): { method: string | undefined; path: string } {
  return { method, path: (url ?? "").split("?")[0] ?? "" };
}

export function httpLogger(parent: Logger = logger) {
  const options: PinoHttpOptions = {
    logger: parent,
    genReqId: (_req: IncomingMessage, res: ServerResponse) =>
      String((res as unknown as Response).locals["requestId"] ?? ""),
    customProps: (_req: IncomingMessage, res: ServerResponse) => ({
      requestId: (res as unknown as Response).locals["requestId"],
    }),
    serializers: {
      req: (req: IncomingMessage) => requestSummary(req.url, req.method),
      res: (res: ServerResponse) => ({ status: res.statusCode }),
    },
    // Health checks are high-frequency noise.
    autoLogging: { ignore: (req: IncomingMessage) => req.url === "/health" },
    customLogLevel: (
      _req: IncomingMessage,
      res: ServerResponse,
      err: Error | undefined,
    ) => {
      if (err !== undefined && err !== null) return "error";
      if (res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  };

  return pinoHttp(options);
}
