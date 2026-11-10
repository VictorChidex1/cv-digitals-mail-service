#!/usr/bin/env node
/**
 * Starts the full development stack in its own process group and records the
 * group id in .dev.pid so `npm run dev:stop` can shut down exactly this group
 * and nothing else.
 */
import { spawn } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pidFile = path.join(root, ".dev.pid");

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
  rmSync(pidFile, { force: true });
  process.exit(code ?? 0);
});
