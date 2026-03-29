# Agent-One Test Plan

> **Date:** 2026-03-28
> **Approach:** Bottom-up (L1→L4), structural assertions + diffs for review
> **Pass Criteria:** Generated projects must compile, lint clean, and run successfully
> **Framework:** bun test

---

## Test Domains

3 domains must all pass before templates are considered validated:

| # | Domain | Source Project | Complexity | Key Patterns Tested |
|---|--------|---------------|------------|---------------------|
| 1 | Configuration | cmms | Simple CRUD | Basic entity, getContainer, router factory, Zod schema |
| 2 | Registered Sheets | smartsheet-api | Medium CRUD | Different entity shape, MongoDB indexes, custom queries |
| 3 | Photo Analysis | ct-ai-photo-qc | Complex | Nested objects (surveyData, analysisItems), metadata, external service integration |

---

## Test Levels

### L1: Template Unit Tests

**What:** Each `.tmpl.mts` template produces syntactically correct TypeScript for a given IFeatureSpec input.

**Test file:** `tests/generation/templates/*.test.ts`

**Sample IFeatureSpec (Configuration domain):**

```typescript
const configFeatureSpec: IFeatureSpec = {
  name: "configuration",
  entityName: "Configuration",
  pluralName: "configurations",
  collectionName: "configuration",
  fields: [
    { name: "serviceName", type: "string", required: true },
    { name: "configKey", type: "string", required: true },
    { name: "configValue", type: "string", required: true },
    { name: "isActive", type: "boolean", required: true, default: true },
    { name: "description", type: "string", required: false },
  ],
  enums: [],
  indexes: [
    { fields: ["serviceName", "configKey"], unique: true, name: "idx_service_config" },
  ],
};
```

**Assertions per template:**

#### interface.tmpl.mts
- [ ] Output contains `export interface IConfiguration`
- [ ] All fields present with correct TypeScript types
- [ ] Optional fields use `fieldName?: type` syntax
- [ ] Has `readonly` on all properties
- [ ] Has `_id?: ObjectId` field
- [ ] File would be named `i-configuration.mts`

#### schema.tmpl.mts
- [ ] Output contains `z.object({`
- [ ] All fields present with correct Zod validators
- [ ] Required fields use `z.string().min(1)` or similar
- [ ] Optional fields use `.optional()`
- [ ] Has `export type Configuration = z.infer<typeof ConfigurationSchema>`
- [ ] Has `export function validateConfiguration(raw: unknown)` using safeParse

#### repository.tmpl.mts
- [ ] Output contains `export class ConfigurationRepository extends BaseRepository`
- [ ] Generic params: `<MongoClient, IConfiguration>`
- [ ] Has `async init()` method calling `ensureIndexes()`
- [ ] ensureIndexes creates the composite unique index
- [ ] Constructor receives `IDatabase<MongoClient>`, database name, collection name, logger

#### service.tmpl.mts
- [ ] Output contains `export class ConfigurationService`
- [ ] Constructor receives `IConfigurationRepository` (interface, not impl) + logger
- [ ] Has CRUD methods: create, getAll, getById, update, delete
- [ ] Each method has try-catch with logger.error()
- [ ] All methods have explicit return types

#### router.tmpl.mts
- [ ] Output is a factory function: `export const configurationRouter = (logger, service) =>`
- [ ] Returns `new Elysia({ prefix: "/api/configurations" })`
- [ ] Has GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- [ ] Each route has try-catch with logger.error() and set.status
- [ ] Response format: `{ success: true, data }` or `{ success: false, error }`
- [ ] Swagger detail imported from docs/ folder, not inline
- [ ] Route file is clean/minimal

#### swagger-detail.tmpl.mts
- [ ] Contains detail objects with tags, summary, description
- [ ] Has request/response schema definitions
- [ ] Exports named objects (e.g., `getConfigurationsDetail`, `createConfigurationDetail`)

#### test.tmpl.mts
- [ ] Uses `import { describe, it, expect } from "bun:test"`
- [ ] Has describe block for ConfigurationService
- [ ] Has test stubs for each CRUD operation
- [ ] Uses mock repository (in-memory)
- [ ] All tests have explicit assertions

#### container.tmpl.mts
- [ ] Output contains `export async function getContainer()`
- [ ] Returns `IContainer` with db, databaseConfig, repositories, services, helpers
- [ ] Instantiates repositories with databaseConfig, dbName, collectionName, logger
- [ ] Calls `await repo.init()` for each repository
- [ ] Instantiates services with repository interface + logger

