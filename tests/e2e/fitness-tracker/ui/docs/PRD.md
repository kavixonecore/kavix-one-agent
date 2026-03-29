# Fitness Tracker Angular UI — Product Requirements Document

> **Author:** Davis Sylvester
> **Created:** 2026-03-29
> **Status:** Draft
> **API Reference:** `../memory.md`
> **API PRD:** `../../docs/PRD.md` (Phase 2)

---

## Progress Checklist

- [x] Problem statement and goals
- [x] User personas and workflows
- [x] Functional requirements with MoSCoW priorities
- [x] Technical architecture
- [x] Non-functional requirements
- [x] Task breakdown with dependencies
- [ ] Implementation started
- [ ] All pages built
- [ ] All tests passing
- [ ] Playwright verification complete

---

## 1. Problem Statement & Goals

### Problem

The fitness tracker API is fully built (5 entities, 191 tests, JWT auth, Docker setup) but has no user interface. Users must interact via curl or Swagger. A proper Angular UI is needed to log workouts, track running performance, browse exercises, monitor body metrics, and visualize progress through charts.

### Goals

| # | Goal | Measurable Outcome |
|---|------|--------------------|
| G1 | Provide a usable fitness tracking UI | All 5 entity CRUD operations accessible via the UI |
| G2 | Visualize progress with charts | 5+ charts rendering real data from the API |
| G3 | Responsive layout | Works on desktop (1920px) and tablet (768px) |
| G4 | Full test coverage | Playwright E2E + component unit tests |
| G5 | Auth integration | Auth0 login + custom form + token management |
| G6 | Match API exactly | All models/interfaces match API response shapes |

---

## 2. User Personas

### Primary: Fitness Enthusiast

- Logs workouts daily, tracks runs weekly, checks body metrics monthly
- Wants quick data entry, clear charts, and personal bests at a glance
- Uses desktop primarily, tablet occasionally

### Secondary: Runner

- Focuses on running logs, pace trends, and personal bests
- Wants pace-over-time charts with personal best benchmark lines
- Compares runs across different routes

---

## 3. Design & UX Requirements

### Visual Style

- Clean Material Design as the base
- Dashboard-heavy with dense data layout (charts, stats, tables)
- Minimal white space approach for readability on data-heavy pages
- Angular Material component library

### Navigation

- **Mobile/tablet:** Bottom tab navigation bar
- **Desktop:** Collapsible sidebar navigation
- **Dashboard:** Landing page with summary cards that link to each section
- Breadcrumbs for deep navigation

### Color Theme

- CSS variables for theming (dark/light mode support)
- Primary: Material Design default palette
- Charts: distinct, accessible colors per data series

---

## 4. Functional Requirements

### 4.1 Infrastructure

- [ ] **Must:** Angular CLI project — standalone components, zoneless, signals, SCSS, routing
- [ ] **Must:** Angular Material installed and configured
- [ ] **Must:** Chart.js + ng2-charts installed
- [ ] **Must:** Proxy config (`proxy.conf.json`) forwarding API routes to `http://localhost:3000`
- [ ] **Must:** App config with `provideZonelessChangeDetection()`, `provideHttpClient(withFetch())`, `provideRouter(routes)`, auth interceptor
- [ ] **Must:** `models/` directory with interfaces matching API entities exactly (from `ui/memory.md`)
- [ ] **Must:** `ApiResponse<T>` type matching `{ success, data, count?, error? }`
- [ ] **Must:** Responsive breakpoints: desktop (>1024px), tablet (768-1024px), mobile (<768px)

### 4.2 Auth

- [ ] **Must:** Auth0 integration via `@auth0/auth0-angular` SDK — login, logout, token management, route guards
- [ ] **Must:** Custom login form as fallback (email/password, calls API login endpoint)
- [ ] **Must:** HTTP interceptor that attaches `Authorization: Bearer <token>` to all non-public requests
- [ ] **Must:** Auth guard on all routes except login/register
- [ ] **Must:** User profile display (name, email from JWT claims)
- [ ] **Should:** Remember login state across page refreshes (token in localStorage or Auth0 session)

