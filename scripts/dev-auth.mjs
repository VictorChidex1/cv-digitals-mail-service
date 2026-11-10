#!/usr/bin/env node
/**
 * Starts the Auth emulator with persistence.
 *
 * - Data is written to .emulator-data/ when the emulator shuts down gracefully
 *   (SIGINT/SIGTERM), so Ctrl+C and `npm run dev:stop` both preserve users.
 * - Data is imported on the next start, but only when a snapshot exists; a
 *   first run with an empty directory would otherwise be an error.
 *
 * Passwords are stored hashed. They cannot be exported as plaintext, and do not
 * need to be: an imported user signs in with the same password as before.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, ".emulator-data");
mkdirSync(dataDir, { recursive: true });

const snapshotExists = existsSync(
  path.join(dataDir, "auth_export", "accounts.json"),
);

const args = [
  "emulators:start",
  "--only",
  "auth",
  "--project",
  "cv-digitals-mail-dev",
  `--export-on-exit=${dataDir}`,
];

if (snapshotExists) {
  args.push(`--import=${dataDir}`);
  console.log(`[auth] importing emulator data from ${dataDir}`);
} else {
  console.log("[auth] no snapshot yet; starting with an empty emulator");
}

const child = spawn("firebase", args, { cwd: root, stdio: "inherit" });

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code) => process.exit(code ?? 0));
