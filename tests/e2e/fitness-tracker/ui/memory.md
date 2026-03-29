# Fitness Tracker UI — Memory & API Reference

> **Purpose:** Everything the Angular UI needs to connect to the API, match interfaces, and implement business rules.
> **API Location:** `../src/` (Elysia server on port 3000)
> **API Docs:** http://localhost:3000/docs (Swagger UI)

---

## Connection

| Setting | Value |
|---------|-------|
| API Base URL | `http://localhost:3000` |
| Angular Dev Port | `http://localhost:4200` |
| CORS | Configured for `localhost:4200` |
| Proxy Config | Forward `/exercises`, `/workouts`, `/progress-metrics`, `/running-logs`, `/workout-exercises` to `http://localhost:3000` |

### proxy.conf.json

```json
{
  "/exercises": { "target": "http://localhost:3000", "secure": false },
  "/workouts": { "target": "http://localhost:3000", "secure": false },
  "/progress-metrics": { "target": "http://localhost:3000", "secure": false },
  "/running-logs": { "target": "http://localhost:3000", "secure": false },
  "/workout-exercises": { "target": "http://localhost:3000", "secure": false },
  "/health": { "target": "http://localhost:3000", "secure": false },
  "/version": { "target": "http://localhost:3000", "secure": false }
}
```

---

## Standard Response Format

All API responses follow this shape:

```typescript
// Success (single item)
{ success: true, data: T }

// Success (list)
{ success: true, data: T[], count: number }

// Error
{ success: false, error: string }
```

Angular services should type responses as:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}
```

---

## Pagination (All List Endpoints)

| Param | Default | Max | Type |
|-------|---------|-----|------|
| `page` | 1 | - | number |
| `limit` | 20 | 100 | number |

All GET collection endpoints return `{ success, data: T[], count }` where `count` is total records (not page size).

---

## Entity Interfaces (Match These Exactly)

### Base Entity

```typescript
interface IBaseEntity {
  id: string;          // ULID
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}
```

### Exercise

```typescript
interface IExercise extends IBaseEntity {
  name: string;
  description: string;
  muscleGroup: MuscleGroupValue;
  difficultyLevel: DifficultyLevelValue;
  equipmentRequired: string[];
  instructions: string;
}
```

### Workout

```typescript
interface IWorkout extends IBaseEntity {
  name: string;
  workoutType: WorkoutTypeValue;
  status: WorkoutStatusValue;
  date: string;
  durationMinutes?: number;
  notes?: string;
}
```

### Progress Metric

```typescript
interface IProgressMetric extends IBaseEntity {
  metricType: MetricTypeValue;
  value: number;
  unit: string;
  date: string;
  customMetricName?: string;
  notes?: string;
}
```

### Running Log

```typescript
interface IRunningLog extends IBaseEntity {
  workoutId: string;
  distanceMiles: number;
  durationMinutes: number;
  paceMinutesPerMile: number;
  routeName?: string;
  elevationGainFeet?: number;
  heartRateAvg?: number;
  weather?: string;
  notes?: string;
}
```

### Workout Exercise

```typescript
interface IWorkoutExercise extends IBaseEntity {
  workoutId: string;
  exerciseId: string;
  order: number;
  sets?: number;
  reps?: number;
  weightLbs?: number;
  durationSeconds?: number;
  restSeconds?: number;
  notes?: string;
}
```

### Personal Bests (Running Logs)

```typescript
interface IPersonalBests {
  fastestPace: number | null;
  longestDistance: number | null;
  longestDuration: number | null;
}
```

---

## Enum Values (Use as const Objects in UI)

```typescript
const MuscleGroup = {
  CHEST: "chest",
  BACK: "back",
  LEGS: "legs",
  SHOULDERS: "shoulders",
  ARMS: "arms",
  CORE: "core",
  FULL_BODY: "full_body",
} as const;

const DifficultyLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

const WorkoutType = {
  RUNNING: "running",
  WEIGHTLIFTING: "weightlifting",
  CYCLING: "cycling",
  SWIMMING: "swimming",
  OTHER: "other",
} as const;

