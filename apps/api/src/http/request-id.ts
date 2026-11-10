import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

export const REQUEST_ID_HEADER = "x-request-id";

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

/**
 * Attaches a request id to every request and response. A client-supplied id is
 * accepted only when it matches a strict safe pattern; anything else is replaced
 * so log lines cannot be injected or forged.
 */
export function requestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const provided = req.header(REQUEST_ID_HEADER);
  const id =
    provided !== undefined && SAFE_REQUEST_ID.test(provided)
      ? provided
      : randomUUID();

  res.locals["requestId"] = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
}
