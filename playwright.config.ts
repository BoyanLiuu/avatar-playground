import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Export renders through each engine's canvas, so it is checked in all three.
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: "export.spec.ts",
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: "export.spec.ts",
    },
  ],
  webServer: {
    // The static export (out/, from `pnpm build`) from a plain static file server, on loopback
    // only: exactly what any static host would serve.
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1 --directory out`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
