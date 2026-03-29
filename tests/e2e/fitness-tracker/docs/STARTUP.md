# Fitness Tracker API — Developer Setup

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Bun](https://bun.sh/) (for local development without Docker)

---

## Option 1: Full Docker Stack (recommended for new developers)

Run the API + MongoDB together in containers:

```bash
cd tests/e2e/fitness-tracker
docker compose up -d
```

This starts:
- **MongoDB 7** on port 27017 (with health check)
- **Fitness Tracker API** on port 3000 (waits for MongoDB to be healthy)

Verify:
```bash
curl http://localhost:3000/health
# { "status": "ok", "timestamp": "...", "uptime": 2 }
```

Swagger UI: http://localhost:3000/swagger

Stop:
```bash
docker compose down
```

Stop and remove data:
```bash
docker compose down -v
```

---

## Option 2: Local Bun + Docker MongoDB (for active development)

Run MongoDB in Docker, API locally with hot reload:

```bash
# Terminal 1: Start MongoDB only
cd tests/e2e/fitness-tracker
docker compose up mongodb -d

# Terminal 2: Install deps + start API locally
cd tests/e2e/fitness-tracker
bun install
MONGODB_URI="mongodb://admin:password@localhost:27017/fitness_tracker?authSource=admin" bun src/index.mts
```

For hot reload during development:
```bash
MONGODB_URI="mongodb://admin:password@localhost:27017/fitness_tracker?authSource=admin" bun --watch src/index.mts
```

---

## Running Tests

Tests require Docker MongoDB to be running:

```bash
# Start MongoDB
docker compose up mongodb -d

# Run all tests (unit + integration)
bun test

# Run specific test file
bun test src/__tests__/exercises.integration.test.mts

# Run only unit tests (no Docker needed)
bun test src/features/
```

| Test Type | Count | Docker Required |
|-----------|-------|----------------|
| Service/router unit tests | 69 | No |
| Repository tests | 23 | Yes |
| CRUD integration tests (HTTP) | 90 | Yes |
| Auth integration tests | 9 | Yes |
| **Total** | **191** | |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `PORT` | No | 3000 | API server port |
| `NODE_ENV` | No | development | Environment name |
| `LOG_LEVEL` | No | info | Winston log level |
| `JWKS_URL` | No* | — | OIDC provider JWKS endpoint |
| `JWT_ISSUER` | No | — | Expected JWT issuer |
| `JWT_AUDIENCE` | No | — | Expected JWT audience |
| `RATE_LIMIT_IP_PER_MIN` | No | 100 | Max requests per IP per minute |
| `RATE_LIMIT_USER_PER_MIN` | No | 1000 | Max requests per user per minute |

*When using Docker Compose, all env vars are set in `docker-compose.yml`.

---

## Auth Configuration

The API uses provider-agnostic JWT auth via JWKS. Compatible with Auth0, AWS Cognito, Azure AD, or any OpenID Connect provider.

### Auth0
```bash
JWKS_URL=https://your-tenant.auth0.com/.well-known/jwks.json
JWT_ISSUER=https://your-tenant.auth0.com/
JWT_AUDIENCE=https://api.fitness-tracker.com
```

### AWS Cognito
```bash
JWKS_URL=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxx/.well-known/jwks.json
JWT_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxx
JWT_AUDIENCE=your-app-client-id
```

### Public Endpoints (no auth required)
- `GET /health`
- `GET /version`
- `GET /swagger` (and all `/swagger/*` paths)

All other endpoints require `Authorization: Bearer <token>` header.

---

## API Endpoints

Full interactive docs: http://localhost:3000/swagger

| Group | Endpoints |
|-------|-----------|
| Health | `GET /health`, `GET /version` |
| Exercises | `POST`, `GET`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| Workouts | `POST`, `GET` (?startDate, ?endDate, ?status), `GET /:id`, `PUT /:id`, `DELETE /:id` |
| Progress Metrics | `POST`, `GET`, `GET /latest`, `GET /by-type/:type`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| Running Logs | `POST`, `GET`, `GET /personal-bests`, `GET /workout/:workoutId`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| Workout Exercises | `POST`, `GET`, `GET /workout/:workoutId`, `GET /:id`, `PUT /:id`, `DELETE /:id` |

Response format: `{ success: true, data, count }` or `{ success: false, error: "..." }`

---

## Building the Docker Image

```bash
docker build -t fitness-tracker-api .
```

Or let Docker Compose build it:
```bash
docker compose up --build -d
```