const WorkoutStatus = {
  PLANNED: "planned",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const;

const MetricType = {
  WEIGHT_LBS: "weight_lbs",
  BODY_FAT_PCT: "body_fat_pct",
  RESTING_HEART_RATE: "resting_heart_rate",
  CUSTOM: "custom",
} as const;
```

---

## API Endpoints

### Exercises — `/exercises`

| Method | Path | Body | Query Params | Response |
|--------|------|------|-------------|----------|
| POST | `/exercises` | `{ name, description, muscleGroup, difficultyLevel, equipmentRequired, instructions }` | — | `{ success, data: IExercise }` |
| GET | `/exercises` | — | `muscleGroup?`, `name?`, `page`, `limit` | `{ success, data: IExercise[], count }` |
| GET | `/exercises/:id` | — | — | `{ success, data: IExercise }` |
| PUT | `/exercises/:id` | Partial fields | — | `{ success, data: IExercise }` |
| DELETE | `/exercises/:id` | — | — | `{ success, data: { deleted: true } }` |

### Workouts — `/workouts`

| Method | Path | Body | Query Params | Response |
|--------|------|------|-------------|----------|
| POST | `/workouts` | `{ name, workoutType, status?, date, durationMinutes?, notes? }` | — | `{ success, data: IWorkout }` |
| GET | `/workouts` | — | `startDate?`, `endDate?`, `status?`, `workoutType?`, `page`, `limit` | `{ success, data: IWorkout[], count }` |
| GET | `/workouts/:id` | — | — | `{ success, data: IWorkout }` |
| PUT | `/workouts/:id` | Partial fields | — | `{ success, data: IWorkout }` |
| DELETE | `/workouts/:id` | — | — | `{ success, data: { deleted: true } }` |

### Progress Metrics — `/progress-metrics`

| Method | Path | Body | Query Params | Response |
|--------|------|------|-------------|----------|
| POST | `/progress-metrics` | `{ metricType, value, unit, date, customMetricName?, notes? }` | — | `{ success, data: IProgressMetric }` |
| GET | `/progress-metrics` | — | `metricType?`, `startDate?`, `endDate?`, `page`, `limit` | `{ success, data: IProgressMetric[], count }` |
| GET | `/progress-metrics/latest` | — | — | `{ success, data: IProgressMetric[], count }` |
| GET | `/progress-metrics/by-type/:metricType` | — | `startDate?`, `endDate?` | `{ success, data: IProgressMetric[], count }` |
| GET | `/progress-metrics/:id` | — | — | `{ success, data: IProgressMetric }` |
| PUT | `/progress-metrics/:id` | Partial fields | — | `{ success, data: IProgressMetric }` |
| DELETE | `/progress-metrics/:id` | — | — | `{ success, data: { deleted: true } }` |

### Running Logs — `/running-logs`

| Method | Path | Body | Query Params | Response |
|--------|------|------|-------------|----------|
| POST | `/running-logs` | `{ workoutId, distanceMiles, durationMinutes, paceMinutesPerMile?, routeName?, elevationGainFeet?, heartRateAvg?, weather?, notes? }` | — | `{ success, data: IRunningLog }` |
| GET | `/running-logs` | — | `workoutId?`, `page`, `limit` | `{ success, data: IRunningLog[], count }` |
| GET | `/running-logs/personal-bests` | — | — | `{ success, data: IPersonalBests }` |
| GET | `/running-logs/workout/:workoutId` | — | — | `{ success, data: IRunningLog[], count }` |
| GET | `/running-logs/:id` | — | — | `{ success, data: IRunningLog }` |
| PUT | `/running-logs/:id` | Partial fields | — | `{ success, data: IRunningLog }` |
| DELETE | `/running-logs/:id` | — | — | `{ success, data: { deleted: true } }` |

### Workout Exercises — `/workout-exercises`

| Method | Path | Body | Query Params | Response |
|--------|------|------|-------------|----------|
| POST | `/workout-exercises` | `{ workoutId, exerciseId, order, sets?, reps?, weightLbs?, durationSeconds?, restSeconds?, notes? }` | — | `{ success, data: IWorkoutExercise }` |
| GET | `/workout-exercises` | — | `workoutId?`, `exerciseId?`, `page`, `limit` | `{ success, data: IWorkoutExercise[], count }` |
| GET | `/workout-exercises/workout/:workoutId` | — | — | `{ success, data: IWorkoutExercise[], count }` |
| GET | `/workout-exercises/:id` | — | — | `{ success, data: IWorkoutExercise }` |
| PUT | `/workout-exercises/:id` | Partial fields | — | `{ success, data: IWorkoutExercise }` |
| DELETE | `/workout-exercises/:id` | — | — | `{ success, data: { deleted: true } }` |

---

## Business Rules

### Running Logs
- **Pace auto-calculation:** If `paceMinutesPerMile` is not provided, the API calculates it as `durationMinutes / distanceMiles`
- **Workout validation:** `workoutId` must reference an existing workout (API returns 404 if not found)
- **Personal bests:** `/personal-bests` returns the fastest pace, longest distance, and longest duration across all running logs

### Workout Exercises
- **Dual foreign key validation:** Both `workoutId` and `exerciseId` must reference existing records
- **Order field:** Determines the sequence of exercises within a workout. UI should allow drag-to-reorder and send updated `order` values via PUT
- **Same exercise multiple times:** A workout can have the same exercise at different `order` positions (e.g., bench press at start and end)

### Progress Metrics
- **Custom metric rule:** When `metricType` is `"custom"`, the `customMetricName` field is **required** (API returns 400 if missing)
- **Latest endpoint:** `/latest` returns the most recent entry for each `metricType` — useful for dashboard summary cards
- **Date range filter:** `/by-type/:metricType?startDate=...&endDate=...` — for chart data

### Workouts
- **Default status:** New workouts default to `"planned"` if status is not provided
- **Date range filter:** `startDate` and `endDate` query params filter by the `date` field

---

## Charts to Build (from PRD)

| Chart | Page | Data Source | Type |
|-------|------|------------|------|
| Running pace over time | Running | `GET /running-logs` (sort by date, plot paceMinutesPerMile) | Line chart |
| Weekly workout frequency | Dashboard | `GET /workouts` (group by week, count) | Bar chart |
| Weight/body fat trend | Progress | `GET /progress-metrics/by-type/weight_lbs` and `/body_fat_pct` | Line chart |
| Workout type distribution | Dashboard | `GET /workouts` (group by workoutType, count) | Pie chart |
| Volume per muscle group | Dashboard | `GET /workout-exercises` + `GET /exercises` (aggregate sets*reps by muscleGroup) | Bar chart |

---

## Angular Standards (from CLAUDE.md)

- Standalone components only (no NgModules)
- Separate HTML and stylesheet files (no inline templates)
- Signals for state management (not RxJS subjects)
- `inject()` API for DI (not constructor injection)
- Zoneless change detection (`provideZonelessChangeDetection()`)
- `takeUntilDestroyed(destroyRef)` for subscription cleanup
- SCSS only, CSS variables for theming, Flexbox for layout
- Angular Material for UI components
- Chart.js / ng2-charts for charts
- `import type` for compile-time only imports
- State services per page: `{page}-state.service.ts`
- API service: single `api.service.ts` with typed methods

---

## Angular Service Pattern

```typescript
@Injectable({ providedIn: "root" })
export class ApiService {

  private readonly http = inject(HttpClient);
  private readonly base = "";  // proxy handles routing

  getExercises(params?: ExerciseQuery): Observable<ApiResponse<IExercise[]>> {
    return this.http.get<ApiResponse<IExercise[]>>("/exercises", { params: params as Record<string, string> });
  }

  createExercise(body: CreateExercise): Observable<ApiResponse<IExercise>> {
    return this.http.post<ApiResponse<IExercise>>("/exercises", body);
  }

  // ... same pattern for all entities
}
```

---

## Starting the API for Development

```bash
# Terminal 1: Start MongoDB
cd tests/e2e/fitness-tracker
docker compose up -d

# Terminal 2: Start API
cd tests/e2e/fitness-tracker
bun src/index.mts

# Terminal 3: Start Angular
cd tests/e2e/fitness-tracker/ui
ng serve --proxy-config proxy.conf.json
```

---

## Known Bugs Fixed (Discovered via Integration Testing)

### MongoDB `_id` Leaking into HTTP Responses (Fixed 2026-03-29)

**Symptom:** All GET and PUT endpoints (routes that read from MongoDB) were returning HTTP 400 with `{ success: false, error: "Validation error" }` instead of the expected 200 response.

**Root cause:** MongoDB's Node.js driver adds an `_id` field (ObjectId) to every document returned by `findOne`, `find().toArray()`, and `findOneAndUpdate()`. Elysia's TypeBox response validator enforces strict schemas — any extra property not declared in the response schema causes a VALIDATION error, which the `onError` handler catches and returns as 400.

**Fix:** Added `{ projection: { _id: 0 } }` to all MongoDB read operations across all 5 repositories (`exercise`, `workout`, `progress-metric`, `running-log`, `workout-exercise`). For aggregate pipelines (progress-metric `getLatest`), added `{ $project: { _id: 0 } }` stage.

**Affected files:**
- `src/features/exercises/exercise.repository.mts`
- `src/features/workouts/workout.repository.mts`
- `src/features/progress-metrics/progress-metric.repository.mts`
- `src/features/running-logs/running-log.repository.mts`
- `src/features/workout-exercises/workout-exercise.repository.mts`

### `null` Optional Fields Breaking Response Validation (Fixed 2026-03-29)

**Symptom:** After inserting documents with optional fields absent (e.g., no `userId`), MongoDB stored them as `null`. Elysia's TypeBox `t.Optional(t.String())` accepts `undefined` but NOT `null`, causing response validation to fail.

**Root cause:** All services passed optional fields directly from input data (e.g., `userId: data.userId`). When `data.userId` is `undefined`, the MongoDB BSON driver serializes `undefined` to `null` in the database. On retrieval, `null` fields fail `t.Optional(t.String())` TypeBox validation.

**Fix:** Updated all 5 services to use conditional spread (`...(data.field !== undefined && { field: data.field })`) for all optional fields, ensuring `undefined` values are never stored in MongoDB.

**Affected files:**
- `src/features/exercises/exercise.service.mts`
- `src/features/workouts/workout.service.mts`
- `src/features/progress-metrics/progress-metric.service.mts`
- `src/features/running-logs/running-log.service.mts`
- `src/features/workout-exercises/workout-exercise.service.mts`
