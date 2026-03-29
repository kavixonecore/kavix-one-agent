# Phase 4: Open Questions Resolution

8 technical decisions resolved across 2 interview rounds.

---

## Round 5 — Questions 1-4

| # | Question | Options Presented | Decision | Rationale |
|---|----------|-------------------|----------|-----------|
| 1 | Template engine for code generation? | 1. Handlebars 2. ETA 3. Raw template literals 4. LLM-generated (no templates) | **Raw TypeScript template literals** | Zero external dependencies, full TypeScript control, type-safe string interpolation. Templates are .tmpl.mts files exporting render functions. |
| 2 | NL prompt parsing approach? | 1. LLM-based (Claude API) 2. Rule-based pattern matching 3. Hybrid: rules first, LLM fallback | **LLM-based via Claude API (Anthropic SDK)** | Maximum flexibility for freeform natural language prompts. Can extract entities, relationships, and operations from ambiguous descriptions. |
| 3 | CLI framework? | 1. Commander.js 2. Citty 3. Custom arg parser 4. Cliffy | **Custom arg parser** | Zero external dependencies, Bun-native approach, full control over UX and argument handling. |
| 4 | Smoke test implementation? | 1. mongodb-memory-server 2. Mock at repository layer 3. Test containers (Docker) 4. Skip initially | **Docker + real MongoDB via docker-compose** | Most realistic testing environment. Use docker-compose.yml when multiple services are required. Requires Docker installed on dev machine. |

---

## Round 6 — Questions 5-8

| # | Question | Options Presented | Decision | Rationale |
|---|----------|-------------------|----------|-----------|
| 5 | Acceptable token cost per generation run? | 1. No hard limit 2. $1-2 per full API 3. $0.50 or less 4. Configurable per run | **No hard limit** | Use whatever tokens are needed for quality output. Optimize later by analyzing trace data from actual generation runs. |
| 6 | Multi-database extensibility boundary? | 1. IRepository<D,T> generic interface 2. Adapter pattern with DB driver plugin 3. Just MongoDB, refactor later 4. Repository interface + factory | **IRepository<D,T> generic + RepositoryFactory** (options 1 & 4 combined) | Templates reference IRepository only, never MongoDB directly. RepositoryFactory creates the right implementation based on config. New DB backends implement the interface and register in the factory — no template changes needed. |
| 7 | Agent-one's own DI pattern? | 1. Same getContainer() pattern 2. tsyringe or inversify 3. Simple factory functions | **Same getContainer() pattern it generates** | Dog-fooding the pattern proves it works and maintains consistency across all projects. If it's good enough for generated APIs, it's good enough for agent-one. |
| 8 | Monorepo readiness structural decisions? | 1. Package.json workspaces-ready 2. Shared libs/ from day one 3. Path aliases matching workspace convention 4. All three combined | **All three combined** | (1) Scoped package.json name (@project/api) with explicit deps. (2) libs/ folder for shared types/utils even in single-app mode. (3) tsconfig path aliases (@project/shared) that resolve locally now and to workspace packages later. Maximum future-proofing for Turborepo migration. |

---

## Decision Impact on PRD

All 8 decisions were applied to the PRD:

- Section 4.2 (Internal Stack): Updated template engine to "Raw TypeScript template literals", CLI framework to "Custom arg parser", LLM integration to include "No token budget limit"
- Section 4.3 (Module Structure): Template files renamed from `.hbs` to `.tmpl.mts`
- Section 8: Renamed from "Open Questions" to "Resolved Decisions" with all items checked off
