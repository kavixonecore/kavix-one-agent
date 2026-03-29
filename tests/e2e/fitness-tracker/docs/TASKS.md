# Fitness Tracker — Task Breakdown

> **Generated from:** PRD.md
> **Entity Order:** Exercises → Workouts → Progress Metrics → Running Logs → Workout Exercises

---

## Task Completion Requirements

Every task MUST report the following on completion:

| Metric | Description |
|--------|-------------|
| **Tokens consumed** | Prompt tokens + completion tokens + total |
| **Tool uses** | Count of tool calls made during this task |
| **Duration** | Wall clock time for the task |
| **Files created/modified** | List of all files written or changed |
| **Tests added** | Count of new tests + pass/fail status |
| **Lint status** | ESLint result after `eslint --fix` (0 errors required) |
| **Errors encountered** | Any errors hit during the task and how they were resolved |

This data is captured via agent-one's trace system (`ITraceEntry`) and written to:
- `.docs/<task-name>-<iteration>.md` — local markdown per task
- MongoDB `agent-one-traces` collection — for querying

### Task Completion Report Template

```markdown
## TASK-XXX: <Task Name> — Complete

| Metric | Value |
|--------|-------|
| Tokens (prompt) | X |
| Tokens (completion) | X |
| Tokens (total) | X |
| Tool uses | X |
| Duration | Xms |
| Files created | X |
| Files modified | X |
| Tests added | X |
| Tests passing | X/X |
| Lint errors | 0 |
| Errors encountered | X |

### Files
- path/to/file1.mts (created)
- path/to/file2.mts (modified)

### Errors (if any)
- Error description and resolution
```

---

## Dependency Graph

```
TASK-001 (Scaffolding)
    ↓
TASK-002 (Shared: DB, DI, Logger, Errors)
    ↓
    ├─→ TASK-003 (Exercises)
    ├─→ TASK-004 (Workouts)
    ├─→ TASK-005 (Progress Metrics)
    │         ↓
    │   TASK-006 (Running Logs) — depends on TASK-004
    │         ↓
    └─→ TASK-007 (Workout Exercises) — depends on TASK-003 + TASK-004
              ↓
        TASK-008 (Integration: Swagger, Health, Version)
              ↓
        TASK-009 (Tests + Verification)
              ↓
        TASK-010 (Angular UI Scaffolding) — Phase 2
              ↓
        TASK-011 (Dashboard + Charts) — Phase 2
              ↓
        TASK-012 (Remaining UI Pages) — Phase 2
```

---

## Phase 1 — API

### TASK-001: Project Scaffolding
**Depends on:** Nothing
**Milestone:** 1

- [ ] Initialize Bun project: `package.json` with name `@fitness-tracker/api`, type `module`
- [ ] `tsconfig.json`: strict, ESNext target, noEmit true, moduleDetection force, path aliases
- [ ] `eslint.config.mjs`: canonical flat config (5 plugins, no-explicit-any: error, explicit-return-type: error)
- [ ] `docker-compose.yml`: MongoDB 7+ service, port 27017, volume for persistence, root user/pass
- [ ] `.env.example`: MONGODB_URI, PORT, LOG_LEVEL, NODE_ENV
- [ ] `.gitignore`: node_modules, dist, .env, .docs, bun.lock
- [ ] Install dependencies: elysia, @elysiajs/cors, @elysiajs/swagger, mongodb, winston, zod, ulidx, luxon
- [ ] Install devDependencies: typescript, @types/bun, eslint, @eslint/js, typescript-eslint, @stylistic/eslint-plugin, eslint-plugin-import, eslint-plugin-jsdoc
- [ ] Run `eslint --fix` and verify clean

**Output files:**
```
package.json
tsconfig.json
eslint.config.mjs
docker-compose.yml
.env.example
.gitignore
```

---

### TASK-002: Shared Infrastructure (DB, DI, Logger, Errors)
**Depends on:** TASK-001
**Milestone:** 1

- [ ] `src/shared/database.mts`: MongoDB connection helper using native driver, connect/disconnect, cached client singleton
- [ ] `src/shared/logger.mts`: Winston logger factory + trace plugin (ULID traceId per request, onRequest/onAfterHandle/onError)
- [ ] `src/shared/container.mts`: `getContainer()` returning `IContainer` with db, repositories, services (starts empty, populated as entities are added)
- [ ] `src/shared/interfaces/i-base-entity.mts`: `IBaseEntity { id: string; createdAt: string; updatedAt: string; }`
- [ ] `src/shared/interfaces/i-container.mts`: `IContainer` shape
- [ ] `src/shared/interfaces/index.mts`: barrel
- [ ] `src/shared/types/result.mts`: `Result<T, E>` discriminated union (`{ ok: true; value: T } | { ok: false; error: E }`)
- [ ] `src/shared/types/index.mts`: barrel
- [ ] `src/shared/errors/app-error.mts`: base `AppError` class
- [ ] `src/shared/errors/not-found-error.mts`: `NotFoundError extends AppError`
- [ ] `src/shared/errors/validation-error.mts`: `ValidationError extends AppError`
- [ ] `src/shared/errors/index.mts`: barrel
- [ ] `src/index.mts`: entry point stub (import container, start server)
- [ ] `src/app.mts`: Elysia app setup with cors, swagger, trace plugin, health/version routes
- [ ] Run `eslint --fix` and verify clean