### 4.3 API Service Layer

- [ ] **Must:** Single `api.service.ts` with typed methods for ALL 30+ API endpoints
- [ ] **Must:** Methods match `ui/memory.md` endpoint table exactly
- [ ] **Must:** Return `Observable<ApiResponse<T>>` for all methods
- [ ] **Must:** Support query params (pagination, filters, date ranges)
- [ ] **Must:** Error handling — extract error message from `{ success: false, error }` response

### 4.4 Reusable Chart Components

- [ ] **Must:** `LineChartComponent` — accepts data points, labels, optional benchmark line
- [ ] **Must:** `BarChartComponent` — accepts categories, values, optional grouping
- [ ] **Must:** `PieChartComponent` — accepts slices with labels and values
- [ ] **Must:** All charts responsive with legends and tooltips
- [ ] **Should:** `SparklineComponent` — small inline chart for dashboard cards
- [ ] **Must:** Distinct, accessible colors per data series

### 4.5 Shared Components

- [ ] **Must:** `NavbarComponent` — top bar with app title, user profile, login/logout
- [ ] **Must:** `SidebarComponent` — collapsible sidebar for desktop nav
- [ ] **Must:** `BottomNavComponent` — bottom tab bar for mobile/tablet
- [ ] **Must:** `LoadingComponent` — spinner/skeleton for async data
- [ ] **Must:** `ErrorAlertComponent` — dismissible error banner
- [ ] **Must:** `ConfirmDialogComponent` — Material dialog for delete confirmations
- [ ] **Must:** `ViewToggleComponent` — table/card view switch button

### 4.6 Dashboard Page

- [ ] **Must:** Summary cards at top:
  - Workouts this week (count)
  - Total running distance this week (miles)
  - Latest weight entry (lbs)
  - Workout streak (consecutive days)
  - Today's planned workout (or "No workout planned")
  - Weekly workout goal progress (e.g., 3/5 workouts)
  - Latest personal bests (fastest pace, longest run)
  - Latest body metrics (weight, body fat %, resting HR)
- [ ] **Must:** Weekly workout frequency bar chart (workouts per week, last 8 weeks)
- [ ] **Must:** Workout type distribution pie chart (running/weightlifting/cycling/swimming/other)
- [ ] **Must:** Volume per muscle group bar chart (total sets * reps per muscle group from workout exercises)
- [ ] **Must:** Cards link to their respective detail pages
- [ ] **Must:** Loading states on all cards and charts
- [ ] **Must:** `DashboardStateService` with signals for all dashboard data

### 4.7 Workouts Page

- [ ] **Must:** List view with table/card toggle
- [ ] **Must:** Date range filter (start date, end date pickers)
- [ ] **Must:** Status filter (planned/completed/skipped chips)
- [ ] **Must:** Workout type filter
- [ ] **Must:** Pagination (page/limit)
- [ ] **Must:** Create workout form (Material form fields, reactive forms):
  - Name, workout type (select), date (datepicker), duration (number), notes (textarea)
  - Status defaults to "planned"
- [ ] **Must:** Edit workout (same form, pre-filled)
- [ ] **Must:** Delete workout with confirmation dialog
- [ ] **Must:** Workout detail page showing:
  - Workout info at top
  - Linked exercises below (from workout-exercises endpoint)
  - "Add Exercise" section: search exercise catalog inline, select, enter sets/reps/weight/rest
  - Drag-to-reorder exercises (update `order` field via PUT)
  - Step-by-step wizard for building a new workout: pick type → select exercises → enter performance → review → save
- [ ] **Must:** `WorkoutsStateService` with signals

### 4.8 Exercises Page

- [ ] **Must:** Exercise catalog with table/card toggle
- [ ] **Must:** Search by name (text input with debounce)
- [ ] **Must:** Filter by muscle group (chip filters or select)
- [ ] **Must:** Filter by difficulty level
- [ ] **Must:** Pagination
- [ ] **Must:** Create exercise form: name, description, muscle group (select), difficulty (select), equipment (chip input), instructions (textarea)
- [ ] **Must:** Edit exercise (same form, pre-filled)
- [ ] **Must:** Delete exercise with confirmation dialog
- [ ] **Must:** `ExercisesStateService` with signals

