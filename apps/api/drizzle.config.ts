import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "drizzle-kit";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  dialect: "sqlite",
  schema: path.join(here, "src", "db", "schema.ts"),
  out: path.join(here, "drizzle"),
  dbCredentials: {
    url:
      process.env.DATABASE_PATH ??
      path.resolve(here, "..", "..", "data", "cv-digitals-mail.db"),
  },
  strict: true,
  verbose: true,
});
