# What's Next — Agent-One Roadmap

> **Last Updated:** 2026-03-30 (Session 5)
> **Current State:** 867+ tests, Auth0 fully configured, mgmt dashboard redesigned, fitness tracker UI with auth, GitHub Actions e2e workflow

---

## Completed This Session (Session 5)

- [x] Auth0 configuration: SPA app, M2M app, organization, connections, API resource server
- [x] Auth guard race condition fix (wait for isLoading$ before checking isAuthenticated$)
- [x] organization_usage enabled on SPA app via Management API
- [x] Auth0 Universal Login working with org-scoped connections (Google, GitHub, database)
- [x] Playwright AC tests for Auth0 social login (5 specs, automated + manual modes)
- [x] GitHub Actions e2e-auth0 workflow with secret for Google credentials
- [x] /api prefix removed — all routes use /v1 directly (hard rule)
- [x] @auth0/auth0-angular v2.x installed in fitness tracker
- [x] Auth0 mgmt UI complete professional redesign (dark sidebar, stat cards, charts, responsive)
- [x] Fitness Tracker API resource server created in Auth0

---

## Immediate Opportunities

### 1. Add GitHub Actions Secret
Add `AUTH0_GOOGLE_USER_EMAIL_PASSWORD` to repo secrets, then run the e2e workflow.

### 2. Run Playwright AC Tests Locally
```bash
cd tests/e2e/fitness-tracker
npx playwright test --config=ui/e2e/playwright.config.ts
```

### 3. Fitness Tracker UI Polish
- Test full login → dashboard → CRUD flow end-to-end
- Fix any UI issues found during testing
- Add charts to fitness tracker dashboard (workout frequency, pace trends)

### 4. Auth0 Mgmt UI Enhancements
- Wire org detail page (members, connections, invites) with redesigned cards
- Add real audit log data from API
- Add member management (add/remove/role assign)

---

## Medium-Term

### 5. Publish @kavix-one/agent-one to npm
### 6. Publish @sylvesterllc/eslint-config
### 7. Run agent-one against a completely new domain
### 8. CI/CD Pipeline (lint + test on PR)
### 9. Angular UI tests (Jest unit + Playwright e2e)

---

## Long-Term

### 10. Angular UI Generation as agent-one capability
### 11. Multi-Agent Orchestration (worker + reviewer)
### 12. Self-Improvement Loop (trace analysis → template refinement)
### 13. S3 Trace Storage

---

## Hard Rules

1. No method > 30 lines
2. Integration tests mandatory (HTTP round-trips against Docker MongoDB)
3. Doc-sync after every code change
4. Session docs at end of every session
5. No deprecated APIs (use @elysiajs/openapi, jose, read docs when unsure)
6. ESLint --fix after every change
7. /health not /healthz
8. Double quotes, no any, explicit return types, no readonly (except ITraceEntry)
9. `as const` objects for enums, Winston logger, named exports, barrel files
10. Response: `{ success: true, data, count }` or `{ success: false, error }`
11. Playwright AC tests for auth flows
12. Never use /api as route prefix — use /v1 directly
13. Default page is always OpenAPI/Swagger at /swagger
14. Never use @elysiajs/swagger — use @elysiajs/openapi
