import type { NextFunction, Request, Response } from "express";

import { logger } from "./logger.js";

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
    this.name = "AppError";
  }
}

export function requestIdOf(res: Response): string {
  return String(res.locals["requestId"] ?? "");
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "not_found", requestId: requestIdOf(res) });
}

interface BodyParserError {
  type?: string;
  status?: number;
}

/**
 * Single exit point for failures. Clients receive a code and a request id; the
 * detail stays in the server log and never leaks internals.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const requestId = requestIdOf(res);

  if (err instanceof AppError) {
    logger.warn({ requestId, code: err.code }, "request rejected");
    res.status(err.status).json({ error: err.code, requestId });
    return;
  }

  const parserError = err as BodyParserError;

  if (parserError.type === "entity.too.large") {
    res.status(413).json({ error: "payload_too_large", requestId });
    return;
  }

  if (parserError.type === "entity.parse.failed") {
    res.status(400).json({ error: "invalid_json", requestId });
    return;
  }

  logger.error({ requestId, err }, "unhandled error");
  res.status(500).json({ error: "internal_error", requestId });
}
