# Phase 3: Requirements Interview

6 rounds of structured questions across 4 interview sessions.

---

## Round 1 — Core Scope

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| What should agent-one's primary trigger be? | 1. NL prompt 2. OpenAPI schema 3. PRD-first 4. Hybrid | **NL prompt + PRD-first workflow** (options 1 & 3) |
| Which database backends? | 1. MongoDB only 2. MongoDB + SQLite 3. DB-agnostic 4. MongoDB primary + extensible later | **MongoDB only + extensible later** (options 1 & 4) |
| Single-app or monorepo generation? | 1. Single API 2. Monorepo (Turborepo) 3. Configurable 4. Start single grow to mono | **Start single, grow to mono** (option 4) |
| Generate Angular UI? | 1. API only 2. API + Angular 3. API first UI later 4. API + any UI | **API first, UI later** (option 3) |

---

## Round 2 — Architecture & State

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| DI container pattern? | 1. Manual getContainer() always 2. Manual now abstract later 3. Use DI library | **Manual now, abstract later** (option 2) |
| Validation pattern? | 1. Zod always 2. Elysia t.Object() for routes + Zod for domain 3. Zod everywhere + Elysia detail | **Zod schemas always** (option 1) |
| Azure infrastructure scaffolding? | 1. API only 2. Optional Azure addons 3. Full Azure stack | **Azure via Terraform + AWS via CDK** (custom answer — not limited to Azure) |
| State management approach? | 1. Progress file + git 2. Task-based feature JSON 3. PRD checkboxes + git 4. All three combined | **All three combined + custom additions** (option 4 + custom) |

---

## Round 3 — Customizations & Delivery

**State management customizations (multi-select):**

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| What customizations beyond PRD + feature JSON + git? | 1. Verification gates 2. Human review checkpoints 3. Rollback snapshots 4. Session handoff docs | **Verification gates + Human review checkpoints + Session handoff docs** (options 1, 2, 4) |

**User-provided additional requirements (not from options):**
- Document tool uses per iteration
- Track token consumption per step
- Capture iteration results
- Log errors encountered (full details)
- Full documentation from each step
- Storage: `.docs/<step-name-iteration>.md` files + MongoDB collection

---

**Remaining Round 3 questions:**

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| Use @sylvesterllc packages or inline? | 1. Published packages 2. Inline patterns 3. Configurable | **Use published packages** (option 1) |
| Logging pattern? | 1. Always Winston + TraceLogger 2. Winston base, TraceLogger optional 3. Configurable | **Winston always — TraceLogger needed for microservice observability** (option 1 with rationale) |
| Delivery target? | 1. Claude Code agent 2. Bun CLI 3. Both 4. MCP server | **All three: Claude Code agent + CLI + combined** (options 1, 2, 3) |
| Execution trace storage? | 1. Local JSON/markdown 2. SQLite 3. MongoDB 4. JSON + optional DB | **`.docs/<step-name-iteration>.md` + MongoDB collection** (custom answer combining 1 & 3) |

---

## Round 4 — Generation Details

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| Feature generation order? | 1. Bottom-up (Interfaces→Schema→Repo→Service→Router) 2. Top-down 3. Schema+Interfaces then up 4. All at once | **Bottom-up: Interfaces → Schema → Repo → Service → Router** (option 1) |
| Test generation strategy? | 1. With each feature 2. Separate pass 3. TDD 4. Configurable | **Tests with each feature + TDD** (options 1 & 3) |
| Swagger/API docs handling? | 1. Full detail on every route 2. Minimal tags + summary 3. Separate OpenAPI spec | **Full details in separate docs/ folder (clean routes) + standalone openapi.yaml** (options 1 & 3 combined, with clarification: detail objects referenced from docs/ folder, not inline in route files) |
| CRUD only or custom patterns? | 1. CRUD + custom 2. CRUD only 3. Template-based extensibility | **Template-based extensibility** (option 3) |