#### env-config.tmpl.mts
- [ ] Uses `z.object({}).parse(Bun.env)`
- [ ] Has NODE_ENV, API_PORT, MONGO_HOSTNAME, MONGO_USERNAME, MONGO_PASSWORD, MONGO_CLUSTER_NAME
- [ ] Exported as `export const env = envSchema.parse(Bun.env)`

#### server.tmpl.mts
- [ ] Creates Elysia app with cors + swagger + tracePlugin + apiRoutes
- [ ] Has `app.listen(PORT)`
- [ ] Logs startup info with logger.info

#### package-json.tmpl.mts
- [ ] Scoped name: `@project/api`
- [ ] type: module
- [ ] Has scripts: start, dev, test, lint, lint:fix
- [ ] Dependencies include: elysia, mongodb, @sylvesterllc/mongo, @sylvesterllc/utils, winston, zod, ulidx, luxon
- [ ] DevDependencies include: typescript, @types/bun, eslint, @eslint/js, typescript-eslint, @stylistic/eslint-plugin, eslint-plugin-import, eslint-plugin-jsdoc

#### tsconfig.tmpl.mts
- [ ] strict: true
- [ ] target: ESNext
- [ ] module: ESNext or Preserve
- [ ] moduleDetection: force
- [ ] Has path alias: `@project/shared` -> `libs/shared/src`

#### eslint-config.tmpl.mts
- [ ] Flat config format (export default [...])
- [ ] Has all 5 plugins: @eslint/js, typescript-eslint, @stylistic, import, jsdoc
- [ ] no-explicit-any: error
- [ ] explicit-function-return-type: error
- [ ] explicit-module-boundary-types: error
- [ ] quotes: double
- [ ] semi: always

#### docker-compose.tmpl.mts
- [ ] Has MongoDB service with port mapping
- [ ] Has volume for data persistence
- [ ] Environment variables for root user/password

#### health-router.tmpl.mts
- [ ] GET /health returns `{ status: "ok", timestamp, service }`

#### version-router.tmpl.mts
- [ ] GET /version returns `{ version, buildTime, gitCommit }`

#### gitignore.tmpl.mts
- [ ] Includes: node_modules, dist, .env, .docs, *.mjs (compiled), bun.lock

#### env-example.tmpl.mts
- [ ] Lists all env vars from env-config with placeholder values
- [ ] Comments explaining each variable

---

### L2: Renderer Integration Tests

**What:** Renderers produce correct file sets in correct order, with proper barrel exports and DI wiring.

**Test file:** `tests/generation/renderers/*.test.ts`

**Assertions:**

#### Per-feature rendering
- [ ] Given a Configuration IFeatureSpec, renderer produces exactly these files:
  - `src/features/configuration/interfaces/i-configuration.mts`
  - `src/features/configuration/interfaces/index.mts`
  - `src/features/configuration/validation/configuration.validation.mts`
  - `src/features/configuration/validation/index.mts`
  - `src/features/configuration/repository/configuration-repository.mts`
  - `src/features/configuration/repository/index.mts`
  - `src/features/configuration/service/configuration-service.mts`
  - `src/features/configuration/service/i-configuration-service.mts`
  - `src/features/configuration/service/index.mts`
  - `src/features/configuration/docs/configuration-swagger.mts`
  - `src/api/routes/configuration-router.mts`
  - `tests/configuration/configuration-service.test.ts`
- [ ] All barrel files (index.mts) export from sibling files correctly
- [ ] Import paths use `.mjs` extension in specifiers

#### Project scaffolding rendering
- [ ] Given a generation plan, scaffolding renderer produces:
  - `package.json` (scoped name)
  - `tsconfig.json` (strict + path aliases)
  - `eslint.config.mjs` (canonical config)
  - `docker-compose.yml`
  - `.env.example`
  - `.gitignore`
  - `src/index.mts`
  - `src/env.mts`
  - `src/api/index.mts`
  - `src/api/plugins/trace.plugin.mts`
  - `src/api/routes/health-router.mts`
  - `src/api/routes/version-router.mts`
  - `src/api/routes/index.mts`
  - `src/ioc/get-container.mts`
  - `src/ioc/create-database-configuration.mts`
  - `src/ioc/repository-factory.mts`
  - `src/ioc/interfaces/i-container.mts`
  - `src/loggers/logger.mts`
  - `libs/shared/src/index.mts`
  - `libs/shared/src/types/`

