# PRD: Phase 1 — Core Engine
**Feature Slug**: phase1-core-engine

## Overview
Implement the foundational scaffolding, core interfaces, template system, renderers, and test suite for agent-one — a code generation harness that produces production-ready Elysia APIs following established cross-project patterns.

## Goals
- Produce a fully scaffolded, ESLint-clean, type-safe Bun/TypeScript project for agent-one itself
- Define and implement all core interfaces, types, and enums for the generation engine
- Implement 25 raw TypeScript template literals that generate correct Elysia API code
- Implement 12 renderers that orchestrate template output into file sets
- Implement the file writer and generation engine orchestrator
- Provide L1 unit test coverage across all templates with 3 domain fixtures

## Technical Approach
- Project root: `C:/projects/kavix-one/agent-one`
- Package: `@kavix-one/agent-one`, type: module, Bun runtime
- All source in `.mts` files with `.mjs` import specifiers
- Templates live in `templates/base/` as `.tmpl.mts` files exporting render functions
- Renderers in `src/generation/renderers/` consume templates, produce `IRenderedFile[]`
- Tests in `tests/` using `bun:test`, fixtures in `tests/fixtures/`
- ESLint flat config in `eslint.config.mjs` matching canonical config from `.ai/10-eslint-canonical.md`

## Tasks

- [ ] **TASK-001**: Project Scaffolding
  - **Description**: Initialize `package.json` with name `@kavix-one/agent-one`, type module. Create `tsconfig.json` strict/ESNext with path aliases. Create `eslint.config.mjs` matching canonical config. Install all runtime and dev dependencies via `bun add`.
  - **Acceptance**: `bun install` succeeds; `bun run lint` exits 0 on empty src; `tsc --noEmit` exits 0.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun run lint`

- [ ] **TASK-002**: Core Interfaces, Types, and Enums
  - **Description**: Create all files in `src/core/interfaces/`, `src/core/types/`, and `src/core/enums/` with barrel exports. Includes IFeatureSpec, IGenerationPlan, ITemplate, ITraceEntry, IVerificationResult, GenerationStatus union, TemplateType const enum, AddonType const enum.
  - **Acceptance**: All files pass `tsc --noEmit` and lint clean. Barrel exports compile. IFeatureSpec has fields array typed correctly. ITemplate has plan/render/validate methods.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun run lint && bun run typecheck`

- [ ] **TASK-003**: Env Config and Logger
  - **Description**: Create `src/config/env.mts` with Zod schema for ANTHROPIC_API_KEY, MONGO_HOSTNAME, MONGO_USERNAME, MONGO_PASSWORD, MONGO_CLUSTER_NAME, NODE_ENV, API_PORT. Create `src/config/index.mts` barrel. Create `src/logger/logger.mts` with Winston factory.
  - **Acceptance**: Zod validates required vars at module load; logger exports named `createLogger` function; lint clean.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun run lint && bun run typecheck`

- [ ] **TASK-004**: Base Templates — Infrastructure (package-json, tsconfig, eslint-config, gitignore, env-example, docker-compose)
  - **Description**: Create 6 infrastructure templates in `templates/base/`. Each exports a named render function taking `IFeatureSpec | IGenerationContext` and returning a string. Templates generate correct file content matching canonical patterns.
  - **Acceptance**: Each template function returns a non-empty string. Generated package.json has scoped name, type module, correct deps. Generated tsconfig has strict:true, path aliases. Generated eslint.config.mjs has all 5 plugins and the 3 modified rules.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun test tests/generation/templates/infrastructure.test.ts`

