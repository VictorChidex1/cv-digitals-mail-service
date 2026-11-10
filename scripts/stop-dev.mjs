#!/usr/bin/env node
/**
 * Stops the stack started by `npm run dev`.
 *
 * Sends SIGTERM to the recorded process group so the Firebase Auth emulator can
 * export its data on the way down, waits up to five seconds, then escalates to
 * SIGKILL. It never searches by port or command name, so it cannot kill an
 * unrelated application.
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pidFile = path.join(root, ".dev.pid");

if (!existsSync(pidFile)) {
  console.log("[dev:stop] no .dev.pid found — nothing to stop");
  process.exit(0);
}

const pid = Number(readFileSync(pidFile, "utf8").trim());
if (!Number.isInteger(pid) || pid <= 0) {
  console.error("[dev:stop] .dev.pid is invalid; delete it manually");
  process.exit(1);
}

function groupAlive() {
  try {
    process.kill(-pid, 0);
    return true;
  } catch {
    return false;
  }
}

if (!groupAlive()) {
  console.log(`[dev:stop] process group ${pid} is not running; cleaning up`);
  rmSync(pidFile, { force: true });
  process.exit(0);
}

console.log(`[dev:stop] stopping process group ${pid} (export runs on shutdown)`);
process.kill(-pid, "SIGTERM");

for (let attempt = 0; attempt < 20 && groupAlive(); attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 250));
}

if (groupAlive()) {
  console.warn("[dev:stop] still running after 5s — sending SIGKILL");
  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    // Already gone.
  }
}

rmSync(pidFile, { force: true });
console.log("[dev:stop] stopped");
