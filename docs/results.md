# Agent-One — Discovery Session Results

> **Date:** 2026-03-28
> **Participants:** Davis Sylvester (user), Claude Opus 4.6 (agent)
> **Session Goal:** Research agent harness patterns, review existing codebases, interview for requirements, produce PRD
> **Output:** `docs/PRD.md` (611 lines, ~4,500-5,000 tokens, ~0.5% of 1M context)

---

## Phase 1: Harness Research

Three articles were reviewed to establish foundational knowledge for building agent-one:

### Article 1 — Anthropic: Effective Harnesses for Long-Running Agents

**Source:** https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

**Key Takeaways:**

- **Two-agent architecture:** Initializer Agent (bootstraps project, creates init.sh, progress.txt, feature list) + Coding Agent (reads progress, works one feature at a time, commits, updates docs)
- **Session initialization protocol:** verify directory → read progress → review feature list → start dev server → test baseline → then start new work
- **Features tracked as structured JSON** with status flags (not markdown) — prevents agents from inappropriately modifying them
- **Incremental progress:** one feature per session prevents context exhaustion
- **End-to-end verification** via browser automation (Puppeteer), not just unit tests
- **Git as recovery mechanism:** commits at every feature boundary

### Article 2 — LangChain: The Anatomy of an Agent Harness

**Source:** https://blog.langchain.com/the-anatomy-of-an-agent-harness/

**Key Takeaways:**

- **Core equation:** Agent = Model + Harness
- **Five harness primitives:**
  1. Filesystem — durable storage, cross-session persistence, multi-agent coordination
  2. Bash/Code Execution — general-purpose tool > fixed tool set
  3. Sandboxes — isolated, safe execution with pre-configured runtimes
  4. Memory & Knowledge — persistent files (AGENTS.md) + real-time access (web search, MCP)
  5. Context Management — compaction, tool-call offloading, progressive skill disclosure
- **Behavior-driven design:** identify desired behaviors first, then engineer harness features
- **Ralph Loop pattern:** hooks intercept model exits and reinject original prompt in clean context
- **Model-harness co-evolution:** models post-trained with harnesses create tight coupling (benefit and risk)

### Article 3 — OpenAI: Harness Engineering (Codex)

**Source:** https://openai.com/index/harness-engineering/ (403 — content retrieved via InfoQ and Martin Fowler coverage)

**Additional Sources:**
- https://www.infoq.com/news/2026/02/openai-harness-engineering-codex/
- https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html

**Key Takeaways:**

- **Results:** 3 engineers, 5 months, ~1M lines of code, ~1,500 PRs (~3.5 PRs/engineer/day), zero manually written code
- **Three pillars:**
  1. Context Engineering — structured knowledge bases in repo, dynamic context (observability, browser)
  2. Architectural Constraints — custom linters, structural tests enforcing layer boundaries (Types → Config → Repo → Service → Runtime → UI)
  3. Entropy Management ("Garbage Collection") — periodic agent runs detecting doc inconsistencies, constraint violations
- **Key insight:** "Give the agent a map, not a 1,000-page manual." Context is scarce.
- **Philosophy shift:** Engineers move from writing code to designing environments, specifying intent, building feedback loops

### Unified Principles (All Three)

1. State persistence across sessions — filesystem + git as handoff mechanism
2. Incremental, scoped work — small units prevent context exhaustion
3. Self-verification — agents must test their own work
4. Constraints > instructions — linters, structural tests, and enforced boundaries beat lengthy prompts
5. Context is scarce — compact, offload, progressively disclose
6. Treat agent struggles as system signals — improve the harness, not just the prompt
7. Documentation as machine-readable infrastructure

---

## Phase 2: Codebase Review

Five projects were explored to extract Davis's established coding patterns:

### Project 1 — CMMS API (`C:\projects\sylvesterllc\cmms`)

| Aspect | Pattern |
|--------|---------|
| Runtime | Bun |
| Language | TypeScript strict (.mts) |
| Framework | Elysia |
| Database | MongoDB (MongoClient, @sylvesterllc/mongo BaseRepository) |
| Architecture | Router → Service → Repository, feature-based folders |
| DI | Manual getContainer() returning IContainer { db, databaseConfig, repositories, services, helpers } |
| Validation | Zod schemas with safeParse, assertValid helpers |
| Logging | Winston with structured JSON, logger injection |
| IDs | ULID |
| Enums | String enums (WorkOrderStatus, WorkOrderPriority, WorkOrderType) |
| Interfaces | I-prefix on names, i-prefix on filenames, one per file |
| Response Format | { success: true, data, count } or { success: false, error } |
| Router Pattern | Factory function: (logger, service, config) → new Elysia({ prefix }) |
| Repository | extends BaseRepository, init() calls ensureIndexes() |
| Service | Constructor receives repository interface + logger |
| Error Handling | try-catch in routes with logger.error() and set.status |
| Tests | bun test, in-memory mock repositories |
| Azure | KeyVault, Storage Queue, Managed Identity |
| External | Fexa CMMS integration, ServiceNow, Teams notifications |
| Barrel Exports | index.mts per folder with named exports |