### 4.9 Running Page

- [ ] **Must:** Running log list with table/card toggle
- [ ] **Must:** Filter by workout (select linked workout)
- [ ] **Must:** Personal bests displayed as 3 hero cards at the top:
  - Fastest Pace (min/mile + date)
  - Longest Distance (miles + date)
  - Longest Duration (minutes + date)
- [ ] **Must:** Pace over time line chart (x: date, y: paceMinutesPerMile, last 30 runs)
- [ ] **Must:** Personal best benchmark lines overlaid on the pace chart
- [ ] **Must:** Distance over time line chart
- [ ] **Must:** Create running log form: select workout, distance, duration, pace (auto-calc preview), route name, elevation, heart rate, weather, notes
- [ ] **Must:** Edit/delete with confirmation
- [ ] **Must:** `RunningStateService` with signals

### 4.10 Progress Page

- [ ] **Must:** Overview with sparkline cards (one per metric type: weight, body fat, resting HR)
- [ ] **Must:** Click card to expand full detail view with:
  - Full line chart with date range controls
  - Data table of all entries
  - Add new entry button
- [ ] **Must:** Tabs or toggle for switching between metric types
- [ ] **Must:** Multi-line chart option (toggle to show/hide each metric)
- [ ] **Must:** Add metric form: type (select), value (number), unit (text), date (datepicker), notes
  - If type is "custom": show customMetricName field (required)
- [ ] **Must:** `ProgressStateService` with signals

### 4.11 Workout Exercises (sub-page of Workouts)

- [ ] **Must:** List exercises linked to a specific workout
- [ ] **Must:** Add exercise to workout: search catalog, select, enter sets/reps/weight/duration/rest/notes
- [ ] **Must:** Edit linked exercise details (sets, reps, weight, etc.)
- [ ] **Must:** Remove exercise from workout with confirmation
- [ ] **Must:** Reorder exercises (drag and drop, updates `order` field)

---

## 5. Technical Architecture

### Stack

| Component | Technology |
|-----------|-----------|
| Framework | Angular (latest, standalone, zoneless) |
| UI Library | Angular Material |
| Charts | Chart.js + ng2-charts |
| Auth | @auth0/auth0-angular + custom login form |
| State | Angular signals (per-page state services) |
| HTTP | HttpClient with functional interceptor |
| Styling | SCSS + CSS variables + Flexbox |
| Testing | Playwright E2E + Karma/Jest component tests |
| Package Manager | npm (Angular CLI default) |

### Folder Structure

```
ui/
  src/
    app/
      models/
        api-response.ts
        exercise.ts
        workout.ts
        progress-metric.ts
        running-log.ts
        workout-exercise.ts
        personal-bests.ts
        enums.ts
        index.ts
      services/
        api.service.ts
        auth.service.ts
      pages/
        dashboard/
          dashboard.component.ts/.html/.scss
          dashboard-state.service.ts
        workouts/
          workouts.component.ts/.html/.scss
          workouts-state.service.ts
          workout-detail/
            workout-detail.component.ts/.html/.scss
          workout-form/
            workout-form.component.ts/.html/.scss
          workout-wizard/
            workout-wizard.component.ts/.html/.scss
        exercises/
          exercises.component.ts/.html/.scss
          exercises-state.service.ts
          exercise-form/
            exercise-form.component.ts/.html/.scss
        running/
          running.component.ts/.html/.scss
          running-state.service.ts
          running-form/
            running-form.component.ts/.html/.scss
        progress/
          progress.component.ts/.html/.scss
          progress-state.service.ts
          progress-form/
            progress-form.component.ts/.html/.scss
          metric-detail/
            metric-detail.component.ts/.html/.scss
        login/
          login.component.ts/.html/.scss
      components/
        charts/
          line-chart/line-chart.component.ts/.html/.scss
          bar-chart/bar-chart.component.ts/.html/.scss
          pie-chart/pie-chart.component.ts/.html/.scss
          sparkline/sparkline.component.ts/.html/.scss
        shared/
          navbar/navbar.component.ts/.html/.scss
          sidebar/sidebar.component.ts/.html/.scss
          bottom-nav/bottom-nav.component.ts/.html/.scss
          loading/loading.component.ts/.html/.scss
          error-alert/error-alert.component.ts/.html/.scss
          confirm-dialog/confirm-dialog.component.ts/.html/.scss
          view-toggle/view-toggle.component.ts/.html/.scss
      guards/
        auth.guard.ts
      interceptors/
        auth.interceptor.ts
      app.component.ts/.html/.scss
      app.routes.ts
      app.config.ts
    environments/
      environment.ts
      environment.prod.ts
    styles.scss
    proxy.conf.json
  e2e/
    dashboard.spec.ts
    workouts.spec.ts
    exercises.spec.ts
    running.spec.ts
    progress.spec.ts
    auth.spec.ts
```

