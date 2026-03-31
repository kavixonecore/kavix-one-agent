import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env["CI"];

export default defineConfig({
  testDir: ".",
  timeout: 200_000, // 3min+ for auth flow
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false, // serial — auth state matters
  retries: isCI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "../.docs/playwright-report" }],
  ],
  use: {
    baseURL: "http://localhost:4200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: isCI, // headed locally for manual auth, headless in CI
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