### Project 2 — Utils Library (`C:\projects\sylvesterllc\utils\src`)

| Aspect | Pattern |
|--------|---------|
| Type | Shared npm package (@sylvesterllc/utils) |
| Exports | TraceLogger, TeamsNotificationService, Adaptive Card interfaces |
| TraceLogger | Winston-based, ULID trace IDs, 4 log levels, console + file output |
| DI | Constructor injection (logger, optional config params) |
| Error Handling | Return boolean (graceful degradation), no throws for recoverable errors |
| Config Resolution | Parameter > env var > default |
| Build | Bun build (ESM) + tsc for declarations |
| Interface Pattern | One per file, i-prefix, barrel exports with `export type` |
| Private Fields | Uses # syntax (ES private fields) |

### Project 3 — YouTube Daily Digest (`C:\projects\davisSylvester\youtube-daily-digest\src`)

| Aspect | Pattern |
|--------|---------|
| Runtime | Bun |
| Framework | Elysia |
| Database | SQLite + Drizzle ORM |
| Logging | Pino (structured) with AsyncLocalStorage trace propagation |
| Validation | Zod for env, Elysia t.Object() for routes |
| Architecture | Vertical feature slicing (youtube/, ranking/, digest/, jobs/) |
| Trace Plugin | onRequest (ULID traceId via AsyncLocalStorage) → onAfterHandle → onError |
| Env Config | Zod schema validating Bun.env at module load (fail-fast) |
| Server Setup | cors + swagger + tracePlugin + apiRoutes composition |
| Fire-and-Forget | Async tasks with .catch() to prevent unhandled rejections |
| No DI Container | Direct imports, singleton instances at module scope |
| Angular UI | Standalone components, signals-based state, inject() API, zoneless |

### Project 4 — Smartsheet API (`C:\projects\davaco\smartsheet-api`)

| Aspect | Pattern |
|--------|---------|
| Runtime | Bun |
| Framework | Elysia |
| Database | MongoDB (abstract BaseRepository<D, T>) |
| DI | Manual getContainer() in config/ioc/ |
| Validation | Manual validation (no Zod — error array collection pattern) |
| Router Pattern | Factory function with .decorate() for DI, .group() for route grouping |
| Middleware | .onBeforeHandle() for API key validation |
| External | Smartsheet SDK, Azure Storage Queue, Axios |
| Logging | Winston (simple format, console transport) |
| Correlation IDs | UUID passed through service calls |
| Date/Time | Luxon throughout |
| Response Format | Objects with error field or success indicators |
| Barrel Exports | Wildcard re-exports from index files |

### Project 5 — CT AI Photo QC (`C:\projects\davaco\ct-ai-photo-qc`)

| Aspect | Pattern |
|--------|---------|
| Structure | Turborepo monorepo: apps/ (ai-api, ai-analysis-consumer, ai-fetch-instances-timer-job, ai-ui) + libs/ (ai-engine, shared) |
| Runtime | Bun |
| Framework | Elysia |
| Database | MongoDB (v7) |
| AI | OpenAI SDK configured for Grok API (grok-4), vision analysis |
| DI | getContainer() returning IContainer with db, repos, services, helpers |
| Validation | Zod schemas in shared lib, @sinclair/typebox for Elysia route schemas |
| Logging | Winston + TraceLogger from @sylvesterllc/utils |
| Path Aliases | @ct-ai-photo-qc/shared, @ct-ai-photo-qc/ai-engine |
| Queue Consumer | Azure Storage Queue polling, processes messages, calls API |
| Timer Job | Configurable interval, calls external .NET API |
| Docker | Multi-app container builds, Azure Container Registry |
| Middleware | Correlation ID generation (onRequest), request logging (onAfterHandle) |
| Image Handling | Accessibility check → download → base64 conversion → AI analysis |

### Cross-Project Pattern Summary

**Consistent across all projects:**
- Bun runtime + TypeScript strict (.mts)
- Elysia web framework
- Winston logging (or Pino in one project)
- Feature/domain-based folder organization
- Named exports, barrel files
- kebab-case files, PascalCase classes, camelCase variables
- Conventional commits
- ULID for IDs
- MongoDB as primary database
- getContainer() IoC pattern (3 of 5 projects)
- @sylvesterllc/mongo BaseRepository (3 of 5 projects)
- @sylvesterllc/utils TraceLogger (2 of 5 projects)

