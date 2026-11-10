#!/usr/bin/env node
/**
 * Starts the full development stack in its own process group and records the
 * group id in .dev.pid so `npm run dev:stop` can shut down exactly this group
 * and nothing else.
 *
 * Refuses to start when:
 * - another instance is already running (pidfile points at a live group), or
 * - any of the stack's ports is already in use.
 *
 * This prevents a failed second start from overwriting and then deleting the
 * pidfile of a healthy first instance.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pidFile = path.join(root, ".dev.pid");

const PORTS = [3000, 4100, 9099, 4400, 4401];

function groupAlive(pid) {
  try {
    process.kill(-pid, 0);
    return true;
  } catch {
    return false;
  }
}

function portFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

if (existsSync(pidFile)) {
  const existing = Number(readFileSync(pidFile, "utf8").trim());

  if (Number.isInteger(existing) && existing > 0 && groupAlive(existing)) {
    console.error(
      `[dev] already running in process group ${existing}.\n` +
        "[dev] stop it first: npm run dev:stop",
    );
    process.exit(1);
  }

  rmSync(pidFile, { force: true });
  console.log("[dev] removed a stale .dev.pid");
}

const busy = [];
for (const port of PORTS) {
  if (!(await portFree(port))) busy.push(port);
}

if (busy.length > 0) {
  console.error(
    `[dev] port${busy.length > 1 ? "s" : ""} already in use: ${busy.join(", ")}.\n` +
      "[dev] free them, or stop this project's stack with: npm run dev:stop",
  );
  process.exit(1);
}

const child = spawn("npm", ["run", "dev:all"], {
  cwd: root,
  stdio: "inherit",
  detached: true, // own process group: one signal stops web + api + auth
});

if (child.pid === undefined) {
  console.error("[dev] could not start the development stack");
  process.exit(1);
}

writeFileSync(pidFile, String(child.pid));
console.log(
  `[dev] running in process group ${child.pid}. Stop with: npm run dev:stop`,
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    try {
      process.kill(-child.pid, signal);
    } catch {
      // Already gone.
    }
  });
}

child.on("exit", (code) => {
  // Only remove the pidfile if it still belongs to this instance, so a failed
  // duplicate start can never delete a healthy instance's record.
  if (existsSync(pidFile)) {
    const recorded = Number(readFileSync(pidFile, "utf8").trim());
    if (recorded === child.pid) rmSync(pidFile, { force: true });
  }
  process.exit(code ?? 0);
});
