# PRD: Fitness Tracker Integration Tests — Comprehensive Coverage
**Feature Slug**: fitness-tracker-integration-tests

## Overview
Replace the 5 existing integration test files with comprehensive versions that test every CRUD operation,
verify exact HTTP status codes matching the OpenAPI spec, validate response body shapes, test error paths
including auth, and cover entity-specific behaviors (filters, cross-entity references, auto-calculation).

## Goals
- Every CRUD route for all 5 entities has a test verifying the exact status code
- Full lifecycle tested: Create → Read → Update → Verify Update → Delete → Verify Deleted
- Auth tests embedded: 401 for missing token, 401 for invalid token on each entity
- Entity-specific routes tested: filters, special endpoints (latest, personal-bests, by-type)
- Cross-entity tests: running-logs require a workout; workout-exercises require workout + exercise
- Zero use of `[400, 404, 500].includes(res.status)` — exact codes from router source

## Technical Approach
- All 5 files in `src/__tests__/` are fully replaced
- Files use `.mts` extension, double quotes, explicit return types, named exports
- Each file imports `startTestServer` from `./helpers/test-server.mjs`
- Tests use `beforeAll` / `afterAll`; `beforeEach` clears state via unique test data per test
- Auth token from `server.authToken` on every authenticated request
- Exact status codes taken from router source: 201 create, 200 read/update/delete, 400 validation, 404 not-found, 401 no-auth
- No method > 30 lines; helper functions for repetitive fetch calls

## Tasks
- [ ] **TASK-001**: Replace exercises.integration.test.mts with comprehensive version
  - **Description**: Rewrite with full lifecycle, auth tests, filter tests (muscleGroup, name), and all error cases. Verify exact 201/200/400/404/401 codes. Verify update persisted via GET after PUT.
  - **Acceptance**: All tests pass; includes POST/GET/GET-by-id/PUT/verify-update/DELETE/verify-deleted, auth without token (401), POST missing required field (400), POST invalid enum (400), GET nonexistent (404), PUT nonexistent (404), DELETE nonexistent (404), muscleGroup filter, name search
  - **Test Command**: `cd /c/projects/kavix-one/agent-one/tests/e2e/fitness-tracker && bun test src/__tests__/exercises.integration.test.mts`

- [ ] **TASK-002**: Replace workouts.integration.test.mts with comprehensive version
  - **Description**: Rewrite with full lifecycle, auth tests, date range filter, status filter, default status test, and all error cases.
  - **Acceptance**: All tests pass; includes lifecycle, status defaults to "planned" when omitted, date range filter verified, status filter verified, auth 401 tests, nonexistent ID 404 tests for GET/PUT/DELETE
  - **Test Command**: `cd /c/projects/kavix-one/agent-one/tests/e2e/fitness-tracker && bun test src/__tests__/workouts.integration.test.mts`

- [ ] **TASK-003**: Replace progress-metrics.integration.test.mts with comprehensive version
  - **Description**: Rewrite with full lifecycle, auth tests, custom metric validation, latest endpoint, by-type endpoint with date range, and all error cases.
  - **Acceptance**: All tests pass; custom metric without customMetricName returns 400; with it returns 201; /latest returns array; /by-type/:type filters correctly; lifecycle complete; auth 401 tests; nonexistent ID 404
  - **Test Command**: `cd /c/projects/kavix-one/agent-one/tests/e2e/fitness-tracker && bun test src/__tests__/progress-metrics.integration.test.mts`

- [ ] **TASK-004**: Replace running-logs.integration.test.mts with comprehensive version
  - **Description**: Rewrite with full lifecycle; auto-pace calculation verified; cross-entity: create workout in beforeAll; invalid workoutId returns exact 404 (not loose check); personal-bests endpoint; workout filter; auth 401 tests.
  - **Acceptance**: All tests pass; pace auto-calc verified (40min/4mi=10); /personal-bests has all 3 fields non-null after data created; /workout/:workoutId filters; invalid workoutId returns 404; auth 401; DELETE then 404
  - **Test Command**: `cd /c/projects/kavix-one/agent-one/tests/e2e/fitness-tracker && bun test src/__tests__/running-logs.integration.test.mts`

- [ ] **TASK-005**: Replace workout-exercises.integration.test.mts with comprehensive version
  - **Description**: Rewrite with full lifecycle; cross-entity: create workout + exercise in beforeAll; invalid workoutId returns 404; invalid exerciseId returns 404; /workout/:workoutId filter; auth 401 tests.
  - **Acceptance**: All tests pass; invalid workoutId returns exact 404; invalid exerciseId returns exact 404; /workout/:id filters correctly; lifecycle complete; auth 401; DELETE then 404
  - **Test Command**: `cd /c/projects/kavix-one/agent-one/tests/e2e/fitness-tracker && bun test src/__tests__/workout-exercises.integration.test.mts`

- [ ] **TASK-006**: Run full test suite and lint
  - **Description**: Run all integration tests together to ensure no port conflicts or shared state issues. Run eslint --fix.
  - **Acceptance**: All 5 test files pass with zero failures; lint passes with zero errors
  - **Test Command**: `cd /c/projects/kavix-one/agent-one/tests/e2e/fitness-tracker && bun test`

## Acceptance Criteria
- Every CRUD route has an exact-status-code assertion (not `.includes()`)
- Auth tests: each entity verifies 401 for GET without token and POST without token
- Full lifecycle: Create → Read → Update → Verify Update → Delete → Verify Deleted per entity
- Cross-entity dependencies handled in beforeAll
- No method longer than 30 lines
- ESLint passes with zero errors
- All tests pass against Docker MongoDB

## Out of Scope
- Auth test file (auth.integration.test.mts) — already comprehensive, not replaced
- UI tests
- Performance/load testing
