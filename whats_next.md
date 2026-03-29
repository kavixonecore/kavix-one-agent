# What's Next — Agent-One Roadmap

> **Last Updated:** 2026-03-29 (Session 2)
> **Current State:** All 5 phases complete, fitness tracker e2e passing (141 tests with Docker), Ralph Loop script ready, Playwright gate built, integration tests mandatory

---

## Completed This Session

- [x] Token consumption tracking per task (recordTokens + parsePrompt returns usage)
- [x] Git init + push to https://github.com/kavixonecore/kavix-one-agent.git
- [x] README.md
- [x] Fitness tracker API (5 entities, 92 unit tests)
- [x] Fitness tracker integration tests (48 tests via HTTP against Docker MongoDB)
- [x] Ralph Loop script (scripts/ralph-loop.sh)
- [x] Angular UI memory.md (full API reference)
- [x] Swagger schema fix (proper t.Object types on all endpoints)
- [x] Playwright visual verification gate
- [x] /healthz → /health rename across codebase
- [x] Doc-sync rule + session docs rule in memory

---

## Immediate Opportunities

### 1. Build Fitness Tracker Angular UI (Phase 2)
- PRD has Phase 2 milestones (TASK-011 through TASK-013)
- ui/memory.md has complete API reference ready
- Dashboard with charts (Chart.js/ng2-charts): workout frequency, running pace, body metrics
- Standalone components, signals, zoneless change detection
- Pages: Dashboard, Workouts, Running, Exercises, Progress

### 2. Run Ralph Loop on a New Project
- Use `scripts/ralph-loop.sh` against a fresh domain to validate the pattern
- Test with a completely different API to prove template flexibility
- Measure tokens per task, duration, pass rate

### 3. Wire Agent-One as Claude Code Custom Agent
- Create `.claude/agents/agent-one.md` agent definition
- Make it invocable via Claude Code with `agent-one` subagent type
- Test the agent bridge (`src/agent-bridge.mts`) in a real Claude Code session

### 4. Publish @kavix-one/agent-one to npm
- Finalize package.json for publishing
- Build step (if needed)
- Publish to npm: `npx @kavix-one/agent-one generate my-api`

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
- Rate limiting / auth middleware addon
- Pagination helper addon

### 8. CI/CD Pipeline
- GitHub Actions for agent-one (lint + test on PR)
- GitHub Actions template generated for output projects
- Docker-compose for CI integration tests

---

## Long-Term

### 9. Angular UI Generation (agent-one capability)
- Add templates for Angular standalone components, services, routes
- Generate matching UI for any API agent-one creates
- Chart components, forms, data tables

### 10. Multi-Agent Orchestration
- Separate worker and reviewer agents (full Ralph Loop with cross-model review)
- Parallel feature generation for independent entities

### 11. Self-Improvement Loop
- Agent-one analyzes trace data to identify template improvements
- Feedback loop: failures → prompt adjustments → better output

### 12. S3 Trace Storage
- trace-writer-s3.mts alongside fs and MongoDB writers
- Long-term archival, cross-machine access