### Route Map

| Path | Component | Guard |
|------|-----------|-------|
| `/` | Dashboard | Auth |
| `/workouts` | Workouts list | Auth |
| `/workouts/new` | Workout wizard | Auth |
| `/workouts/:id` | Workout detail | Auth |
| `/workouts/:id/edit` | Workout form (edit) | Auth |
| `/exercises` | Exercises catalog | Auth |
| `/exercises/new` | Exercise form | Auth |
| `/exercises/:id/edit` | Exercise form (edit) | Auth |
| `/running` | Running logs | Auth |
| `/running/new` | Running form | Auth |
| `/running/:id/edit` | Running form (edit) | Auth |
| `/progress` | Progress overview | Auth |
| `/progress/:metricType` | Metric detail | Auth |
| `/progress/new` | Progress form | Auth |
| `/login` | Login page | None |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| `ng build` | Zero errors, zero warnings |
| First paint | < 2s on localhost |
| Chart render | < 500ms with 100 data points |
| Responsive | Desktop (1920px), tablet (768px), mobile (375px) |
| Accessibility | Material a11y defaults (keyboard nav, aria labels) |
| Bundle size | < 500KB initial load (gzipped) |
| Test coverage | Playwright E2E for all pages + component tests for services |

---

## 7. Testing Strategy

### Component Tests (Karma/Jest)

| What | Tests |
|------|-------|
| ApiService | Mock HttpClient, verify each method calls correct endpoint with correct params |
| DashboardStateService | Verify signals update on loadDashboard(), computed values correct |
| WorkoutsStateService | CRUD operations update signals, error handling works |
| ExercisesStateService | Search/filter update signals, CRUD works |
| RunningStateService | Personal bests computed, pace auto-calc preview |
| ProgressStateService | Metric type switching, sparkline data computed |
| AuthService | Token storage, interceptor attaches header, guard redirects |

### Playwright E2E Tests

| Test | Steps |
|------|-------|
| Dashboard loads | Navigate /, verify summary cards render, charts visible |
| Create workout | Navigate /workouts/new, fill form, submit, verify appears in list |
| Edit workout | Click edit, change field, submit, verify updated |
| Delete workout | Click delete, confirm dialog, verify removed from list |
| Exercise search | Navigate /exercises, type in search, verify filtered results |
| Exercise CRUD | Create, edit, delete exercise |
| Log run | Navigate /running/new, fill form, verify pace auto-calc, submit |
| Personal bests | Navigate /running, verify 3 hero cards with values |
| Pace chart | Navigate /running, verify line chart renders with data points |
| Progress sparklines | Navigate /progress, verify sparkline cards for each metric type |
| Progress detail | Click a metric card, verify full chart expands |
| Add metric | Navigate /progress/new, select type, enter value, submit |
| Custom metric | Select "custom" type, verify customMetricName field appears and is required |
| Auth login | Navigate /login, enter credentials, verify redirect to dashboard |
| Auth guard | Navigate /workouts without auth, verify redirect to /login |
| View toggle | On workouts page, click toggle, verify switches between table and card |
| Responsive | Resize to tablet, verify bottom nav appears, sidebar collapses |

### Playwright Screenshots

