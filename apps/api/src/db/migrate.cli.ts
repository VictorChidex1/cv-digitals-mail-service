import "dotenv/config";

import { env } from "../config/env.js";
import { openDatabase } from "./client.js";
import { runMigrations } from "./migrate.js";

const handle = openDatabase(env.databasePath);

try {
  const applied = runMigrations(handle);
  console.log(
    `[db] ${handle.path} is up to date (${applied} migration(s) applied)`,
  );
} finally {
  handle.close();
}