#### DI wiring
- [ ] getContainer() file imports and instantiates all feature repositories
- [ ] getContainer() file imports and instantiates all feature services
- [ ] Server file imports and mounts all feature routers
- [ ] Adding a second feature updates getContainer() and server correctly (no duplication, no overwrite)

---

### L3: Compilation Tests

**What:** Generated project compiles with zero TypeScript errors.

**Test file:** `tests/integration/compilation.test.ts`

**Process:**
1. Generate full project (scaffolding + 1 feature) into temp directory
2. Run `bun install` in temp directory
3. Run `tsc --noEmit` in temp directory
4. Assert exit code 0 and zero error output

**Domains tested:**
- [ ] Configuration (simple CRUD)
- [ ] Registered Sheets (medium, custom indexes)
- [ ] Photo Analysis (complex, nested objects)
- [ ] Multi-feature: Configuration + Registered Sheets in same project

**Assertions:**
- [ ] `tsc --noEmit` exit code is 0
- [ ] stderr is empty (no type errors)
- [ ] All .mts files resolve their .mjs imports correctly
- [ ] Path alias `@project/shared` resolves correctly
- [ ] @sylvesterllc/mongo types resolve (BaseRepository, IDatabase, IRepository)
- [ ] @sylvesterllc/utils types resolve (TraceLogger)

---

### L4: Lint Tests

**What:** Generated project passes `eslint --fix` with zero remaining errors.

**Test file:** `tests/integration/lint.test.ts`

**Process:**
1. Generate full project into temp directory
2. Run `bun install` in temp directory
3. Run `eslint . --fix` in temp directory
4. Run `eslint .` (without fix) to check for remaining errors
5. Assert zero errors

**Domains tested:**
- [ ] Configuration
- [ ] Registered Sheets
- [ ] Photo Analysis
- [ ] Multi-feature project

**Assertions:**
- [ ] `eslint .` exit code is 0 after --fix
- [ ] Zero errors reported
- [ ] Zero warnings for no-explicit-any (none present)
- [ ] All functions have explicit return types
- [ ] Double quotes used throughout
- [ ] Import ordering follows canonical config
- [ ] No console.log statements (no-console: warn — warn is acceptable)

---

### L5: Runtime Tests (Future — Phase 3)

**What:** Generated project boots and serves HTTP requests.

**Process:**
1. Generate full project into temp directory
2. `docker-compose up -d` (MongoDB)
3. `bun run src/index.mts` (start server)
4. HTTP requests to test endpoints
5. `docker-compose down`

**Assertions:**
- [ ] Server starts without errors on configured port
- [ ] GET /health returns `{ status: "ok" }` with 200
- [ ] GET /version returns version info with 200
- [ ] GET /api/{entity} returns `{ success: true, data: [], count: 0 }` with 200
- [ ] POST /api/{entity} with valid body returns 201 with created entity
- [ ] GET /api/{entity}/:id returns the created entity
- [ ] PUT /api/{entity}/:id updates and returns updated entity
- [ ] DELETE /api/{entity}/:id returns success
- [ ] GET /api/{entity}/:id after delete returns 404
- [ ] x-trace-id header present on all responses
- [ ] Swagger UI accessible at /docs or /swagger

---

## Test Execution Order

```
Phase 1 (Build templates):
  L1: Template unit tests (per template, per domain)
       ↓
  L2: Renderer integration tests (full feature, multi-feature)
       ↓
  L3: Compilation tests (tsc --noEmit on generated output)
       ↓
  L4: Lint tests (eslint --fix + eslint on generated output)

Phase 3 (After verification pipeline is built):
  L5: Runtime tests (docker-compose + HTTP)

Validation gate:
  All 3 domains (Configuration, Registered Sheets, Photo Analysis)
  must pass L1-L4 before templates are considered validated.
```

---

## Test Infrastructure

### Temp Directory Management
- Each test run creates a temp directory via `Bun.mktemp()`
- Cleanup after test (or keep on failure for debugging)
- Tests are isolated — no shared state between domains

### IFeatureSpec Fixtures
- `tests/fixtures/configuration.fixture.ts` — simple CRUD entity
- `tests/fixtures/registered-sheets.fixture.ts` — medium entity with indexes
- `tests/fixtures/photo-analysis.fixture.ts` — complex nested entity

### Snapshot Approach
- First run: generate + verify (compile + lint)
- Subsequent runs: compare against snapshots for regression detection
- Snapshots stored in `tests/snapshots/{domain}/`

### CI Integration
- All L1-L4 tests run in CI (no Docker needed for L1-L4)
- L5 runtime tests require Docker, run separately
- Test report outputs to `.docs/test-results.md` for trace collection
