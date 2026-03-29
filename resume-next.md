# Resume Next — Pick Up Here

> **Last Session:** 2026-03-29
> **Repo:** https://github.com/kavixonecore/kavix-one-agent.git (24 commits on main)

---

## Current State

| Component | Status | Tests |
|-----------|--------|-------|
| Agent-one harness (all 5 phases) | Complete | 590 passing |
| Fitness tracker API (5 entities) | Complete | 141 passing (93 unit + 48 integration) |
| Playwright visual verification | Working | 4 passing |
| Ralph Loop script | Ready, not yet run on a fresh project |
| Docker MongoDB | Running on port 27017 (may need `docker compose up -d` to restart) |
| **Total** | | **735 tests, 0 failures** |

## What's Running

- Docker MongoDB container: `fitness-tracker-mongo` on port 27017
  - Restart if needed: `cd tests/e2e/fitness-tracker && docker compose up -d`
- API server is NOT running (killed at end of session)
  - Start: `cd tests/e2e/fitness-tracker && MONGODB_URI="mongodb://admin:password@localhost:27017/fitness_tracker?authSource=admin" bun src/index.mts`
  - Swagger: http://localhost:3000/swagger

## Top Priority — What to Do Next

### Option A: Build the Angular UI (recommended)
The API is fully built and tested. The Angular UI is Phase 2 in the fitness tracker PRD.
- **Start file:** `tests/e2e/fitness-tracker/ui/memory.md` — complete API reference ready
- **PRD tasks:** TASK-011 (Angular scaffolding), TASK-012 (Dashboard + Charts), TASK-013 (Remaining pages)
- **Command:** Use oda-agent against the fitness tracker TASKS.md

### Option B: Run Ralph Loop on a New Domain
Test agent-one's templates against a completely different API to validate flexibility.
- **Script:** `./scripts/ralph-loop.sh <project-dir> <tasks-file>`
- Create a new PRD + TASKS.md for a different domain (e.g., inventory, incidents)

### Option C: Wire Agent-One as Claude Code Custom Agent
Make agent-one invocable as a custom agent type.
- Create `.claude/agents/agent-one.md`
- Test `src/agent-bridge.mts` in a real session

### Option D: Publish to npm
- Package: `@kavix-one/agent-one`
- CLI: `npx @kavix-one/agent-one generate my-api`

## Hard Rules to Remember

1. **Integration tests mandatory** — every entity gets HTTP round-trip tests against Docker MongoDB
2. **Doc-sync after every change** — update ui/memory.md, RESULTS.md, TASKS.md, PRD.md
3. **Session docs at end** — write session log to .ai/, update whats_next.md
4. **No deprecated APIs** — use @elysiajs/openapi (not swagger), read docs when unsure
5. **ESLint --fix after every change** — canonical config with no-any, explicit-return-type
6. **/health not /healthz** — renamed across codebase
7. **Double quotes** — not single
8. **No readonly on interfaces** — unless explicitly required (only ITraceEntry family)

## Key Files

| File | Purpose |
|------|---------|
| `docs/PRD.md` | Agent-one requirements (all phases checked off) |
| `whats_next.md` | Full roadmap with priorities |
| `.ai/13-session-2-log.md` | Latest session log |
| `.ai/00-index.md` | Index of all .ai docs |
| `tests/e2e/fitness-tracker/docs/PRD.md` | Fitness tracker requirements |
| `tests/e2e/fitness-tracker/docs/TASKS.md` | Fitness tracker task list |
| `tests/e2e/fitness-tracker/ui/memory.md` | Angular UI API reference |
| `scripts/ralph-loop.sh` | Ralph Loop automation script |