- [ ] **TASK-005**: Base Templates — Code Generation (interface, schema, repository, service, router, swagger-detail, test, service-interface)
  - **Description**: Create 8 code-generation templates. These are the most critical — they must match the exact patterns from real projects (router factory pattern, BaseRepository extension, getContainer pattern, response format).
  - **Acceptance**: Each template produces syntactically valid TypeScript matching L1 assertions in `.ai/11-test-plan.md`. Configuration fixture (simple CRUD) passes all template assertions.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun test tests/generation/templates/code.test.ts`

- [ ] **TASK-006**: Base Templates — Project Bootstrap (container, env-config, server, health-router, version-router, trace-plugin, logger, database-config, repository-factory, barrel, container-interface)
  - **Description**: Create 11 project-bootstrap templates that generate the IOC/wiring layer. These generate `getContainer()`, server setup with cors+swagger+tracePlugin, health/version routers, trace plugin, and logger factory.
  - **Acceptance**: Container template generates valid `getContainer()` with IContainer return type. Server template composes cors+swagger+tracePlugin+routes. Health router returns `{ status: "ok", timestamp, service }`.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun test tests/generation/templates/bootstrap.test.ts`

- [ ] **TASK-007**: Test Fixtures
  - **Description**: Create 3 domain fixtures in `tests/fixtures/`: configuration (simple CRUD), registered-sheets (medium, indexes), photo-analysis (complex, nested objects). These are `IFeatureSpec` instances conforming to the interface.
  - **Acceptance**: All 3 fixtures import and compile without errors. IFeatureSpec fields are correctly typed. Indexes, enums, and nested field types are represented.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun run typecheck`

- [ ] **TASK-008**: L1 Template Unit Tests
  - **Description**: Create L1 unit test files that test each template with all 3 domain fixtures. Test files: `tests/generation/templates/infrastructure.test.ts`, `tests/generation/templates/code.test.ts`, `tests/generation/templates/bootstrap.test.ts`. Assertions match the per-template assertions in `.ai/11-test-plan.md`.
  - **Acceptance**: `bun test` runs all tests, all pass. Each template is tested against Configuration fixture at minimum. Structural assertions (contains string X, does not contain Y) are explicit.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun test`

- [ ] **TASK-009**: Renderers
  - **Description**: Create 12 renderer files in `src/generation/renderers/`. Each renderer: imports the corresponding template(s), implements a render function that returns `IRenderedFile[]`, and maps `IFeatureSpec` to file paths + content. Includes interface, schema, repository, service, router, test, swagger, container, env, server, repository-factory, docker-compose renderers.
  - **Acceptance**: Each renderer returns at least one `IRenderedFile`. Paths follow the generated project structure from PRD Section 4.7. Import paths in rendered content use `.mjs` extension.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun run lint && bun run typecheck`

- [ ] **TASK-010**: File Writer and Generation Engine
  - **Description**: Create `src/output/file-writer.mts` using `Bun.write()` to persist rendered files. Create `src/generation/engine.mts` as the orchestrator that iterates a generation plan, calls renderers per feature in bottom-up order, and invokes the file writer. Create `src/generation/template-registry.mts`.
  - **Acceptance**: File writer creates files at correct paths. Engine processes a 1-feature plan and produces all expected files in a temp directory. Template registry can list all registered templates.
  - **Test Command**: `cd C:/projects/kavix-one/agent-one && bun test tests/generation/engine.test.ts`

## Acceptance Criteria
- `bun run lint` exits 0 across entire project (zero ESLint errors)
- `bun run typecheck` exits 0 (zero TypeScript errors)
- `bun test` passes all L1 template unit tests for all 3 domain fixtures
- All templates produce output matching the canonical patterns from `.ai/03-cross-project-patterns.md`
- All source files use `.mts` extension with `.mjs` import specifiers
- No `any` types anywhere
- All functions have explicit return types

## Out of Scope
- Phase 2: prompt parser, PRD parser, features.json state store
- Phase 3: verification pipeline, trace logger, git ops
- Phase 4: addon templates, template registry filesystem discovery
- Phase 5: CLI entry point, agent bridge
- L2/L3/L4 integration/compilation/lint tests of generated output