After each E2E test suite, take a screenshot and save to `ui/.docs/`:
- `dashboard.png`
- `workouts.png`
- `exercises.png`
- `running.png`
- `progress.png`

---

## 8. Task Breakdown

### Dependency Graph

```
TASK-01 (Scaffolding + Config)
    ↓
TASK-02 (Models + API Service)
    ↓
    ├── TASK-03 (Auth: Auth0 + custom login + interceptor + guard)
    ├── TASK-04 (Shared Components: navbar, sidebar, bottom-nav, loading, error, confirm, view-toggle)
    ├── TASK-05 (Chart Components: line, bar, pie, sparkline)
    │
    ├── TASK-06 (Dashboard Page + State Service)  ← depends on 04, 05
    ├── TASK-07 (Exercises Page + CRUD Forms)     ← depends on 04
    ├── TASK-08 (Workouts Page + Forms + Wizard + Detail)  ← depends on 04, 07
    ├── TASK-09 (Running Page + Forms + Charts + Personal Bests)  ← depends on 04, 05, 08
    ├── TASK-10 (Progress Page + Sparklines + Detail + Charts)  ← depends on 04, 05
    │
    ├── TASK-11 (Component Unit Tests)  ← depends on 02-10
    ├── TASK-12 (Playwright E2E Tests + Screenshots)  ← depends on 06-10
    │
    └── TASK-13 (Documentation + Final Verification)  ← depends on all
```

### Task Summary

| Task | Name | Depends On | Est. Components |
|------|------|-----------|----------------|
| 01 | Angular Scaffolding + Config | — | 3 files |
| 02 | Models + API Service + Interceptor | 01 | ~12 files |
| 03 | Auth (Auth0 + custom login + guard) | 02 | ~5 files |
| 04 | Shared Components | 01 | 7 components (21 files) |
| 05 | Chart Components | 01 | 4 components (12 files) |
| 06 | Dashboard Page | 04, 05 | 2 files + state service |
| 07 | Exercises Page + CRUD | 04 | 4 components + state service |
| 08 | Workouts Page + Forms + Wizard + Detail | 04, 07 | 5 components + state service |
| 09 | Running Page + Charts + Bests | 04, 05, 08 | 3 components + state service |
| 10 | Progress Page + Sparklines + Detail | 04, 05 | 4 components + state service |
| 11 | Component Unit Tests | 02-10 | ~15 test files |
| 12 | Playwright E2E Tests + Screenshots | 06-10 | ~6 test files |
| 13 | Documentation + Verification | All | Docs updates |

---

## 9. Charts Specification

| Chart | Page | API Endpoint | X-Axis | Y-Axis | Type |
|-------|------|-------------|--------|--------|------|
| Weekly workout frequency | Dashboard | `GET /workouts` | Week | Count | Bar |
| Workout type distribution | Dashboard | `GET /workouts` | Type | Count | Pie |
| Volume per muscle group | Dashboard | `GET /workout-exercises` + `GET /exercises` | Muscle group | Sets * Reps | Bar |
| Running pace over time | Running | `GET /running-logs` | Date | Pace (min/mi) | Line |
| Running distance over time | Running | `GET /running-logs` | Date | Distance (mi) | Line |
| Weight trend | Progress | `GET /progress-metrics/by-type/weight_lbs` | Date | Weight (lbs) | Line |
| Body fat trend | Progress | `GET /progress-metrics/by-type/body_fat_pct` | Date | Body fat (%) | Line |
| Resting HR trend | Progress | `GET /progress-metrics/by-type/resting_heart_rate` | Date | BPM | Line |
| Sparkline (per metric) | Progress | `GET /progress-metrics/by-type/:type` | Date | Value | Sparkline |

---

## 10. Open Questions

- [ ] Auth0 tenant: which Auth0 domain/client ID to use? (can use test tenant for now)
- [ ] Custom login API: does the API have a login endpoint, or does auth only come from Auth0/OIDC?
- [ ] Workout goal: is there a "weekly workout goal" stored in the API, or is it a frontend-only setting?
- [ ] Drag-and-drop library: use Angular CDK DragDrop or a third-party like `@angular/cdk`?
