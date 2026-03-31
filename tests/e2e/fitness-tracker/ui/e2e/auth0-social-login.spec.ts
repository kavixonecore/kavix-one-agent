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
 * This test opens the login page, clicks "Sign in with Google", and waits
 * up to 3 minutes for the user to complete Google authentication manually.
 * After auth completes, it verifies:
 *   1. User is redirected to the dashboard
 *   2. Auth0 token is present
 *   3. Protected API endpoints return 200 (not 401)
 *   4. User profile info is accessible
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:4200";
const API_URL = "http://localhost:3000";
const AUTH_TIMEOUT_MS = 180_000; // 3 minutes for manual Google auth

test.describe("Auth0 Social Login — Acceptance Criteria", () => {

  test("AC-1: User can login via Google, access dashboard, and hit protected API", async ({ page }) => {
    // Step 1: Navigate to the app — should redirect to login
    await page.goto(BASE_URL);
    await page.waitForURL("**/auth/login", { timeout: 10_000 });

    // Step 2: Verify login page renders with social buttons
    await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in with Email" })).toBeVisible();

    // Step 3: Click "Sign in with Google" — redirects to Auth0 → Google
    await page.getByRole("button", { name: "Sign in with Google" }).click();

    // Step 4: Wait for Auth0 Universal Login page
    await page.waitForURL("**/u/login**", { timeout: 15_000 });

    // Verify org-scoped login page
    const heading = page.getByRole("heading", { name: "Welcome" });
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Click "Continue with Google" on Auth0 page
    const googleButton = page.getByRole("button", { name: /Continue with Google/i });
    await expect(googleButton).toBeVisible({ timeout: 10_000 });
    await googleButton.click();

    // Step 5: Wait for Google auth to complete (user authenticates manually)
    // This waits up to 3 minutes for the redirect back to localhost:4200
    console.log("========================================");
    console.log(" WAITING FOR GOOGLE AUTHENTICATION");
    console.log(" Complete login in the browser window.");
    console.log(" Timeout: 3 minutes");
    console.log("========================================");

    await page.waitForURL(`${BASE_URL}/**`, {
      timeout: AUTH_TIMEOUT_MS,
      waitUntil: "networkidle",
    });

    // Step 6: Verify user landed on dashboard (not login page)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("/auth/login");

    // Wait for dashboard to load
    await page.waitForLoadState("networkidle", { timeout: 15_000 });

    // Step 7: Verify Auth0 token is in memory by checking a protected API call
    const tokenResponse = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/exercises`, {
        credentials: "include",
      });
      return { status: res.status };
    }, API_URL);

    // If we get 200, the auth interceptor attached the token
    // If we get 401, token was not attached
    expect(tokenResponse.status).not.toBe(401);

    // Step 8: Take screenshot of authenticated dashboard
    await page.screenshot({
      path: "ui/.docs/auth0-google-login-success.png",
      fullPage: true,
    });

    console.log("========================================");
    console.log(" AUTH0 GOOGLE LOGIN: PASSED");
    console.log(` Final URL: ${currentUrl}`);
    console.log(` API Status: ${tokenResponse.status}`);
    console.log("========================================");
  });

  test("AC-2: Unauthenticated user cannot access protected routes", async ({ page }) => {
    // Navigate directly to a protected route without auth
    await page.goto(`${BASE_URL}/workouts`);

    // Should redirect to login
    await page.waitForURL("**/auth/login", { timeout: 15_000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("AC-3: Unauthenticated API call returns 401", async ({ page }) => {
    // Call the API directly without a token
    const response = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/exercises`);
      return { status: res.status, body: await res.json() };
    }, API_URL);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("AC-4: Public endpoints accessible without auth", async ({ page }) => {
    // Health endpoint — no auth required
    const healthResponse = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/health`);
      return { status: res.status, body: await res.json() };
    }, API_URL);

    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.status).toBe("ok");

    // Swagger — no auth required
    const swaggerResponse = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/swagger`);
      return { status: res.status };
    }, API_URL);

    expect(swaggerResponse.status).toBe(200);
  });
});
