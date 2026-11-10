import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export interface ValidationIssue {
  path: string;
  message: string;
}

function toIssues(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map((segment) => String(segment)).join("."),
    message: issue.message,
  }));
}

/**
 * Request validation primitives. Untrusted input is parsed into a typed value;
 * on failure the client gets field-level errors and the handler never runs.
 */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: "invalid_request",
        requestId: String(res.locals["requestId"] ?? ""),
        fields: toIssues(result.error),
      });
      return;
    }

    res.locals["validatedBody"] = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        error: "invalid_request",
        requestId: String(res.locals["requestId"] ?? ""),
        fields: toIssues(result.error),
      });
      return;
    }

    res.locals["validatedQuery"] = result.data;
    next();
  };
}
