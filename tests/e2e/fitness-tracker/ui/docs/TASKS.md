# Fitness Tracker Angular UI — Task Breakdown

> **Generated from:** ui/docs/PRD.md
> **API Reference:** ui/memory.md

---

## Task Completion Requirements

Every task MUST report: files created, tests added, `ng build` status, lint status, errors encountered.

---

## Dependency Graph

```
TASK-01 (Scaffolding)
    ↓
TASK-02 (Models + API Service)
    ↓
    ├── TASK-03 (Auth)
    ├── TASK-04 (Shared Components)
    ├── TASK-05 (Chart Components)
    │         ↓
    │   TASK-06 (Dashboard)  ← 04, 05
    │   TASK-07 (Exercises)  ← 04
    │         ↓
    │   TASK-08 (Workouts)   ← 04, 07
    │         ↓
    │   TASK-09 (Running)    ← 04, 05, 08
    │   TASK-10 (Progress)   ← 04, 05
    │         ↓
    │   TASK-11 (Component Tests) ← 02-10
    │   TASK-12 (Playwright E2E)  ← 06-10
    │         ↓
    └── TASK-13 (Docs + Verification)
```

---

## TASK-01: Angular Scaffolding + Config
**Depends on:** Nothing

- [ ] `ng new fitness-tracker-ui --standalone --style=scss --routing`
- [ ] Install: `@angular/material`, `@angular/cdk`, `chart.js`, `ng2-charts`, `@auth0/auth0-angular`
- [ ] `app.config.ts`: `provideZonelessChangeDetection()`, `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`, `provideRouter(routes)`, `provideAnimationsAsync()`
- [ ] `app.routes.ts`: all routes from PRD route map (lazy-loaded)
- [ ] `proxy.conf.json`: forward all API routes to localhost:3000
- [ ] `styles.scss`: Angular Material theme import, CSS variables for theming, base styles
- [ ] `environments/environment.ts` + `environment.prod.ts`: apiUrl, auth0Domain, auth0ClientId
- [ ] `app.component.ts/.html/.scss`: shell layout with router-outlet, navbar, conditional sidebar/bottom-nav
- [ ] Verify: `ng build` passes, `ng serve --proxy-config proxy.conf.json` starts

---

## TASK-02: Models + API Service
**Depends on:** TASK-01

- [ ] `models/api-response.ts`: `ApiResponse<T> { success, data, count?, error? }`
- [ ] `models/exercise.ts`: `Exercise` interface matching `IExercise` from API
- [ ] `models/workout.ts`: `Workout` interface matching `IWorkout`
- [ ] `models/progress-metric.ts`: `ProgressMetric` matching `IProgressMetric`
- [ ] `models/running-log.ts`: `RunningLog` matching `IRunningLog`
- [ ] `models/workout-exercise.ts`: `WorkoutExercise` matching `IWorkoutExercise`
- [ ] `models/personal-bests.ts`: `PersonalBests` matching `IPersonalBests`
- [ ] `models/enums.ts`: `MuscleGroup`, `DifficultyLevel`, `WorkoutType`, `WorkoutStatus`, `MetricType` as const objects
- [ ] `models/index.ts`: barrel export
- [ ] `services/api.service.ts`: typed methods for ALL 30+ endpoints per `ui/memory.md`
  - Exercises: getExercises, getExerciseById, createExercise, updateExercise, deleteExercise
  - Workouts: getWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout
  - Progress: getMetrics, getMetricById, getLatestMetrics, getMetricsByType, createMetric, updateMetric, deleteMetric
  - Running: getRunningLogs, getRunningLogById, getPersonalBests, getLogsByWorkout, createRunningLog, updateRunningLog, deleteRunningLog
  - Workout Exercises: getWorkoutExercises, getWorkoutExerciseById, getByWorkout, createWorkoutExercise, updateWorkoutExercise, deleteWorkoutExercise
- [ ] Verify: `ng build` passes

---

## TASK-03: Auth (Auth0 + Custom Login + Guard)
**Depends on:** TASK-02

- [ ] `services/auth.service.ts`: wraps @auth0/auth0-angular + custom token management
  - `login()`, `logout()`, `getAccessToken()`, `isAuthenticated()`, `getUserProfile()`
  - Falls back to custom login if Auth0 is not configured
