# Fitness Tracker — Product Requirements Document

## Progress Checklist

- [ ] Project scaffolding (Bun, TypeScript, Elysia, Docker, ESLint)
- [ ] Database connection and DI container setup
- [ ] Exercises entity (Router, Service, Repository)
- [ ] Workouts entity (Router, Service, Repository)
- [ ] Progress Metrics entity (Router, Service, Repository)
- [ ] Running Logs entity (Router, Service, Repository)
- [ ] Workout Exercises entity (Router, Service, Repository)
- [ ] Health check and version endpoints
- [ ] Swagger documentation
- [ ] Unit tests for all entities
- [ ] Angular UI scaffolding (standalone, zoneless, signals)
- [ ] Dashboard page with charts
- [ ] Workouts page (list, create, edit, add exercises)
- [ ] Running page with pace/distance charts
- [ ] Exercises page (catalog, search, filter)
- [ ] Progress page with body metric charts and personal bests

---

## 1. Overview

**Project Name:** Fitness Tracker

**Project Type:** Full-stack web application (REST API + Angular SPA)

**Purpose:** A fitness tracking application that allows users to log workouts, track running performance, catalog exercises, link exercises to workouts with performance data, and monitor body metrics over time. Progress is visualized through charts and graphs.

**Core Problem:** Fitness enthusiasts need a centralized tool to record workout sessions, track running-specific metrics (pace, distance, elevation), organize exercises by muscle group, and visualize trends in their fitness data over time. Existing solutions are either too complex, locked behind subscriptions, or do not expose data in a developer-friendly way.

**Agent-One Context:** This is the first real end-to-end test of the agent-one coding harness. The generated code must strictly follow Davis's established coding patterns as defined in `CLAUDE.md` and the global development standards. Every file, import, type, and architectural decision must conform exactly.

---

## 2. User Personas

### Persona 1: Solo Fitness Enthusiast (Primary)

- **Goals:** Log daily workouts, track running improvements, visualize body composition changes over weeks and months.
- **Needs:** Quick data entry, clear charts showing trends, ability to browse exercises by muscle group.
- **Pain Points:** Manually tracking workouts in spreadsheets is tedious; hard to spot trends without visualization; no single place for both strength and cardio data.

### Persona 2: Runner Focused on Performance

- **Goals:** Track pace, distance, and elevation for every run; identify personal bests; correlate running performance with body metrics.
- **Needs:** Running-specific fields (pace per mile, route name, weather, heart rate), personal best tracking, pace-over-time charts.
- **Pain Points:** Generic workout trackers lack running-specific detail; calculating pace manually is error-prone; no easy way to see fastest times at a glance.

### Persona 3: Developer / Agent-One Operator

- **Goals:** Validate that agent-one can generate a full-stack application that compiles, passes tests, and follows all coding standards.
- **Needs:** Clean REST API with Swagger docs, predictable project structure, passing unit tests, Docker-based test infrastructure.
- **Pain Points:** Agents that produce code not matching established patterns; missing tests; incorrect TypeScript strictness; wrong file extensions.

---

## 3. Features

### Phase 1 — API (Must Have)

#### Infrastructure

- [ ] Must: **Project Scaffolding** — Initialize Bun project with `package.json`, `tsconfig.json` (strict, noEmit), ESLint config, and folder structure (`src/`, `src/features/`, `src/shared/`, `docs/`)
- [ ] Must: **Docker Compose** — `docker-compose.yml` with MongoDB 7+ service for local development and testing
- [ ] Must: **Environment Configuration** — `.env.example` with all required env vars (`MONGODB_URI`, `PORT`, `LOG_LEVEL`, `NODE_ENV`); load via Bun native env
- [ ] Must: **DI Container** — `getContainer()` function that registers and resolves all services, repositories, and the MongoDB client
- [ ] Must: **MongoDB Connection** — Native MongoDB driver connection with proper lifecycle (connect on startup, close on shutdown); registered in DI container
- [ ] Must: **Winston + TraceLogger** — Logger setup with Winston; TraceLogger for request tracing; no `console.log` anywhere
- [ ] Must: **Health Check Endpoint** — `GET /health` returns `{ status: "ok", timestamp: string, uptime: number }`
- [ ] Must: **Version Endpoint** — `GET /version` returns `{ version: string, environment: string }`
- [ ] Must: **Swagger Docs** — Elysia Swagger plugin at `/docs` with all routes documented

#### Exercises Entity (no dependencies)

