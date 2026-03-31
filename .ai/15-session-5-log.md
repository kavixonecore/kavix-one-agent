# Session 5 Log — Auth0 Configuration + E2E Tests

> **Date:** 2026-03-30
> **Model:** Claude Opus 4.6 (1M context)
> **Starting State:** 813 tests, Auth0 not configured (placeholder values)

---

## Session Timeline

### 1. Synced from Main PC (Session 4)

Pulled Session 4 changes: fitness tracker Angular UI (6 pages), Auth0 mgmt app (CLI + API + dashboard), Auth0 skill, @auth0/auth0-angular integration.

### 2. Auth0 Configuration

Configured all 3 auth touch points:

| Config | File | Values Set |
|--------|------|-----------|
| Fitness Tracker Angular UI | `environments/environment.ts` + `environment.prod.ts` | domain: davis-sylvester.us.auth0.com, clientId: jTgciii6X3sf54VMWFef7eYWeXWmEwnk, orgId: org_jgArX0H6IXWwiZFz |
| Fitness Tracker API | `tests/e2e/fitness-tracker/.env` | JWKS_URL, JWT_ISSUER, JWT_AUDIENCE |
| Auth0 Mgmt CLI/API | `apps/auth0-mgmt/.env` | M2M client ID/secret, org ID |

### 3. Auth0 M2M App Created

- Created `agent-one-mgmt` M2M application in Auth0 dashboard
- Authorized for Auth0 Management API
- Client ID: CVTeRH9NkcZW6XDy6aXuQdqT4JF9LJ9Y

### 4. Organization Connections Enabled

Used mgmt CLI to enable 3 connections on org `org_jgArX0H6IXWwiZFz`:
- Username-Password-Authentication (database)
- google-oauth2
- github

### 5. Fitness Tracker API Resource Server Created

- Created `Fitness Tracker API` in Auth0 with identifier `https://api.fitness-tracker.local`
- Was missing — caused `Service not found` error on login

### 6. Auth Guard Race Condition Fixed

**Problem:** Auth guard used `take(1)` on `isAuthenticated$`, which emitted `false` before the Auth0 SDK could exchange the callback code for a token, causing an infinite redirect loop.

**Fix:** Guard now waits for `isLoading$` to be `false` before checking `isAuthenticated$`:
```typescript
auth.isLoading$.pipe(
  filter((loading) => !loading),
  take(1),
  switchMap(() => auth.isAuthenticated$),
  take(1),
  map((isAuth) => isAuth || router.createUrlTree(["/auth/login"])),
);
```

### 7. Organization Usage Enabled on SPA App

**Problem:** `organization` parameter in authorize request caused silent `access_denied` because the SPA app had `organization_usage: undefined`.

**Fix:** Used Management API to set `organization_usage: "allow"` on the SPA app:
```typescript
await client.clients.update(spaClientId, {
  organization_usage: "allow",
  organization_require_behavior: "no_prompt",
});
```

### 8. Auth0 Login Working

After all fixes, Auth0 Universal Login shows:
- "Log in to fitness-tracker to continue to fitness-tracker-ui" (org name displayed)
- Email/password fields
- Google + GitHub buttons (org-scoped connections only)
- Verified via Playwright screenshot

### 9. Playwright E2E Auth Tests

Created acceptance criteria tests at `ui/e2e/auth0-social-login.spec.ts`:

| AC | Test | Mode |
|----|------|------|
| AC-1 | Google login → dashboard → API 200 | Automated (fills email/password) or manual (3 min wait) |
| AC-1-manual | Same but waits for human auth | When password env not set |
| AC-2 | Protected route → redirect to login | Automated |
| AC-3 | API without token → 401 | Automated |
| AC-4 | Public endpoints → 200 | Automated |

- Google account: `kavixone.core@gmail.com`
- Password: from GitHub Actions secret `AUTH0_GOOGLE_USER_EMAIL_PASSWORD`
- Playwright config: headed locally, headless in CI

### 10. GitHub Actions Workflow

Created `.github/workflows/e2e-auth0.yml`:
- Starts MongoDB, API, Angular UI
- Runs Playwright AC tests with Google credentials from secrets
- Uploads screenshots + HTML report as artifacts
- Triggers on push to auth paths or manual dispatch

---

## Bugs Found & Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Auth0 login silent failure | `organization_usage` not set on SPA app | Set to `"allow"` via Management API |
| Auth guard redirect loop | `take(1)` fires before SDK processes callback | Wait for `isLoading$` to be false first |
| "Service not found" error | No API resource server in Auth0 for the audience | Created `https://api.fitness-tracker.local` API |

---

## Aggregate Statistics (End of Session 5)

| Metric | Value |
|--------|-------|
| **Total tests** | 813+ (agent-one + fitness tracker + auth AC) |
| **Git commits on main** | 38 |
| **Auth0 apps configured** | 2 (SPA + M2M) |
| **Auth0 org connections** | 3 (database, Google, GitHub) |
| **Playwright AC tests** | 5 (AC-1 automated, AC-1 manual, AC-2, AC-3, AC-4) |
| **GitHub Actions workflows** | 1 (e2e-auth0.yml) |