- [ ] `interceptors/auth.interceptor.ts`: functional interceptor, attaches Bearer token
- [ ] `guards/auth.guard.ts`: redirects to /login if not authenticated
- [ ] `pages/login/login.component.ts/.html/.scss`:
  - Auth0 "Login with Auth0" button
  - Custom email/password form below
  - Loading state during auth
- [ ] Wire auth in `app.config.ts` and `app.routes.ts`
- [ ] Verify: unauthenticated access redirects to /login

---

## TASK-04: Shared Components
**Depends on:** TASK-01

- [ ] `components/shared/navbar/` — app title, user profile dropdown (name, email), login/logout button
- [ ] `components/shared/sidebar/` — collapsible left sidebar with nav links (Dashboard, Workouts, Exercises, Running, Progress), active state highlighting, collapse toggle
- [ ] `components/shared/bottom-nav/` — bottom tab bar for mobile/tablet with icons, visible below 1024px breakpoint
- [ ] `components/shared/loading/` — Material spinner centered, optional skeleton mode
- [ ] `components/shared/error-alert/` — Material snackbar or banner, dismissible, shows error message
- [ ] `components/shared/confirm-dialog/` — Material dialog: "Are you sure?" with cancel/confirm buttons, customizable message
- [ ] `components/shared/view-toggle/` — two buttons (table icon / card icon), emits selected view mode
- [ ] Wire navbar + sidebar + bottom-nav into `app.component.html`
- [ ] Responsive: sidebar visible >1024px, bottom-nav visible ≤1024px
- [ ] Verify: `ng build` passes

---

## TASK-05: Chart Components
**Depends on:** TASK-01

- [ ] `components/charts/line-chart/` — accepts: `data: { labels: string[], datasets: { label, data, color }[] }`, optional `benchmarkLines: { label, value, color }[]` for personal best overlay
- [ ] `components/charts/bar-chart/` — accepts: `data: { labels: string[], datasets: { label, data, color }[] }`
- [ ] `components/charts/pie-chart/` — accepts: `data: { labels: string[], values: number[], colors: string[] }`
- [ ] `components/charts/sparkline/` — accepts: `data: number[]`, small inline chart (no axes, no legend), for dashboard cards
- [ ] All charts responsive, with tooltips, legends (except sparkline)
- [ ] Verify: `ng build` passes

---

## TASK-06: Dashboard Page
**Depends on:** TASK-04, TASK-05

- [ ] `pages/dashboard/dashboard.component.ts/.html/.scss`
- [ ] `pages/dashboard/dashboard-state.service.ts` with signals:
  - `workoutsThisWeek`, `totalDistanceThisWeek`, `latestWeight`, `workoutStreak`
  - `todaysWorkout`, `weeklyGoalProgress`, `latestPersonalBests`, `latestBodyMetrics`
  - `weeklyFrequencyData`, `workoutTypeData`, `muscleGroupVolumeData`
  - `loading`, `error`
  - `loadDashboard()` — calls multiple API endpoints, aggregates client-side
- [ ] Summary cards (8 cards in 2 rows of 4):
  - Each card: icon, label, value, sparkline or trend indicator
  - Clickable — navigates to relevant detail page
- [ ] Charts below cards:
  - Row 1: workout frequency bar chart (50%) + workout type pie chart (50%)
  - Row 2: volume per muscle group bar chart (100%)
- [ ] Loading skeleton while data loads
- [ ] Error state with retry button
- [ ] Verify: `ng build` passes, dashboard renders with mock/empty data

---

## TASK-07: Exercises Page + CRUD
**Depends on:** TASK-04

- [ ] `pages/exercises/exercises.component.ts/.html/.scss`
- [ ] `pages/exercises/exercises-state.service.ts` with signals:
  - `exercises`, `loading`, `error`, `searchTerm`, `muscleGroupFilter`, `difficultyFilter`, `page`, `pageSize`, `total`, `viewMode` (table/card)
  - `filteredExercises` (computed)
  - `loadExercises()`, `search()`, `filterByMuscleGroup()`, `delete()`, `setViewMode()`
