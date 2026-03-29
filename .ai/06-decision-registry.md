# Final Decision Registry

All 30+ decisions made during the discovery session, organized by category.

---

## Input & Interaction

| Decision | Choice | Source |
|----------|--------|--------|
| Primary input mode | Natural language prompt + PRD-first workflow | Round 1 |
| Prompt parsing | LLM-based via Claude API (Anthropic SDK) | Round 5, Q2 |
| Token budget | No hard limit — optimize later from trace data | Round 6, Q5 |
| Human review | Checkpoints after PRD and after each feature | Round 3 |

## What Gets Generated

| Decision | Choice | Source |
|----------|--------|--------|
| Runtime | Bun | Codebase review (all 5 projects) |
| Language | TypeScript strict (.mts files, .mjs import specifiers) | Codebase review (all 5 projects) |
| Framework | Elysia | Codebase review (all 5 projects) |
| Database | MongoDB primary, extensible via IRepository<D,T> + RepositoryFactory | Round 1 + Round 6 Q6 |
| Base repository | @sylvesterllc/mongo (published package) | Round 3 |
| Utilities | @sylvesterllc/utils (published package) | Round 3 |
| Validation | Zod everywhere (schemas + z.infer<> types) | Round 2 |
| Logging | Winston + TraceLogger (always, for microservice observability) | Round 3 |
| IDs | ULID | Codebase review (all 5 projects) |
| DI pattern | Manual getContainer() (abstractable later) | Round 2 |
| Project scope | Single-app, designed to grow into Turborepo monorepo | Round 1 |
| Monorepo readiness | Scoped pkg name + libs/ folder + tsconfig path aliases | Round 6, Q8 |
| UI generation | API only (Angular UI deferred to future phase) | Round 1 |

## Generation Process

| Decision | Choice | Source |
|----------|--------|--------|
| Feature generation order | Bottom-up: Interfaces → Zod Schemas → Repository → Service → Router → Tests | Round 4 |
| Template engine | Raw TypeScript template literals (.tmpl.mts files) | Round 5, Q1 |
| Test strategy | Tests alongside each feature + TDD stubs | Round 4 |
| Swagger docs | Full detail in separate docs/ folder + standalone openapi.yaml | Round 4 |
| Extensibility model | CRUD base template + pluggable addon templates | Round 4 |

## State Management

| Decision | Choice | Source |
|----------|--------|--------|
| Planning tracker | PRD with checkboxes | Round 2 |
| Status tracker | features.json with structured flags | Round 2 |
| Checkpoints | Git commits after each feature | Round 2 |
| Verification gates | ESLint + bun test + endpoint smoke test | Round 3 |
| Smoke tests | Docker + real MongoDB via docker-compose | Round 5, Q4 |
| Human review | Pause after PRD, after each feature | Round 3 |
| Session persistence | Handoff docs with state, blockers, next steps | Round 3 |

## Execution Tracing

| Decision | Choice | Source |
|----------|--------|--------|
| What to capture | Tool uses, token consumption, iteration results, errors, full step docs | Round 3 (user-provided) |
| Local storage | `.docs/<step-name-iteration>.md` | Round 3 (user-provided) |
| Remote storage | MongoDB collection | Round 3 (user-provided) |
| Budget | No hard limit, optimize from trace data | Round 6, Q5 |

## Delivery & Distribution

| Decision | Choice | Source |
|----------|--------|--------|
| Mode 1 | Claude Code custom agent | Round 3 |
| Mode 2 | Standalone Bun CLI | Round 3 |
| Mode 3 | Combined (shared core) | Round 3 |
| CLI framework | Custom arg parser (zero deps) | Round 5, Q3 |
| Agent-one's own DI | Same getContainer() pattern it generates | Round 6, Q7 |

## Infrastructure Addons (Template-Based)

| Addon | Technology | Source |
|-------|-----------|--------|
| Azure | Terraform | Round 2 (custom answer) |
| AWS | CDK | Round 2 (custom answer) |
| Queue consumer | Pluggable template | Round 4 |
| External API client | Pluggable template | Round 4 |
| Teams notifications | Pluggable template | Round 4 |
| Timer/scheduled jobs | Pluggable template | Round 4 |
