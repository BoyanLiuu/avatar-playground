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
    // Serves the existing production build on loopback only. Run the build first.
    command: `node_modules/.bin/next start -H 127.0.0.1 -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