- [ ] List view: Material table with columns (name, muscle group, difficulty, equipment)
- [ ] Card view: cards with name, muscle group badge, difficulty badge
- [ ] View toggle (table/card)
- [ ] Search bar with debounce (300ms)
- [ ] Muscle group chip filters
- [ ] Difficulty select filter
- [ ] Pagination (Material paginator)
- [ ] `pages/exercises/exercise-form/` — reactive form with Material fields:
  - name (required), description (required), muscleGroup (select, required), difficultyLevel (select, required), equipmentRequired (chip input), instructions (textarea)
  - Used for both create (/exercises/new) and edit (/exercises/:id/edit)
- [ ] Delete with confirm dialog
- [ ] Verify: `ng build` passes

---

## TASK-08: Workouts Page + Forms + Wizard + Detail
**Depends on:** TASK-04, TASK-07

- [ ] `pages/workouts/workouts.component.ts/.html/.scss`
- [ ] `pages/workouts/workouts-state.service.ts` with signals:
  - `workouts`, `loading`, `error`, `startDate`, `endDate`, `statusFilter`, `typeFilter`, `page`, `pageSize`, `total`, `viewMode`
  - `loadWorkouts()`, `filterByDateRange()`, `filterByStatus()`, `delete()`
- [ ] List with table/card toggle, date range pickers, status chips, type filter, pagination
- [ ] `pages/workouts/workout-form/` — reactive form: name, type (select), date (datepicker), duration (number), notes (textarea), status (select, default "planned")
- [ ] `pages/workouts/workout-detail/` — workout info at top + linked exercises below
  - Shows exercises from `GET /workout-exercises/workout/:workoutId`
  - "Add Exercise" inline section: search exercise catalog, select, enter sets/reps/weight/rest
  - CDK DragDrop for reordering exercises (updates `order` via PUT)
  - Remove exercise with confirm
- [ ] `pages/workouts/workout-wizard/` — step-by-step (Material stepper):
  1. Pick workout type + name + date
  2. Search and select exercises from catalog
  3. Enter sets/reps/weight per exercise
  4. Review summary
  5. Save (creates workout + workout-exercises)
- [ ] Verify: `ng build` passes

---

## TASK-09: Running Page + Charts + Personal Bests
**Depends on:** TASK-04, TASK-05, TASK-08

- [ ] `pages/running/running.component.ts/.html/.scss`
- [ ] `pages/running/running-state.service.ts` with signals:
  - `runningLogs`, `personalBests`, `loading`, `error`, `viewMode`
  - `paceChartData` (computed — maps logs to { labels: dates, data: paces })
  - `distanceChartData` (computed)
  - `benchmarkLines` (computed from personalBests — fastest pace as horizontal line)
  - `loadLogs()`, `loadPersonalBests()`
- [ ] Personal bests: 3 hero cards at top (fastest pace, longest distance, longest duration)
- [ ] Pace over time line chart with personal best benchmark line overlay
- [ ] Distance over time line chart
- [ ] Running log list with table/card toggle
- [ ] `pages/running/running-form/` — reactive form: select workout (dropdown from workouts list), distance, duration, pace (auto-calc preview: duration/distance), route name, elevation, heart rate, weather, notes
- [ ] Verify: `ng build` passes

---

## TASK-10: Progress Page + Sparklines + Detail
**Depends on:** TASK-04, TASK-05

- [ ] `pages/progress/progress.component.ts/.html/.scss`
- [ ] `pages/progress/progress-state.service.ts` with signals:
  - `latestMetrics` (from /latest), `loading`, `error`
  - `weightData`, `bodyFatData`, `heartRateData` (sparkline arrays)
  - `loadOverview()`
- [ ] Overview: sparkline cards per metric type (weight, body fat, resting HR, custom)
  - Each card: metric name, latest value, sparkline, trend arrow (up/down)
  - Click to navigate to `/progress/:metricType`
- [ ] `pages/progress/metric-detail/` — full detail view for one metric type:
  - Full line chart with date range controls (last 7 days, 30 days, 90 days, all)
  - Data table of all entries (date, value, unit, notes)
  - Tab/toggle for switching metric types
  - Multi-line chart toggle (show/hide multiple metrics on one chart)
- [ ] `pages/progress/progress-form/` — reactive form: type (select), value (number), unit (text), date (datepicker), notes
  - If type is "custom": show customMetricName field (required)
  - Validation: value required, unit required, customMetricName required when type=custom
