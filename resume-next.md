# Resume Next — Pick Up Here

> **Last Session:** 2026-03-29 (Session 3)
> **Repo:** https://github.com/kavixonecore/kavix-one-agent.git (28 commits on main)

---

## Current State

| Component | Status | Tests |
|-----------|--------|-------|
| Agent-one harness (all 5 phases) | Complete | 622 |
| Fitness tracker API (5 entities + JWT auth) | Complete | 191 |
| JWT auth addon template | Complete | 28 (part of 622) |
| 7 addon templates total | Complete | included |
| **Total** | | **813 tests, 0 failures** |

## What's Running

- Docker MongoDB: `fitness-tracker-mongo` on port 27017
  - Restart: `cd tests/e2e/fitness-tracker && docker compose up -d`
- API NOT running (start with env vars):
  ```bash
  cd tests/e2e/fitness-tracker
  MONGODB_URI="mongodb://admin:password@localhost:27017/fitness_tracker?authSource=admin" \
  JWKS_URL="https://your-tenant.auth0.com/.well-known/jwks.json" \
  bun src/index.mts
  ```
- Swagger: http://localhost:3000/swagger

## What Was Built in Session 3

- JWT auth (provider-agnostic JWKS, rate limiting, audit logging)
- 90 comprehensive CRUD integration tests with exact status code verification
- Agent-one custom agent at `~/.claude/agents/agent-one.md`
- 30-line method rule, deprecated API rule, doc-sync rule

## Top Priority — What to Do Next

### Option A: Build the Angular UI (recommended — PRD + tasks ready)
- **PRD:** `tests/e2e/fitness-tracker/ui/docs/PRD.md` — fully fleshed out with design, UX, charts, auth, testing
- **Tasks:** `tests/e2e/fitness-tracker/ui/docs/TASKS.md` — 13 tasks, ~121 files, dependency graph
- **API ref:** `tests/e2e/fitness-tracker/ui/memory.md` — complete endpoint reference with auth
- **Agent:** `@angular-ui` subagent ready at `.claude/agents/angular-ui.md`
- Run: invoke `@angular-ui` or use oda-agent against `ui/docs/TASKS.md`

### Option B: Test agent-one on a new domain
- Run Ralph Loop or oda-agent against a completely different API
- Validate templates produce correct auth + CRUD + integration tests

### Option C: Publish @kavix-one/agent-one to npm

### Option D: Wire Auth0/Cognito for real JWT testing
- Currently uses mock JWKS in tests. Could add a real Auth0 tenant for manual testing.

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
