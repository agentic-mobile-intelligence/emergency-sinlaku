import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "bun run dev --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