**Output files:**
```
src/shared/database.mts
src/shared/logger.mts
src/shared/container.mts
src/shared/interfaces/i-base-entity.mts
src/shared/interfaces/i-container.mts
src/shared/interfaces/index.mts
src/shared/types/result.mts
src/shared/types/index.mts
src/shared/errors/app-error.mts
src/shared/errors/not-found-error.mts
src/shared/errors/validation-error.mts
src/shared/errors/index.mts
src/index.mts
src/app.mts
```

---

### TASK-003: Exercises Entity
**Depends on:** TASK-002
**Milestone:** 2

- [ ] `src/features/exercises/interfaces/i-exercise.mts`: IExercise (extends IBaseEntity)
- [ ] `src/features/exercises/interfaces/index.mts`: barrel
- [ ] `src/features/exercises/schemas/create-exercise.schema.mts`: Zod schema for creation
- [ ] `src/features/exercises/schemas/update-exercise.schema.mts`: Zod schema for update (all optional)
- [ ] `src/features/exercises/schemas/exercise-query.schema.mts`: Zod schema for query params (muscleGroup, name search)
- [ ] `src/features/exercises/schemas/index.mts`: barrel
- [ ] `src/features/exercises/types/exercise.types.mts`: z.infer derived types (CreateExercise, UpdateExercise, ExerciseQuery)
- [ ] `src/features/exercises/types/index.mts`: barrel
- [ ] `src/features/exercises/exercise.repository.mts`: MongoDB CRUD + searchByMuscleGroup + searchByName
- [ ] `src/features/exercises/exercise.service.mts`: business logic, ULID generation, calls repository
- [ ] `src/features/exercises/exercise.router.mts`: Elysia routes (POST, GET all, GET by id, PUT, DELETE, GET search)
- [ ] `src/features/exercises/__tests__/exercise.repository.test.mts`: repository tests
- [ ] `src/features/exercises/__tests__/exercise.service.test.mts`: service tests
- [ ] `src/features/exercises/__tests__/exercise.router.test.mts`: router tests
- [ ] Define `MuscleGroup` and `DifficultyLevel` as const objects in `src/features/exercises/exercise.constants.mts`
- [ ] Update `getContainer()` to register ExerciseRepository + ExerciseService
- [ ] Update `app.mts` to mount exercise router
- [ ] Run `eslint --fix` and `bun test`

---

### TASK-004: Workouts Entity
**Depends on:** TASK-002
**Milestone:** 3

- [ ] `src/features/workouts/interfaces/i-workout.mts`: IWorkout (extends IBaseEntity)
- [ ] `src/features/workouts/interfaces/index.mts`: barrel
- [ ] `src/features/workouts/schemas/create-workout.schema.mts`
- [ ] `src/features/workouts/schemas/update-workout.schema.mts`
- [ ] `src/features/workouts/schemas/workout-query.schema.mts`: date range (startDate, endDate) + status filter
- [ ] `src/features/workouts/schemas/index.mts`: barrel
- [ ] `src/features/workouts/types/workout.types.mts`: z.infer derived types
- [ ] `src/features/workouts/types/index.mts`: barrel
- [ ] `src/features/workouts/workout.repository.mts`: CRUD + date range filtering
- [ ] `src/features/workouts/workout.service.mts`: business logic, ULID, date queries
- [ ] `src/features/workouts/workout.router.mts`: Elysia routes with date range query params
- [ ] `src/features/workouts/__tests__/workout.repository.test.mts`
- [ ] `src/features/workouts/__tests__/workout.service.test.mts`
- [ ] `src/features/workouts/__tests__/workout.router.test.mts`
- [ ] Define `WorkoutType` and `WorkoutStatus` as const objects in `src/features/workouts/workout.constants.mts`
- [ ] Update `getContainer()` and `app.mts`
- [ ] Run `eslint --fix` and `bun test`

---

### TASK-005: Progress Metrics Entity
**Depends on:** TASK-002
**Milestone:** 4