---

## Phase 3: Requirements Interview

### Round 1 — Core Scope

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| What should agent-one's primary trigger be? | NL prompt, OpenAPI schema, PRD-first, Hybrid | **NL prompt + PRD-first workflow** (options 1 & 3) |
| Which database backends? | MongoDB only, MongoDB + SQLite, DB-agnostic, MongoDB primary + extensible later | **MongoDB only + extensible later** (options 1 & 4) |
| Single-app or monorepo generation? | Single API, Monorepo (Turborepo), Configurable, Start single grow to mono | **Start single, grow to mono** |
| Generate Angular UI? | API only, API + Angular, API first UI later, API + any UI | **API first, UI later** |

### Round 2 — Architecture & State

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| DI container pattern? | Manual getContainer() always, Manual now abstract later, Use DI library | **Manual now, abstract later** |
| Validation pattern? | Zod always, Elysia t.Object() for routes + Zod for domain, Zod everywhere + Elysia detail | **Zod schemas always** |
| Azure infrastructure scaffolding? | API only, Optional Azure addons, Full Azure stack | **Azure via Terraform + AWS via CDK** (custom answer) |
| State management approach? | Progress file + git, Task-based feature JSON, PRD checkboxes + git, All three combined | **All three combined + custom additions** |

### Round 3 — Customizations & Delivery

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| State management customizations? | Verification gates, Human review checkpoints, Rollback snapshots, Session handoff docs | **Verification gates + Human review checkpoints + Session handoff docs** (options 1, 2, 4) |

**Additional custom state requirements (user-provided):**
- Document tool uses per iteration
- Track token consumption per step
- Capture iteration results
- Log errors encountered (full details)
- Full documentation from each step

→ Storage: `.docs/<step-name-iteration>.md` files + MongoDB collection

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| Use @sylvesterllc packages or inline? | Published packages, Inline patterns, Configurable | **Use published packages** |
| Logging pattern? | Always Winston + TraceLogger, Winston base TraceLogger optional, Configurable | **Winston always — TraceLogger needed for microservice observability** |
| Delivery target? | Claude Code agent, Bun CLI, Both, MCP server | **All three: Claude Code agent + CLI + combined** (options 1, 2, 3) |
| Execution trace storage? | Local JSON/markdown, SQLite, MongoDB, JSON + optional DB | **`.docs/<step-name-iteration>.md` + MongoDB collection** (custom answer) |

### Round 4 — Generation Details

| Question | Options Presented | Answer |
|----------|-------------------|--------|
| Feature generation order? | Interfaces→Schema→Repo→Service→Router (bottom-up), Top-down, Schema+Interfaces then up, All at once | **Bottom-up: Interfaces → Schema → Repo → Service → Router** |
| Test generation strategy? | With each feature, Separate pass, TDD, Configurable | **Tests with each feature + TDD** (options 1 & 3) |
| Swagger/API docs handling? | Full detail on every route, Minimal tags + summary, Separate OpenAPI spec | **Full details in separate docs/ folder (clean routes) + standalone openapi.yaml** (options 1 & 3 combined) |
| CRUD only or custom patterns? | CRUD + custom, CRUD only, Template-based extensibility | **Template-based extensibility** |

---

## Phase 4: Open Questions Resolution

### Round 5 — Technical Decisions (Questions 1-4)

| Question | Options Presented | Answer | Rationale |
|----------|-------------------|--------|-----------|
| Template engine? | Handlebars, ETA, Raw template literals, LLM-generated | **Raw TypeScript template literals** | Zero deps, full TS control, type-safe interpolation |
| NL prompt parsing approach? | LLM-based (Claude API), Rule-based, Hybrid | **LLM-based via Claude API** | Maximum flexibility for freeform prompts |
| CLI framework? | Commander.js, Citty, Custom arg parser, Cliffy | **Custom arg parser** | Zero deps, Bun-native, full control |
| Smoke test implementation? | mongodb-memory-server, Mock repos, Test containers (Docker), Skip initially | **Docker + real MongoDB via docker-compose** | Most realistic; docker-compose for multi-service setups |

### Round 6 — Technical Decisions (Questions 5-8)

| Question | Options Presented | Answer | Rationale |
|----------|-------------------|--------|-----------|
| Token budget per run? | No limit, $1-2, $0.50 or less, Configurable | **No hard limit** | Optimize later from trace data |
| Multi-database extensibility boundary? | IRepository<D,T> generic, Adapter pattern, Just MongoDB, Repository + Factory | **IRepository<D,T> + RepositoryFactory** (options 1 & 4) | Templates reference IRepository only, never MongoDB directly |
| Agent-one's own DI? | Same getContainer(), tsyringe/inversify, Simple factories | **Same getContainer() pattern** | Dog-fooding, consistency |
| Monorepo readiness decisions? | Workspaces-ready pkg.json, Shared libs/ from day one, Path aliases, All three | **All three combined** | Scoped pkg name + libs/ folder + tsconfig path aliases |