- [ ] Must: **Exercises Zod Schemas** — `createExerciseSchema`, `updateExerciseSchema`, `exerciseParamsSchema`, `exerciseQuerySchema`; derived types in `types/` with barrel export
- [ ] Must: **Exercise Interface** — `IExercise` in `interfaces/i-exercise.mts` with all fields including `id` (ULID), `createdAt`, `updatedAt`
- [ ] Must: **Exercise Repository** — MongoDB CRUD operations with try-catch error handling; all data access isolated here
- [ ] Must: **Exercise Service** — Business logic layer; calls repository via DI; ULID generation for new records
- [ ] Must: **Exercise Router** — Elysia routes: `POST /exercises`, `GET /exercises`, `GET /exercises/:id`, `PUT /exercises/:id`, `DELETE /exercises/:id`, `GET /exercises/search?muscleGroup=`, `GET /exercises/search?name=`
- [ ] Must: **Exercise Unit Tests** — Repository, service, and router tests with `bun test`

#### Workouts Entity (no dependencies)

- [ ] Must: **Workouts Zod Schemas** — `createWorkoutSchema`, `updateWorkoutSchema`, `workoutParamsSchema`, `workoutQuerySchema` (date range filter support)
- [ ] Must: **Workout Interface** — `IWorkout` in `interfaces/i-workout.mts`
- [ ] Must: **Workout Repository** — CRUD + date range filtering
- [ ] Must: **Workout Service** — Business logic; date range query support
- [ ] Must: **Workout Router** — `POST /workouts`, `GET /workouts` (with `?startDate=&endDate=` query params), `GET /workouts/:id`, `PUT /workouts/:id`, `DELETE /workouts/:id`
- [ ] Must: **Workout Unit Tests** — Full coverage

#### Progress Metrics Entity (no dependencies)

- [ ] Must: **Progress Metrics Zod Schemas** — `createProgressMetricSchema`, `updateProgressMetricSchema`, `progressMetricQuerySchema`
- [ ] Must: **Progress Metric Interface** — `IProgressMetric` in `interfaces/i-progress-metric.mts`
- [ ] Must: **Progress Metric Repository** — CRUD + `getByMetricType` with date range + `getLatest` (most recent of each type)
- [ ] Must: **Progress Metric Service** — Business logic; custom metric name validation (required when metricType is "custom")
- [ ] Must: **Progress Metric Router** — `POST /progress-metrics`, `GET /progress-metrics`, `GET /progress-metrics/:id`, `PUT /progress-metrics/:id`, `DELETE /progress-metrics/:id`, `GET /progress-metrics/latest`, `GET /progress-metrics/by-type/:metricType`
- [ ] Must: **Progress Metric Unit Tests** — Full coverage

#### Running Logs Entity (depends on Workouts)

- [ ] Must: **Running Logs Zod Schemas** — `createRunningLogSchema`, `updateRunningLogSchema`, `runningLogQuerySchema`
- [ ] Must: **Running Log Interface** — `IRunningLog` in `interfaces/i-running-log.mts`
- [ ] Must: **Running Log Repository** — CRUD + `getByWorkoutId` + aggregation queries for personal bests
- [ ] Must: **Running Log Service** — Business logic; validate workoutId exists (call Workout service via DI); pace calculation (`durationMinutes / distanceMiles` if not provided); personal bests logic (fastest pace, longest distance, longest duration)
- [ ] Must: **Running Log Router** — `POST /running-logs`, `GET /running-logs`, `GET /running-logs/:id`, `PUT /running-logs/:id`, `DELETE /running-logs/:id`, `GET /running-logs/workout/:workoutId`, `GET /running-logs/personal-bests`
- [ ] Must: **Running Log Unit Tests** — Full coverage including personal bests

#### Workout Exercises Entity (depends on Workouts AND Exercises)

- [ ] Must: **Workout Exercises Zod Schemas** — `createWorkoutExerciseSchema`, `updateWorkoutExerciseSchema`, `workoutExerciseQuerySchema`
- [ ] Must: **Workout Exercise Interface** — `IWorkoutExercise` in `interfaces/i-workout-exercise.mts`
- [ ] Must: **Workout Exercise Repository** — CRUD + `getByWorkoutId`
- [ ] Must: **Workout Exercise Service** — Business logic; validate both `workoutId` and `exerciseId` exist via DI-resolved services
- [ ] Must: **Workout Exercise Router** — `POST /workout-exercises`, `GET /workout-exercises`, `GET /workout-exercises/:id`, `PUT /workout-exercises/:id`, `DELETE /workout-exercises/:id`, `GET /workout-exercises/workout/:workoutId`
- [ ] Must: **Workout Exercise Unit Tests** — Full coverage including foreign key validation

