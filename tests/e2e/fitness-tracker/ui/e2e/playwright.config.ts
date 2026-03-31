import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 200_000, // 3min+ for manual auth
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false, // serial — auth state matters
  retries: 0,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "../.docs/playwright-report" }],
  ],
  use: {
    baseURL: "http://localhost:4200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: false, // must be headed for manual Google auth
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