---

## Final Decision Registry

All decisions made during this session, organized by category:

### Input & Interaction

| Decision | Choice |
|----------|--------|
| Primary input mode | Natural language prompt + PRD-first workflow |
| Prompt parsing | LLM-based via Claude API (Anthropic SDK) |
| Token budget | No hard limit |
| Human review | Checkpoints after PRD and after each feature |

### What Gets Generated

| Decision | Choice |
|----------|--------|
| Runtime | Bun |
| Language | TypeScript strict (.mts files, .mjs import specifiers) |
| Framework | Elysia |
| Database | MongoDB primary, extensible via IRepository<D,T> + RepositoryFactory |
| Base repository | @sylvesterllc/mongo (published package) |
| Utilities | @sylvesterllc/utils (published package) |
| Validation | Zod everywhere |
| Logging | Winston + TraceLogger (always) |
| IDs | ULID |
| DI pattern | Manual getContainer() (abstractable later) |
| Project scope | Single-app, designed to grow into Turborepo monorepo |
| Monorepo readiness | Scoped pkg name + libs/ folder + tsconfig path aliases |
| UI generation | API only (Angular UI deferred to future phase) |

### Generation Process

| Decision | Choice |
|----------|--------|
| Feature generation order | Bottom-up: Interfaces → Zod Schemas → Repository → Service → Router → Tests |
| Template engine | Raw TypeScript template literals (.tmpl.mts files) |
| Test strategy | Tests alongside each feature + TDD stubs |
| Swagger docs | Full detail in separate docs/ folder + standalone openapi.yaml |
| Extensibility model | CRUD base template + pluggable addon templates |

### State Management

| Decision | Choice |
|----------|--------|
| Planning tracker | PRD with checkboxes |
| Status tracker | features.json with structured flags |
| Checkpoints | Git commits after each feature |
| Verification gates | ESLint + bun test + endpoint smoke test |
| Smoke tests | Docker + real MongoDB via docker-compose |
| Human review | Pause after PRD, after each feature |
| Session persistence | Handoff docs with state, blockers, next steps |

### Execution Tracing

| Decision | Choice |
|----------|--------|
| What to capture | Tool uses, token consumption, iteration results, errors, full step docs |
| Local storage | `.docs/<step-name-iteration>.md` |
| Remote storage | MongoDB collection |
| Budget | No hard limit, optimize from trace data |

### Delivery & Distribution

| Decision | Choice |
|----------|--------|
| Mode 1 | Claude Code custom agent |
| Mode 2 | Standalone Bun CLI |
| Mode 3 | Combined (shared core) |
| CLI framework | Custom arg parser (zero deps) |
| Agent-one's own DI | Same getContainer() pattern it generates |

### Infrastructure Addons (Template-Based)

| Addon | Technology |
|-------|-----------|
| Azure | Terraform |
| AWS | CDK |
| Queue consumer | Pluggable template |
| External API client | Pluggable template |
| Teams notifications | Pluggable template |
| Timer/scheduled jobs | Pluggable template |

---

## Artifacts Produced

| Artifact | Location | Description |
|----------|----------|-------------|
| PRD | `docs/PRD.md` | 611 lines, 6 sections, 60+ checkboxed requirements, 5-phase timeline, all open questions resolved |
| Results | `docs/results.md` | This document — full session transcript, decisions, and rationale |
| Memory: User Profile | `.claude/memory/user_profile.md` | Davis's role, expertise, and preferences |
| Memory: Requirements | `.claude/memory/project_agent_one_requirements.md` | Complete agent-one requirements + resolved decisions |
| Memory: Coding Patterns | `.claude/memory/feedback_coding_patterns.md` | Coding conventions the agent must replicate |
| Memory: Index | `.claude/memory/MEMORY.md` | Index of all memory files |

---

## Next Steps

1. Review PRD (`docs/PRD.md`) for any final adjustments
2. Begin **Phase 1 — Core Engine** (Weeks 1-3):
   - Project scaffolding: Bun + TypeScript strict + ESLint + bun test
   - Core interfaces (IFeatureSpec, ITemplate, IGenerationPlan, ITraceEntry)
   - Env config with Zod validation
   - Raw template literal templates for all base files
   - Renderers for all base templates
   - File writer module
   - Generation engine orchestrator
   - getContainer() renderer
   - Server setup renderer
   - openapi.yaml generator
