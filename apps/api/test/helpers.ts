import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function createTempDatabasePath(): { dir: string; file: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cvdmail-test-"));
  return { dir, file: path.join(dir, "app.db") };
}

export function removeTempDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}
