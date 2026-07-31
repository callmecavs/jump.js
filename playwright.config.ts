/// <reference types="node" />

import { defineConfig, devices } from "@playwright/test"

const config = defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  reporter: process.env.CI ? [["github"], ["html"]] : "html",
  retries: process.env.CI ? 1 : 0,
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm test:server",
    reuseExistingServer: !process.env.CI,
    url: "http://localhost:3000/tests/behavior.html",
  },
})

export default config