- [ ] Verify: `ng build` passes

---

## TASK-11: Component Unit Tests
**Depends on:** TASK-02 through TASK-10

- [ ] `api.service.spec.ts` — mock HttpClient, verify each method calls correct endpoint + params
- [ ] `auth.service.spec.ts` — token management, interceptor, guard redirect
- [ ] `dashboard-state.service.spec.ts` — signals update, computed values correct
- [ ] `workouts-state.service.spec.ts` — CRUD operations, filters, pagination
- [ ] `exercises-state.service.spec.ts` — search, filter, CRUD
- [ ] `running-state.service.spec.ts` — personal bests computed, pace chart data
- [ ] `progress-state.service.spec.ts` — sparkline data, metric switching
- [ ] `line-chart.component.spec.ts` — renders with data, benchmark lines
- [ ] `bar-chart.component.spec.ts` — renders with data
- [ ] `pie-chart.component.spec.ts` — renders with data
- [ ] `confirm-dialog.component.spec.ts` — opens, returns result
- [ ] `view-toggle.component.spec.ts` — emits correct view mode
- [ ] Verify: `ng test` passes, all specs green

---

## TASK-12: Playwright E2E Tests + Screenshots
**Depends on:** TASK-06 through TASK-10

Requires: API running on localhost:3000, Angular running on localhost:4200

- [ ] `e2e/auth.spec.ts`:
  - Navigate to /workouts without auth → redirected to /login
  - Login → redirected to dashboard
- [ ] `e2e/dashboard.spec.ts`:
  - Navigate to /, verify 8 summary cards render
  - Verify 3 charts render (bar, pie, bar)
  - Click a card, verify navigation to detail page
  - Screenshot: `ui/.docs/dashboard.png`
- [ ] `e2e/exercises.spec.ts`:
  - CRUD: create exercise, verify in list, edit, verify update, delete, verify gone
  - Search by name, verify filtered results
  - Filter by muscle group
  - Toggle table/card view
  - Screenshot: `ui/.docs/exercises.png`
- [ ] `e2e/workouts.spec.ts`:
  - CRUD: create workout, verify in list, edit, delete
  - Date range filter
  - Status filter
  - Workout wizard: step through, create workout with exercises
  - Screenshot: `ui/.docs/workouts.png`
- [ ] `e2e/running.spec.ts`:
  - Create running log (linked to workout)
  - Verify personal bests hero cards
  - Verify pace chart renders
  - Verify benchmark line on chart
  - Screenshot: `ui/.docs/running.png`
- [ ] `e2e/progress.spec.ts`:
  - Verify sparkline cards render
  - Click card, verify detail view opens
  - Add new metric entry
  - Verify chart updates
  - Test custom metric type (customMetricName required)
  - Screenshot: `ui/.docs/progress.png`
- [ ] Verify: all Playwright tests pass

---

## TASK-13: Documentation + Final Verification
**Depends on:** All

- [ ] Update `ui/memory.md` if any API behavior discovered during UI development
- [ ] Update `ui/docs/PRD.md` — check off completed requirements
- [ ] `ng build --configuration=production` — zero errors
- [ ] `ng test` — all component tests pass
- [ ] Playwright — all E2E tests pass
- [ ] All screenshots saved to `ui/.docs/`
- [ ] Session log updated
- [ ] Commit and push

---

## Task Summary

| Task | Name | Depends On | Est. Files |
|------|------|-----------|------------|
| 01 | Scaffolding + Config | — | ~8 |
| 02 | Models + API Service | 01 | ~12 |
| 03 | Auth | 02 | ~5 |
| 04 | Shared Components | 01 | ~21 |
| 05 | Chart Components | 01 | ~12 |
| 06 | Dashboard | 04, 05 | ~3 |
| 07 | Exercises + CRUD | 04 | ~9 |
| 08 | Workouts + Forms + Wizard + Detail | 04, 07 | ~15 |
| 09 | Running + Charts + Bests | 04, 05, 08 | ~6 |
| 10 | Progress + Sparklines + Detail | 04, 05 | ~9 |
| 11 | Component Unit Tests | 02-10 | ~12 |
| 12 | Playwright E2E + Screenshots | 06-10 | ~6 |
| 13 | Documentation | All | ~3 |
| **Total** | | | **~121 files** |
