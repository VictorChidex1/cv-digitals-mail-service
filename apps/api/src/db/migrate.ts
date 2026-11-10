import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import type { DatabaseHandle, SqliteConnection } from "./client.js";

const here = path.dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_TABLE = "__drizzle_migrations";

interface Journal {
  entries: Array<{ when: number }>;
}

export function defaultMigrationsFolder(): string {
  return path.resolve(here, "..", "..", "drizzle");
}

/**
 * Applies pending migrations, then returns the number of applied migrations.
 *
 * Refuses to run when the database contains a migration this build does not
 * know about (for example after restoring a newer backup), because serving
 * stale code against a newer schema is how silent data corruption starts.
 */
export function runMigrations(
  handle: DatabaseHandle,
  migrationsFolder: string = defaultMigrationsFolder(),
): number {
  assertDatabaseNotAhead(handle, migrationsFolder);
  migrate(handle.db, { migrationsFolder });
  return countAppliedMigrations(handle.sqlite);
}

export function countAppliedMigrations(sqlite: SqliteConnection): number {
  if (!tableExists(sqlite, MIGRATIONS_TABLE)) return 0;
  const row = sqlite
    .prepare(`SELECT COUNT(*) AS applied FROM "${MIGRATIONS_TABLE}"`)
    .get() as { applied: number };
  return row.applied;
}

function tableExists(sqlite: SqliteConnection, name: string): boolean {
  const row = sqlite
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(name);
  return row !== undefined;
}

function assertDatabaseNotAhead(
  handle: DatabaseHandle,
  migrationsFolder: string,
): void {
  if (!tableExists(handle.sqlite, MIGRATIONS_TABLE)) return;

  const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
  if (!fs.existsSync(journalPath)) return;

  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8")) as Journal;
  const latestInCode = journal.entries.reduce(
    (latest, entry) => Math.max(latest, entry.when),
    0,
  );

  const row = handle.sqlite
    .prepare(`SELECT MAX(created_at) AS latest FROM "${MIGRATIONS_TABLE}"`)
    .get() as { latest: number | null } | undefined;
  const latestInDatabase = row?.latest ?? 0;

  if (latestInDatabase > latestInCode) {
    throw new Error(
      "Database schema is newer than this application build. " +
        "Restore a matching backup or update the application before starting.",
    );
  }
}
