# Cross-Project Pattern Summary

Patterns observed consistently across all 5 reviewed projects:

---

## Always Present

| Pattern | Details |
|---------|---------|
| Runtime | Bun |
| Language | TypeScript strict (.mts file extension) |
| Framework | Elysia |
| Module System | ESM ("type": "module", .mts source, .mjs compiled) |
| Logging | Winston (Pino in 1 project — youtube-daily-digest) |
| Folder Organization | Feature/domain-based (not technical-layer-based) |
| Exports | Named exports, barrel files (index.mts) |
| File Naming | kebab-case |
| Class/Interface Naming | PascalCase |
| Variable/Function Naming | camelCase |
| Commits | Conventional commits (feat:, fix:, chore:, etc.) |
| IDs | ULID |
| Database | MongoDB (primary in 4/5, SQLite in 1) |

## Present in 3+ Projects

| Pattern | Projects Using | Details |
|---------|---------------|---------|
| getContainer() IoC | cmms, smartsheet-api, ct-ai-photo-qc | Manual DI returning IContainer { db, databaseConfig, repositories, services, helpers } |
| @sylvesterllc/mongo BaseRepository | cmms, smartsheet-api, ct-ai-photo-qc | Abstract BaseRepository<D, T> with init(), ensureIndexes(), CRUD methods |
| Router factory pattern | cmms, smartsheet-api, ct-ai-photo-qc | Exported function: (logger, service, config) → new Elysia({ prefix }) |
| Zod validation | cmms, youtube-daily-digest, ct-ai-photo-qc | Env config validation, domain schemas, z.infer<> type derivation |
| Elysia trace plugin | cmms, youtube-daily-digest, ct-ai-photo-qc | onRequest (traceId) → onAfterHandle (log response) → onError (log error) |
| Azure integration | cmms, smartsheet-api, ct-ai-photo-qc | KeyVault, Storage Queue, Managed Identity |

## Present in 2 Projects

| Pattern | Projects Using | Details |
|---------|---------------|---------|
| @sylvesterllc/utils TraceLogger | cmms, ct-ai-photo-qc | Winston-based, ULID trace IDs, structured logging |
| Turborepo monorepo | ct-ai-photo-qc (active), agent-one (planned) | apps/ + libs/ workspace structure |
| Docker builds | smartsheet-api, ct-ai-photo-qc | Multi-stage Dockerfile, Azure Container Registry |
| Teams notifications | cmms, smartsheet-api | Adaptive Cards via webhook |

## Canonical Architecture Stack

```
Router Layer (Elysia)
  ↓ receives (logger, service, config) via factory function
Service Layer
  ↓ constructor injection of repository interface + logger
Repository Layer (extends BaseRepository<MongoClient, T>)
  ↓ init() → ensureIndexes()
Database (MongoDB via cached MongoClient singleton)
```

## Standard Response Format

```typescript
// Success
{ success: true, data: [...], count: N }

// Error
{ success: false, error: "Error message" }
```

## Standard Server Setup

```typescript
new Elysia()
  .use(cors({ origin: [...] }))
  .use(swagger({ path: '/docs' }))
  .use(tracePlugin)
  .use(apiRoutes)  // new Elysia({ prefix: '/api/v1' }).use(featureRouter)
  .listen(PORT);
```

## Standard Env Config

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.string().default('3500'),
  MONGO_HOSTNAME: z.string().min(1),
  // ...
});
export const env = envSchema.parse(Bun.env);
```
