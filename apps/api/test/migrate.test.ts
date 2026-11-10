import fs from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { openDatabase, type DatabaseHandle } from "../src/db/client.js";
import {
  defaultMigrationsFolder,
  runMigrations,
} from "../src/db/migrate.js";
import { createTempDatabasePath, removeTempDir } from "./helpers.js";

let handle: DatabaseHandle | undefined;
let dir: string | undefined;

afterEach(() => {
  handle?.close();
  handle = undefined;
  if (dir !== undefined) {
    removeTempDir(dir);
    dir = undefined;
  }
});

describe("runMigrations", () => {
  it("applies the approved schema to a fresh database", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;
    handle = openDatabase(temp.file);

    const applied = runMigrations(handle);

    expect(applied).toBeGreaterThan(0);
    const table = handle.sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'")
      .get();
    expect(table).toEqual({ name: "settings" });
  });

  it("is idempotent when run again", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;
    handle = openDatabase(temp.file);

    const first = runMigrations(handle);
    const second = runMigrations(handle);

    expect(second).toBe(first);
  });

  it("refuses a database that is newer than the code", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;
    handle = openDatabase(temp.file);
    runMigrations(handle);

    const journalPath = path.join(
      defaultMigrationsFolder(),
      "meta",
      "_journal.json",
    );
    const journal = JSON.parse(fs.readFileSync(journalPath, "utf8")) as {
      entries: Array<{ when: number }>;
    };
    const newest = Math.max(...journal.entries.map((entry) => entry.when));

    handle.sqlite
      .prepare(
        'INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (?, ?)',
      )
      .run("future-migration", newest + 60_000);

    expect(() => runMigrations(handle!)).toThrow(/newer than this application/i);
  });
});
