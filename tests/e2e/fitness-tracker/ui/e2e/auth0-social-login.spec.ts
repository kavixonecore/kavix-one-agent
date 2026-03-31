/**
 * Auth0 Social Login — Acceptance Criteria Test
 *
 * AC: A user can authenticate via Auth0 Universal Login using Google social
 *     login, receive a valid JWT, and access protected API endpoints.
 *
 * Prerequisites:
 *   - API running on localhost:3000 with JWKS_URL pointing to Auth0
 *   - Angular UI running on localhost:4200
 *   - Auth0 SPA app configured with organization_usage=allow
 *   - Google connection enabled on the Auth0 organization
 *   - Docker MongoDB running for API
 *
 * Environment variables:
 *   - AUTH0_GOOGLE_USER_EMAIL: Google account email (default: kavixone.core@gmail.com)
 *   - AUTH0_GOOGLE_USER_EMAIL_PASSWORD: Google account password (from GitHub Actions secrets)
 *
 * Automated flow:
 *   1. Navigate to app → redirected to login
 *   2. Click "Sign in with Google" → Auth0 Universal Login
 *   3. Click "Continue with Google" → Google Sign In
 *   4. Enter email + password automatically
 *   5. Wait for redirect back to app
 *   6. Verify dashboard loads + API accessible
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:4200";
const API_URL = "http://localhost:3000";
const AUTH_TIMEOUT_MS = 180_000; // 3 minutes max for full auth flow

const GOOGLE_EMAIL = process.env["AUTH0_GOOGLE_USER_EMAIL"] ?? "kavixone.core@gmail.com";
const GOOGLE_PASSWORD = process.env["AUTH0_GOOGLE_USER_EMAIL_PASSWORD"] ?? "";

test.describe("Auth0 Social Login — Acceptance Criteria", () => {

  test("AC-1: User can login via Google, access dashboard, and hit protected API", async ({ page }) => {
    test.skip(!GOOGLE_PASSWORD, "AUTH0_GOOGLE_USER_EMAIL_PASSWORD not set — skipping automated Google login");

    // Step 1: Navigate to the app — should redirect to login
    await page.goto(BASE_URL);
    await page.waitForURL("**/auth/login", { timeout: 10_000 });

    // Step 2: Verify login page renders with social buttons
    await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in with Email" })).toBeVisible();

    // Step 3: Click "Sign in with Google" — redirects to Auth0
    await page.getByRole("button", { name: "Sign in with Google" }).click();

    // Step 4: Wait for Auth0 Universal Login page
    await page.waitForURL("**/u/login**", { timeout: 15_000 });
    const heading = page.getByRole("heading", { name: "Welcome" });
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Step 5: Click "Continue with Google" on Auth0
    const googleButton = page.getByRole("button", { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible({ timeout: 10_000 });
    await googleButton.click();

    // Step 6: Google Sign In — enter email
    await page.waitForURL("**/accounts.google.com/**", { timeout: 15_000 });

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10_000 });
    await emailInput.fill(GOOGLE_EMAIL);
    await page.getByRole("button", { name: "Next" }).click();

    // Step 7: Google Sign In — enter password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible({ timeout: 10_000 });
    await passwordInput.fill(GOOGLE_PASSWORD);
    await page.getByRole("button", { name: "Next" }).click();

    // Step 8: Handle potential Google consent/2FA screens
    // Wait for redirect back to localhost — may pass through consent screen
    await page.waitForURL(`${BASE_URL}/**`, {
      timeout: AUTH_TIMEOUT_MS,
      waitUntil: "networkidle",
    });

    // Step 9: Verify user landed on dashboard (not login page)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/auth/login");

    // Wait for dashboard to fully load
    await page.waitForLoadState("networkidle", { timeout: 15_000 });

    // Step 10: Verify Auth0 token works by calling a protected API endpoint
    const tokenResponse = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/exercises`, {
        credentials: "include",
      });
      return { status: res.status };
    }, API_URL);

    expect(tokenResponse.status).not.toBe(401);

    // Step 11: Take screenshot of authenticated dashboard
    await page.screenshot({
      path: "ui/.docs/auth0-google-login-success.png",
      fullPage: true,
    });

    console.log("========================================");
    console.log(" AUTH0 GOOGLE LOGIN: PASSED");
    console.log(` User: ${GOOGLE_EMAIL}`);
    console.log(` Final URL: ${currentUrl}`);
    console.log(` API Status: ${tokenResponse.status}`);
    console.log("========================================");
  });

  test("AC-1-manual: User can login via Google with manual authentication", async ({ page }) => {
    test.skip(!!GOOGLE_PASSWORD, "AUTH0_GOOGLE_USER_EMAIL_PASSWORD is set — running automated test instead");

    // Same flow but waits for manual auth
    await page.goto(BASE_URL);
    await page.waitForURL("**/auth/login", { timeout: 10_000 });

    await page.getByRole("button", { name: "Sign in with Google" }).click();
    await page.waitForURL("**/u/login**", { timeout: 15_000 });

    const googleButton = page.getByRole("button", { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible({ timeout: 10_000 });
    await googleButton.click();

    console.log("========================================");
    console.log(" WAITING FOR MANUAL GOOGLE AUTH");
    console.log(` Account: ${GOOGLE_EMAIL}`);
    console.log(" Complete login in the browser window.");
    console.log(" Timeout: 3 minutes");
    console.log("========================================");

    await page.waitForURL(`${BASE_URL}/**`, {
      timeout: AUTH_TIMEOUT_MS,
      waitUntil: "networkidle",
    });

    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/auth/login");

    await page.waitForLoadState("networkidle", { timeout: 15_000 });

    const tokenResponse = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/exercises`, {
        credentials: "include",
      });
      return { status: res.status };
    }, API_URL);

    expect(tokenResponse.status).not.toBe(401);

    await page.screenshot({
      path: "ui/.docs/auth0-google-login-success.png",
      fullPage: true,
    });

    console.log("========================================");
    console.log(" AUTH0 GOOGLE LOGIN (MANUAL): PASSED");
    console.log(` Final URL: ${currentUrl}`);
    console.log(` API Status: ${tokenResponse.status}`);
    console.log("========================================");
  });

  test("AC-2: Unauthenticated user cannot access protected routes", async ({ page }) => {
    await page.goto(`${BASE_URL}/workouts`);
    await page.waitForURL("**/auth/login", { timeout: 15_000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("AC-3: Unauthenticated API call returns 401", async ({ page }) => {
    const response = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/exercises`);
      return { status: res.status, body: await res.json() };
    }, API_URL);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("AC-4: Public endpoints accessible without auth", async ({ page }) => {
    const healthResponse = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/health`);
      return { status: res.status, body: await res.json() };
    }, API_URL);

    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.status).toBe("ok");

    const swaggerResponse = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/swagger`);
      return { status: res.status };
    }, API_URL);

    expect(swaggerResponse.status).toBe(200);
  });
});
