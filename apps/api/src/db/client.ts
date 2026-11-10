import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";

import * as schema from "./schema.js";

export type AppDatabase = BetterSQLite3Database<typeof schema>;
export type SqliteConnection = InstanceType<typeof Database>;

export interface DatabaseHandle {
  readonly db: AppDatabase;
  readonly sqlite: SqliteConnection;
  readonly path: string;
  close(): void;
}

/**
 * Opens the single application database connection.
 *
 * Pragmas are per-connection, and SQLite defaults `foreign_keys` to OFF, so
 * they are set explicitly every time a connection is opened.
 */
export function openDatabase(databasePath: string): DatabaseHandle {
  if (databasePath !== ":memory:") {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");

  return {
    db: drizzle(sqlite, { schema }),
    sqlite,
    path: databasePath,
    close: () => {
      if (sqlite.open) sqlite.close();
    },
  };
}