### Phase 2 — Angular UI (Should Have)

- [ ] Should: **Angular Project Scaffolding** — Angular CLI with standalone components, zoneless change detection, signals, SCSS, Angular Material
- [ ] Should: **API Service Layer** — Angular services that call the Elysia API; typed request/response models matching Zod-derived types
- [ ] Should: **Dashboard Page** — Overview with recent workouts list, summary stats, and 2-3 charts (workout frequency bar chart, running pace line chart, workout type pie chart)
- [ ] Should: **Workouts Page** — List all workouts with date filter; create/edit workout form; add exercises to a workout (linking to Workout Exercises)
- [ ] Should: **Running Page** — Running log list; pace over time line chart; distance over time line chart; personal bests display
- [ ] Should: **Exercises Page** — Exercise catalog with search by name and filter by muscle group; create/edit exercise form
- [ ] Should: **Progress Page** — Body metrics list; weight/body fat trend line chart; add new metric entry form
- [ ] Should: **Chart Components** — Reusable Chart.js / ng2-charts wrapper components for line, bar, and pie charts
- [ ] Should: **Responsive Layout** — Flexbox-based layout with CSS variables for theming; works on desktop and tablet

### Nice to Have (Could)

- [ ] Could: **Volume per Muscle Group Chart** — Bar chart aggregating total sets/reps per muscle group from Workout Exercises
- [ ] Could: **Workout Templates** — Save a workout as a template to quickly log repeat sessions
- [ ] Could: **Data Export** — Export workout history and metrics as JSON or CSV

### Out of Scope (Won't — This Version)

- Won't: **Authentication / Multi-User** — `userId` field is included for future support but no auth is implemented
- Won't: **Mobile App** — Web-only for this version
- Won't: **Social Features** — No sharing, leaderboards, or community
- Won't: **AI Workout Recommendations** — No ML/AI features
- Won't: **Third-Party Integrations** — No Strava, Garmin, Apple Health sync

---

## 4. Technical Requirements

### Stack

| Component        | Technology                                      |
|------------------|-------------------------------------------------|
| Runtime          | Bun (latest)                                    |
| API Framework    | Elysia                                          |
| Database         | MongoDB 7+ with native MongoDB driver (latest)  |
| Test DB          | Docker Compose MongoDB instance                 |
| Language         | TypeScript strict mode (`.mts` files)           |
| UI Framework     | Angular (standalone, signals, zoneless)          |
| Charts           | Chart.js / ng2-charts                           |
| Logging          | Winston + TraceLogger                           |
| Validation       | Zod (schema-first, derive types)                |
| IDs              | ULID                                            |
| Linting          | ESLint                                          |
| Testing          | `bun test`                                      |
| Package Manager  | Bun                                             |

### Architecture

```
Router (HTTP in/out) --> Service (business logic) --> Repository (data access)
         |                      |                            |
     Zod validation        DI-resolved               MongoDB native driver
     Request/Response      ULID generation            try-catch error handling
     Swagger docs          Cross-service calls        Collection-level ops
```

All layers connected via `getContainer()` DI. No direct instantiation with `new` inside services or routers.

### Project Structure (API)

```
fitness-tracker/
  src/
    shared/
      container.mts              # getContainer() DI setup
      database.mts               # MongoDB connection
      logger.mts                 # Winston + TraceLogger
      interfaces/
        i-base-entity.mts        # Base entity with id, createdAt, updatedAt
        index.mts
      types/
        result.mts               # Result<T, E> type
        index.mts
      errors/
        app-error.mts            # Typed error classes
        not-found-error.mts
        validation-error.mts
        index.mts
    features/
      exercises/
        exercise.router.mts
        exercise.service.mts
        exercise.repository.mts
        interfaces/
          i-exercise.mts
          index.mts
        schemas/
          create-exercise.schema.mts
          update-exercise.schema.mts
          exercise-query.schema.mts
          index.mts
        types/
          exercise.types.mts
          index.mts
        __tests__/
          exercise.repository.test.mts
          exercise.service.test.mts
          exercise.router.test.mts
      workouts/
        ... (same pattern)
      progress-metrics/
        ... (same pattern)
      running-logs/
        ... (same pattern)
      workout-exercises/
        ... (same pattern)
    app.mts                      # Elysia app setup, plugin registration
    index.mts                    # Entry point, start server
  docker-compose.yml
  .env.example
  package.json
  tsconfig.json
  eslint.config.mjs
```

