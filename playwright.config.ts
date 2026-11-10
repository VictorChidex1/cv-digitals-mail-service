import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev:api",
      url: "http://127.0.0.1:4100/health",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: "npm run dev:web:e2e",
      url: "http://localhost:3100/login",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
