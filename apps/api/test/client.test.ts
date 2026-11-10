import fs from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { openDatabase, type DatabaseHandle } from "../src/db/client.js";
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

describe("openDatabase", () => {
  it("enables WAL, foreign keys, and a busy timeout", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;
    handle = openDatabase(temp.file);

    expect(handle.sqlite.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(handle.sqlite.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(handle.sqlite.pragma("busy_timeout", { simple: true })).toBe(5000);
  });

  it("creates missing parent directories", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;
    const nested = path.join(temp.dir, "nested", "deeper", "app.db");

    handle = openDatabase(nested);

    expect(fs.existsSync(nested)).toBe(true);
  });

  it("rejects foreign-key violations", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;
    handle = openDatabase(temp.file);

    handle.sqlite.exec(`
      CREATE TABLE parent (id INTEGER PRIMARY KEY);
      CREATE TABLE child (
        id INTEGER PRIMARY KEY,
        parent_id INTEGER NOT NULL REFERENCES parent(id)
      );
    `);

    expect(() =>
      handle?.sqlite
        .prepare("INSERT INTO child (parent_id) VALUES (?)")
        .run(999),
    ).toThrow(/FOREIGN KEY/i);
  });
});