- [ ] `src/features/progress-metrics/interfaces/i-progress-metric.mts`: IProgressMetric (extends IBaseEntity)
- [ ] `src/features/progress-metrics/interfaces/index.mts`: barrel
- [ ] `src/features/progress-metrics/schemas/create-progress-metric.schema.mts`: with `.refine()` for custom metric name requirement
- [ ] `src/features/progress-metrics/schemas/update-progress-metric.schema.mts`
- [ ] `src/features/progress-metrics/schemas/progress-metric-query.schema.mts`: metricType + date range
- [ ] `src/features/progress-metrics/schemas/index.mts`: barrel
- [ ] `src/features/progress-metrics/types/progress-metric.types.mts`
- [ ] `src/features/progress-metrics/types/index.mts`: barrel
- [ ] `src/features/progress-metrics/progress-metric.repository.mts`: CRUD + getByMetricType + getLatest
- [ ] `src/features/progress-metrics/progress-metric.service.mts`: custom metric name validation
- [ ] `src/features/progress-metrics/progress-metric.router.mts`: includes /latest and /by-type/:metricType
- [ ] `src/features/progress-metrics/__tests__/*.test.mts`: full coverage
- [ ] Define `MetricType` as const object in `src/features/progress-metrics/progress-metric.constants.mts`
- [ ] Update `getContainer()` and `app.mts`
- [ ] Run `eslint --fix` and `bun test`

---

### TASK-006: Running Logs Entity
**Depends on:** TASK-004 (Workouts — needs workoutId validation)
**Milestone:** 5

- [ ] `src/features/running-logs/interfaces/i-running-log.mts`: IRunningLog (extends IBaseEntity, has workoutId)
- [ ] `src/features/running-logs/interfaces/index.mts`: barrel
- [ ] `src/features/running-logs/schemas/create-running-log.schema.mts`: workoutId required
- [ ] `src/features/running-logs/schemas/update-running-log.schema.mts`
- [ ] `src/features/running-logs/schemas/running-log-query.schema.mts`
- [ ] `src/features/running-logs/schemas/index.mts`: barrel
- [ ] `src/features/running-logs/types/running-log.types.mts`
- [ ] `src/features/running-logs/types/index.mts`: barrel
- [ ] `src/features/running-logs/running-log.repository.mts`: CRUD + getByWorkoutId + aggregation for personal bests (fastest pace, longest distance, longest duration)
- [ ] `src/features/running-logs/running-log.service.mts`: validate workoutId via WorkoutService (DI), pace calculation (durationMinutes / distanceMiles if not provided), personal bests logic
- [ ] `src/features/running-logs/running-log.router.mts`: includes /workout/:workoutId and /personal-bests
- [ ] `src/features/running-logs/__tests__/*.test.mts`: full coverage including personal bests
- [ ] Update `getContainer()` — RunningLogService receives WorkoutService via DI
- [ ] Update `app.mts`
- [ ] Run `eslint --fix` and `bun test`

---

### TASK-007: Workout Exercises Entity
**Depends on:** TASK-003 (Exercises) + TASK-004 (Workouts)
**Milestone:** 6

- [ ] `src/features/workout-exercises/interfaces/i-workout-exercise.mts`: IWorkoutExercise (extends IBaseEntity, has workoutId + exerciseId)
- [ ] `src/features/workout-exercises/interfaces/index.mts`: barrel
- [ ] `src/features/workout-exercises/schemas/create-workout-exercise.schema.mts`: workoutId + exerciseId required
- [ ] `src/features/workout-exercises/schemas/update-workout-exercise.schema.mts`
- [ ] `src/features/workout-exercises/schemas/workout-exercise-query.schema.mts`
- [ ] `src/features/workout-exercises/schemas/index.mts`: barrel
- [ ] `src/features/workout-exercises/types/workout-exercise.types.mts`
- [ ] `src/features/workout-exercises/types/index.mts`: barrel
- [ ] `src/features/workout-exercises/workout-exercise.repository.mts`: CRUD + getByWorkoutId
- [ ] `src/features/workout-exercises/workout-exercise.service.mts`: validate workoutId via WorkoutService AND exerciseId via ExerciseService (both via DI)
- [ ] `src/features/workout-exercises/workout-exercise.router.mts`: includes /workout/:workoutId
- [ ] `src/features/workout-exercises/__tests__/*.test.mts`: full coverage including foreign key validation
- [ ] Update `getContainer()` — WorkoutExerciseService receives WorkoutService + ExerciseService via DI
- [ ] Update `app.mts`
- [ ] Run `eslint --fix` and `bun test`

---

### TASK-008: Integration — Swagger, Health, Version
**Depends on:** TASK-003, TASK-004, TASK-005, TASK-006, TASK-007
**Milestone:** 7

