# Resume Next — Pick Up Here

> **Last Session:** 2026-03-30 (Session 5)
> **Repo:** https://github.com/kavixonecore/kavix-one-agent.git (38 commits on main)

---

## Current State

| Component | Status | Tests |
|-----------|--------|-------|
| Agent-one harness (all 5 phases) | Complete | 622 |
| Fitness tracker API (5 entities + JWT auth) | Complete | 191 |
| Fitness tracker Angular UI (6 pages) | Complete | — |
| Auth0 mgmt app (CLI + API + dashboard) | Complete | 54 |
| Auth0 configured (SPA + M2M + org) | Working | — |
| Playwright Auth0 AC tests | Created | 5 specs |
| GitHub Actions e2e-auth0 workflow | Created | Needs secret |
| **Total** | | **867+ tests** |

## Auth0 Status

- Domain: `davis-sylvester.us.auth0.com`
- SPA app: `jTgciii6X3sf54VMWFef7eYWeXWmEwnk` (organization_usage=allow)
- M2M app: `CVTeRH9NkcZW6XDy6aXuQdqT4JF9LJ9Y`
- Org: `org_jgArX0H6IXWwiZFz` (Google + GitHub + database connections)
- API: `https://api.fitness-tracker.local`
- Login: Working via Auth0 Universal Login

## GitHub Actions Secret Needed

Add to repo settings (`Settings → Secrets → Actions`):
- `AUTH0_GOOGLE_USER_EMAIL_PASSWORD` — password for `kavixone.core@gmail.com`

## Top Priority — What to Do Next

### Option A: Run the Playwright AC tests
```bash
cd tests/e2e/fitness-tracker
npx playwright test --config=ui/e2e/playwright.config.ts
```

### Option B: Build remaining Angular UI features
- PRD: `tests/e2e/fitness-tracker/ui/docs/PRD.md`
- Tasks: `tests/e2e/fitness-tracker/ui/docs/TASKS.md` (13 tasks)
- Agent: `@angular-ui`

### Option C: Test agent-one on a new domain
### Option D: Publish to npm

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