### TypeScript Rules (Enforced)

- Strict mode enabled in `tsconfig.json`
- `noEmit: true` in tsconfig
- All files use `.mts` extension
- All imports use `.mjs` extension in specifiers
- No `any` — use explicit types, interfaces, or `unknown`
- `interface` for object shapes; `type` for unions and aliases
- `as const` objects or `const enum` — no regular enums
- All functions have explicit return types and access modifiers
- One interface per file with `i-` prefix
- Barrel exports via `index.mts`
- `satisfies` over type assertions; avoid `as`
- Double quotes for strings
- Trailing commas in multiline expressions
- Arrow functions for callbacks
- Named exports only (no default exports)
- Blank line after class opening brace and before first property/method

### Error Handling

- `Result<T, E>` discriminated union for recoverable errors in services
- Typed error classes (`AppError`, `NotFoundError`, `ValidationError`) — not generic `Error`
- `throw` reserved for truly unexpected errors only
- Repository methods wrapped in try-catch

### Validation Rules

- Zod schema-first: define schema, derive type with `z.infer<typeof schema>`
- All request bodies, query params, and path params validated at router boundary
- Derived types saved in `types/` folder with barrel export

### ID Generation

- All entity IDs are ULIDs (monotonically sortable, URL-safe)
- Generated in the service layer at creation time

### Enum Definitions (as const objects)

```typescript
export const WorkoutType = {
  RUNNING: "running",
  WEIGHTLIFTING: "weightlifting",
  CYCLING: "cycling",
  SWIMMING: "swimming",
  OTHER: "other",
} as const;

export const WorkoutStatus = {
  PLANNED: "planned",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const;

export const MuscleGroup = {
  CHEST: "chest",
  BACK: "back",
  LEGS: "legs",
  SHOULDERS: "shoulders",
  ARMS: "arms",
  CORE: "core",
  FULL_BODY: "full_body",
} as const;

export const DifficultyLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export const MetricType = {
  WEIGHT_LBS: "weight_lbs",
  BODY_FAT_PCT: "body_fat_pct",
  RESTING_HEART_RATE: "resting_heart_rate",
  CUSTOM: "custom",
} as const;
```

### Non-Functional Requirements

| Requirement       | Target                                                        |
|-------------------|---------------------------------------------------------------|
| Response Time     | All API endpoints respond in < 200ms under normal load        |
| Startup Time      | Server starts and is ready in < 3 seconds                     |
| Test Coverage     | Unit tests for every repository, service, and router          |
| Lint Compliance   | Zero ESLint errors after every change                         |
| Type Safety       | Zero TypeScript errors in strict mode                         |
| Logging           | All requests logged with trace ID; all errors logged          |
| Docker            | `docker compose up` starts MongoDB; tests run against it      |
| Swagger           | All routes documented with request/response schemas at `/docs`|

---

## 5. Success Metrics

| Metric                        | Target                          | Measurement                                      |
|-------------------------------|---------------------------------|--------------------------------------------------|
| API Compilation               | Zero TypeScript errors          | `bun run typecheck` exits with code 0            |
| ESLint Compliance             | Zero lint errors                | `eslint .` exits with code 0                     |
| Unit Test Pass Rate           | 100% of tests pass              | `bun test` exits with code 0                     |
| Entity CRUD Coverage          | All 5 entities have full CRUD   | Manual verification of route registration        |
| Swagger Route Coverage        | All endpoints appear in /docs   | Open /docs and verify all routes listed           |
| Docker DB Connectivity        | Tests connect to Dockerized DB  | `docker compose up -d && bun test` passes        |
| Pattern Compliance            | All files follow CLAUDE.md      | Code review: .mts files, DI, no `any`, no enums |
| Health Check                  | /health returns 200            | `curl localhost:PORT/health` returns OK         |
| Angular Build                 | Zero build errors               | `ng build` exits with code 0                     |
| Chart Rendering               | All 5 chart types render data   | Manual verification in browser                   |
| Auth0 Social Login            | Google login works end-to-end   | Playwright AC test: `ui/e2e/auth0-social-login.spec.ts` |

### Acceptance Criteria — Auth0 Social Login

