import express from "express";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { errorHandler, notFoundHandler } from "../../src/http/errors.js";
import { requestId } from "../../src/http/request-id.js";
import { validateBody, validateQuery } from "../../src/http/validate.js";
import { withServer } from "../http.js";

const BodySchema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().nonnegative().optional(),
});

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

function buildApp() {
  const app = express();
  app.use(requestId);
  app.use(express.json());

  app.post("/items", validateBody(BodySchema), (_req, res) => {
    res.json({ received: res.locals["validatedBody"] });
  });

  app.get("/items", validateQuery(QuerySchema), (_req, res) => {
    res.json({ query: res.locals["validatedQuery"] });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("request validation", () => {
  const app = buildApp();

  it("accepts a valid body and coerces types", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/items`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "prospect", age: "42" }),
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        received: { name: "prospect", age: 42 },
      });
    });
  });

  it("rejects an invalid body with field-level errors", async () => {
    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/items`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });

      const body = (await response.json()) as {
        error: string;
        requestId: string;
        fields: Array<{ path: string }>;
      };

      expect(response.status).toBe(400);
      expect(body.error).toBe("invalid_request");
      expect(body.requestId.length).toBeGreaterThan(0);
      expect(body.fields.map((field) => field.path)).toContain("name");
    });
  });

  it("applies query defaults and rejects invalid query values", async () => {
    await withServer(app, async (baseUrl) => {
      const ok = await fetch(`${baseUrl}/items`);
      expect(await ok.json()).toEqual({ query: { page: 1 } });

      const bad = await fetch(`${baseUrl}/items?page=zero`);
      expect(bad.status).toBe(400);
    });
  });
});
