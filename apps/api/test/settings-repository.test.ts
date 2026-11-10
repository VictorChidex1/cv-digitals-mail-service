import { afterEach, describe, expect, it } from "vitest";

import { openDatabase, type DatabaseHandle } from "../src/db/client.js";
import { runMigrations } from "../src/db/migrate.js";
import { createSettingsRepository } from "../src/db/repositories/settings-repository.js";
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

describe("settings repository", () => {
  it("round-trips values, updates them, and lists them in order", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;
    handle = openDatabase(temp.file);
    runMigrations(handle);
    const repo = createSettingsRepository(handle.db);

    expect(repo.get("sendingPaused")).toBeNull();

    repo.set("sendingPaused", "false");
    expect(repo.get("sendingPaused")).toBe("false");

    repo.set("sendingPaused", "true");
    repo.set("defaultSignature", "Victor");

    expect(repo.get("sendingPaused")).toBe("true");
    expect(repo.list().map((row) => row.key)).toEqual([
      "defaultSignature",
      "sendingPaused",
    ]);
    expect(repo.list()[1]?.updatedAt).toBeInstanceOf(Date);
  });

  it("persists across a close and reopen (durability)", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;

    handle = openDatabase(temp.file);
    runMigrations(handle);
    createSettingsRepository(handle.db).set("sendingPaused", "true");
    handle.close();

    handle = openDatabase(temp.file);
    const reopened = createSettingsRepository(handle.db);

    expect(reopened.get("sendingPaused")).toBe("true");
  });

  it("removes keys and reports whether anything was removed", () => {
    const temp = createTempDatabasePath();
    dir = temp.dir;
    handle = openDatabase(temp.file);
    runMigrations(handle);
    const repo = createSettingsRepository(handle.db);

    repo.set("tempKey", "value");

    expect(repo.remove("tempKey")).toBe(true);
    expect(repo.remove("tempKey")).toBe(false);
    expect(repo.get("tempKey")).toBeNull();
  });
});
