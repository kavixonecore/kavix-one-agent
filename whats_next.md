# What's Next — Agent-One Roadmap

> **Last Updated:** 2026-03-30 (Session 4)
> **Current State:** 867 tests across 4 packages, 2 Angular apps, Auth0 mgmt CLI/API/dashboard, fitness tracker fully wired with Auth0

---

## Completed This Session (Session 4)

- [x] Angular SPA standards defined (3 rounds of questions → angular-ui agent updated)
- [x] Fitness tracker Angular UI (6 pages: dashboard, workouts, exercises, running, progress, login)
- [x] Proxy collision fix (/api prefix + pathRewrite)
- [x] Retry interceptor fix (skip 401/403/400/404)
- [x] Auth redirect loop fix (3s cooldown)
- [x] SKIP_AUTH env var for dev mode
- [x] Auth0 skill created (.claude/skills/auth0-org-social/SKILL.md)
- [x] Auth0 mgmt CLI (16 commands, 32 tests)
- [x] Auth0 mgmt API (5 routers, 22 tests, port 3100)
- [x] Auth0 mgmt Angular dashboard (7 features, ag-grid, signal state)
- [x] @auth0/auth0-angular wired into fitness tracker (provideAuth0, authGuard, social login buttons)
- [x] Playwright verification screenshots

---

## Immediate Opportunities

### 1. Configure Auth0 Credentials
- Create `.env` in `apps/auth0-mgmt/` with real Auth0 M2M credentials
- Update `tests/e2e/fitness-tracker/ui/fitness-tracker-ui/src/environments/environment.ts` with real Auth0 SPA credentials
- Create Auth0 SPA application for the fitness tracker
- Enable social connections (Google, GitHub, Apple, Microsoft) on the Auth0 tenant
- Create an organization and enable connections on it
- Test end-to-end social login flow

### 2. Run Ralph Loop on a New Project
- Use `scripts/ralph-loop.sh` against a fresh domain to validate the pattern
- Test with a completely different API (e.g., inventory, incidents, CRM)
- Measure tokens per task, duration, pass rate

### 3. Publish @kavix-one/agent-one to npm
- Finalize package.json for publishing
- Build step (if needed)
- Publish to npm: `npx @kavix-one/agent-one generate my-api`

### 4. Angular UI Tests
- Write Jest unit tests for fitness tracker UI (target: 75% branch, 50% overall)
- Write Playwright e2e tests for both Angular apps
- Set up test CI pipeline

---

## Medium-Term

### 5. Publish @sylvesterllc/eslint-config
- Extract canonical ESLint config into shared package
- All projects share same rules, no drift

### 6. Add Integration Test Template to Agent-One
- The integration test pattern (test-server helper + HTTP round-trips) needs to be templated
- Agent-one should generate integration tests for every entity automatically (hard rule)
- Template: `integration-test.tmpl.mts`

### 7. Add More Addon Templates
- GraphQL addon (Elysia + GraphQL Yoga)
- WebSocket addon (real-time events)
- Pagination helper addon

### 8. CI/CD Pipeline
- GitHub Actions for agent-one (lint + test on PR)
- GitHub Actions template generated for output projects
- Docker-compose for CI integration tests

### 9. Auth0 Mgmt Enhancements
- Wire audit log viewer to real MongoDB audit collection from fitness tracker API
- Add login page branding configuration
- Add bulk member import
- Add connection health monitoring

---

## Long-Term

### 10. Angular UI Generation (agent-one capability)
- Add templates for Angular standalone components, services, routes
- Generate matching UI for any API agent-one creates
- Chart components, forms, data tables

### 11. Multi-Agent Orchestration
- Separate worker and reviewer agents (full Ralph Loop with cross-model review)
- Parallel feature generation for independent entities

### 12. Self-Improvement Loop
- Agent-one analyzes trace data to identify template improvements
- Feedback loop: failures → prompt adjustments → better output

### 13. S3 Trace Storage
- trace-writer-s3.mts alongside fs and MongoDB writers
- Long-term archival, cross-machine access
