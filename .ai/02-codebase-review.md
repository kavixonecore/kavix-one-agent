# Phase 2: Codebase Review

Five projects were explored to extract Davis's established coding patterns:

---

## Project 1 — CMMS API (`C:\projects\sylvesterllc\cmms`)

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

---

## Project 2 — Utils Library (`C:\projects\sylvesterllc\utils\src`)

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

---

## Project 3 — YouTube Daily Digest (`C:\projects\davisSylvester\youtube-daily-digest\src`)

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

---

## Project 4 — Smartsheet API (`C:\projects\davaco\smartsheet-api`)

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

---

## Project 5 — CT AI Photo QC (`C:\projects\davaco\ct-ai-photo-qc`)

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