| AC | Criteria | Test | Pass Condition |
|----|----------|------|----------------|
| AC-1 | User can login via Google social, land on dashboard, and call protected API | `auth0-social-login.spec.ts` | User completes Google auth within 3 min, redirected to dashboard, API returns 200 (not 401) |
| AC-2 | Unauthenticated user cannot access protected routes | `auth0-social-login.spec.ts` | Navigating to /workouts without auth redirects to /auth/login |
| AC-3 | Unauthenticated API call returns 401 | `auth0-social-login.spec.ts` | `GET /exercises` without token returns `{ success: false }` with status 401 |
| AC-4 | Public endpoints accessible without auth | `auth0-social-login.spec.ts` | `GET /health` returns 200, `GET /swagger` returns 200 |

**Run:** `npx playwright test --config=ui/e2e/playwright.config.ts` (headed mode — requires manual Google auth)

---

## 6. Timeline

### Phase 1 — API (Primary)

- [ ] **Milestone 1: Project Scaffolding** — Bun init, tsconfig, ESLint, docker-compose, .env.example, Winston logger, MongoDB connection, DI container, health/version endpoints, Swagger setup
- [ ] **Milestone 2: Exercises Entity** — Interface, Zod schemas, types, repository, service, router, unit tests
- [ ] **Milestone 3: Workouts Entity** — Interface, Zod schemas, types, repository, service, router, unit tests
- [ ] **Milestone 4: Progress Metrics Entity** — Interface, Zod schemas, types, repository, service, router, unit tests
- [ ] **Milestone 5: Running Logs Entity** — Interface, Zod schemas, types, repository (with personal bests aggregation), service (with workout validation and pace calculation), router, unit tests
- [ ] **Milestone 6: Workout Exercises Entity** — Interface, Zod schemas, types, repository, service (with workout + exercise validation), router, unit tests
- [ ] **Milestone 7: API Integration Verification** — All routes registered, Swagger complete, ESLint clean, all tests pass, Docker DB works

### Phase 2 — Angular UI

- [ ] **Milestone 8: Angular Scaffolding** — Angular CLI project with standalone components, zoneless config, signals, SCSS, Angular Material, Chart.js/ng2-charts, API service layer
- [ ] **Milestone 9: Dashboard Page** — Recent workouts, summary stats, workout frequency bar chart, workout type pie chart
- [ ] **Milestone 10: Workouts Page** — Workout list with date filter, create/edit forms, exercise linking
- [ ] **Milestone 11: Running Page** — Running log list, pace line chart, distance line chart, personal bests
- [ ] **Milestone 12: Exercises Page** — Exercise catalog, search/filter by name and muscle group, create/edit form
- [ ] **Milestone 13: Progress Page** — Metrics list, weight/body fat trend charts, add metric form
- [ ] **Milestone 14: UI Polish** — Responsive layout, theming, cross-page navigation, final review

---

## 7. Entity Generation Order

Entities must be generated in this exact order due to foreign key dependencies:

```
1. Exercises       (no dependencies)
2. Workouts        (no dependencies)
3. Progress Metrics (no dependencies)
4. Running Logs     (depends on Workouts — validates workoutId)
5. Workout Exercises (depends on Workouts AND Exercises — validates both IDs)
```

---

## 8. Open Questions

- [ ] **TraceLogger Implementation** — Confirm TraceLogger pattern: is it a Winston transport, a middleware that attaches a trace ID to each request, or a separate class? Assume middleware that generates a ULID trace ID per request and attaches it to the logger context.
- [ ] **API Port** — Default port for the Elysia server. Assume `3000` unless overridden by `PORT` env var.
- [ ] **MongoDB Database Name** — Assume `fitness_tracker` for dev and `fitness_tracker_test` for tests.
- [ ] **CORS Configuration** — Angular UI will run on a different port during development. Assume CORS enabled for `localhost:4200` in dev mode.
- [ ] **Pagination** — Should list endpoints support pagination? Assume yes with `?page=1&limit=20` defaults for all GET collection endpoints.
- [ ] **Angular Proxy** — Use Angular CLI proxy config to forward `/api` requests to Elysia during development.

---

## Verification Checklist

- [x] Overview complete
- [x] User personas defined
- [x] Features prioritized with MoSCoW
- [x] Technical requirements captured
- [x] Success metrics defined with targets
- [x] Timeline with milestones confirmed
- [x] Entity dependencies and generation order documented
- [x] Coding standards from CLAUDE.md incorporated into technical requirements
