# Fitness Tracker API — Startup Guide

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for MongoDB)

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

The defaults in `.env.example` work with the provided `docker-compose.yml`.

### 3. Start MongoDB

```bash
docker compose up -d
```

This starts MongoDB 7 on port 27017 with:
- Username: `admin`
- Password: `password`
- Database: `fitness_tracker`

### 4. Start the API server

```bash
bun src/index.mts
```

The API starts on **http://localhost:3000** by default.

### 5. View Swagger docs

Open **http://localhost:3000/docs** in your browser.

### 6. Health check

```bash
curl http://localhost:3000/health
# { "status": "ok", "timestamp": "...", "uptime": 0 }
```

---

## Running Tests

Unit tests (no database required):

```bash
bun test src/features/exercises/__tests__/exercise.service.test.mts
bun test src/features/exercises/__tests__/exercise.router.test.mts
# ... or all at once:
bun test
```

Integration tests (require MongoDB via Docker):

```bash
docker compose up -d
MONGODB_URI=mongodb://admin:password@localhost:27017/fitness_tracker_test?authSource=admin bun test
```

---

## Available Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /version | API version info |
| POST | /exercises | Create exercise |
| GET | /exercises | List exercises (paginated, filterable) |
| GET | /exercises/:id | Get exercise by ID |
| PUT | /exercises/:id | Update exercise |
| DELETE | /exercises/:id | Delete exercise |
| POST | /workouts | Create workout |
| GET | /workouts | List workouts (date range filter) |
| GET | /workouts/:id | Get workout by ID |
| PUT | /workouts/:id | Update workout |
| DELETE | /workouts/:id | Delete workout |
| POST | /progress-metrics | Create progress metric |
| GET | /progress-metrics | List metrics |
| GET | /progress-metrics/latest | Latest metric per type |
| GET | /progress-metrics/by-type/:metricType | Metrics by type |
| GET | /progress-metrics/:id | Get metric by ID |
| PUT | /progress-metrics/:id | Update metric |
| DELETE | /progress-metrics/:id | Delete metric |
| POST | /running-logs | Create running log |
| GET | /running-logs | List running logs |
| GET | /running-logs/personal-bests | Personal bests |
| GET | /running-logs/workout/:workoutId | Logs by workout |
| GET | /running-logs/:id | Get log by ID |
| PUT | /running-logs/:id | Update log |
| DELETE | /running-logs/:id | Delete log |
| POST | /workout-exercises | Link exercise to workout |
| GET | /workout-exercises | List workout exercises |
| GET | /workout-exercises/workout/:workoutId | Exercises for a workout |
| GET | /workout-exercises/:id | Get by ID |
| PUT | /workout-exercises/:id | Update |
| DELETE | /workout-exercises/:id | Delete |

---

## Stopping

```bash
docker compose down
```