- [ ] Verify all routes registered in app.mts
- [ ] Verify Swagger at /docs lists all endpoints with request/response schemas
- [ ] Verify GET /health returns `{ status: "ok", timestamp, uptime }`
- [ ] Verify GET /version returns `{ version, environment }`
- [ ] Verify CORS configured for localhost:4200
- [ ] Run full `eslint --fix`
- [ ] Run full `bun test`
- [ ] Run `tsc --noEmit` (zero errors)

---

### TASK-009: Smoke Test with Docker MongoDB
**Depends on:** TASK-008
**Milestone:** 7

- [ ] `docker compose up -d` — start MongoDB
- [ ] Start Elysia server: `bun src/index.mts`
- [ ] Hit all CRUD endpoints for each entity via HTTP requests
- [ ] Verify response format: `{ success: true, data, count }` or `{ success: false, error }`
- [ ] Verify trace IDs present in response headers
- [ ] Verify personal bests endpoint returns correct data
- [ ] Verify date range filtering works on workouts
- [ ] Verify foreign key validation (running log with invalid workoutId returns error)
- [ ] `docker compose down` — cleanup

---

### TASK-010: Playwright Visual Verification
**Depends on:** TASK-009
**Milestone:** 7

- [ ] Ensure API server is running (docker compose up + bun src/index.mts)
- [ ] Use Playwright to navigate to http://localhost:3000/swagger
- [ ] Verify page title contains the API name ("Fitness Tracker API")
- [ ] Verify all 6 endpoint groups are visible in the sidebar (Health, Exercises, Workouts, Progress Metrics, Running Logs, Workout Exercises)
- [ ] Take a screenshot of the Swagger UI page
- [ ] Save screenshot to `.docs/swagger-verification.png`
- [ ] Write `.docs/RESULTS.md` with:
  - Test results summary (total pass/fail)
  - ESLint status
  - Screenshot embedded as markdown image
  - API endpoint verification results
  - Infrastructure status (Docker, server, Swagger)
  - Verification checklist (all items checked)

---

## Phase 2 — Angular UI

### TASK-010: Angular UI Scaffolding
**Depends on:** TASK-008
**Milestone:** 8

- [ ] Angular CLI: `ng new fitness-tracker-ui --standalone --style=scss`
- [ ] Configure zoneless change detection (`provideZonelessChangeDetection()`)
- [ ] Install Angular Material, Chart.js, ng2-charts
- [ ] Configure proxy for API calls during dev (`proxy.conf.json` → localhost:3000)
- [ ] Create API service layer (`api.service.ts`) with typed methods matching all API endpoints
- [ ] Create shared models matching Zod-derived types
- [ ] Create route configuration with lazy-loaded pages
- [ ] Navbar component with navigation links
- [ ] Run `ng build` and verify zero errors

---

### TASK-011: Dashboard + Chart Components
**Depends on:** TASK-010
**Milestone:** 9

- [ ] Reusable chart wrapper components: `line-chart.component.ts`, `bar-chart.component.ts`, `pie-chart.component.ts`
- [ ] Dashboard page: recent workouts list, summary stats (total workouts, total running distance, current weight)
- [ ] Workout frequency bar chart (workouts per week)
- [ ] Workout type distribution pie chart
- [ ] Running pace trend line chart (last 30 runs)
- [ ] State management via signals in a `dashboard-state.service.ts`
- [ ] Loading states and error handling

---

### TASK-012: Remaining UI Pages
**Depends on:** TASK-011
**Milestone:** 10-14

- [ ] Workouts page: list with date filter, create/edit form, link exercises
- [ ] Running page: log list, pace/distance charts, personal bests display
- [ ] Exercises page: catalog with search/filter, create/edit form
- [ ] Progress page: metrics list, weight/body fat trend charts, add metric form
- [ ] Responsive layout with CSS variables for theming
- [ ] Cross-page navigation and final polish

---

## Task Summary

| Task | Name | Depends On | Phase | Milestone |
|------|------|-----------|-------|-----------|
| 001 | Project Scaffolding | — | 1 | 1 |
| 002 | Shared Infrastructure | 001 | 1 | 1 |
| 003 | Exercises Entity | 002 | 1 | 2 |
| 004 | Workouts Entity | 002 | 1 | 3 |
| 005 | Progress Metrics Entity | 002 | 1 | 4 |
| 006 | Running Logs Entity | 004 | 1 | 5 |
| 007 | Workout Exercises Entity | 003, 004 | 1 | 6 |
| 008 | Integration Verification | 003-007 | 1 | 7 |
| 009 | Smoke Test (Docker) | 008 | 1 | 7 |
| 010 | Playwright Visual Verification | 009 | 1 | 7 |
| 011 | Angular Scaffolding | 010 | 2 | 8 |
| 012 | Dashboard + Charts | 011 | 2 | 9 |
| 013 | Remaining UI Pages | 012 | 2 | 10-14 |
