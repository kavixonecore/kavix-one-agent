# Resume Next — Pick Up Here

> **Last Session:** 2026-03-30 (Session 5)
> **Repo:** https://github.com/kavixonecore/kavix-one-agent.git (42 commits on main)

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Agent-one harness (5 phases) | Complete | 622 tests |
| Fitness tracker API (5 entities + JWT auth) | Complete | 191 tests |
| Fitness tracker Angular UI (6 pages) | Complete | Auth0 login working |
| Auth0 mgmt API (5 routers) | Complete | 22 tests, port 3100 |
| Auth0 mgmt Angular dashboard | **Redesigned** | Professional UI with charts |
| Auth0 mgmt CLI (16 commands) | Complete | 32 tests |
| Playwright AC tests (Auth0) | Created | 5 specs |
| GitHub Actions e2e workflow | Created | Needs AUTH0_GOOGLE_USER_EMAIL_PASSWORD secret |

## Auth0 Configuration (All Working)

| Item | Value |
|------|-------|
| Domain | davis-sylvester.us.auth0.com |
| SPA Client ID | jTgciii6X3sf54VMWFef7eYWeXWmEwnk |
| M2M Client ID | CVTeRH9NkcZW6XDy6aXuQdqT4JF9LJ9Y |
| Organization | org_jgArX0H6IXWwiZFz (fitness-tracker) |
| API Audience | https://api.fitness-tracker.local |
| Org Connections | Google, GitHub, Username-Password-Authentication |
| SPA org_usage | allow |

## How to Start Everything

```bash
# Pull latest
cd agent-one && git pull origin main

# Terminal 1: MongoDB
cd tests/e2e/fitness-tracker && docker compose up mongodb -d

# Terminal 2: Fitness Tracker API (port 3000)
cd tests/e2e/fitness-tracker
MONGODB_URI="mongodb://admin:password@localhost:27017/fitness_tracker?authSource=admin" bun src/index.mts

# Terminal 3: Fitness Tracker UI (port 4200)
cd tests/e2e/fitness-tracker/ui/fitness-tracker-ui
ng serve --proxy-config proxy.conf.json

# Terminal 4: Auth0 Mgmt API (port 3100)
cd apps/auth0-mgmt && export $(cat .env | grep -v '^#' | xargs)
cd api && bun src/index.mts

# Terminal 5: Auth0 Mgmt UI (port 4300)
cd apps/auth0-mgmt/ui/auth0-mgmt-ui
ng serve --proxy-config proxy.conf.json --port 4300
```

## URLs

| Service | URL |
|---------|-----|
| Fitness Tracker UI | http://localhost:4200 |
| Fitness Tracker Swagger | http://localhost:3000/swagger |
| Auth0 Mgmt Dashboard | http://localhost:4300 |
| Auth0 Mgmt Swagger | http://localhost:3100/swagger |

## Top Priority Next

1. Add `AUTH0_GOOGLE_USER_EMAIL_PASSWORD` secret to GitHub repo
2. Run Playwright AC tests
3. Test full login → dashboard → CRUD flow
4. Polish fitness tracker UI charts

## Hard Rules (14 total)

See `whats_next.md` for full list. Key ones:
- /v1 not /api/v1
- @elysiajs/openapi not swagger
- Default page = /swagger
- 30-line max methods
- Integration tests mandatory
- Doc-sync after every change
- Session docs every session
