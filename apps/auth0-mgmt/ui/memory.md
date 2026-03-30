# Auth0 Management UI - Memory

## Stack
- Angular 21.2 (standalone, zoneless)
- Angular Material 21.2
- ag-grid-community 35.2 / ag-grid-angular 35.2
- Luxon for date formatting
- SCSS + CSS variables

## API Base
- Dev: proxy at `/api` -> `http://localhost:3100`
- Prod: nginx reverse proxy to api:3100

## Routes (lazy-loaded)
| Route | Component | Feature |
|---|---|---|
| `/organizations` | OrgListComponent | List orgs, create, delete |
| `/organizations/:id` | OrgDetailComponent | Tabbed: Members, Connections, Invitations |
| `/roles` | RoleListComponent | List roles, create |
| `/audit` | AuditLogComponent | Filterable audit log grid |
| `/settings` | SettingsComponent | Health check, config display |

## State Pattern
Each feature has a state service with:
- Private `signal<StateModel>()` holding the whole slice
- `computed()` getters for individual fields
- `_patch()` helper for partial updates
- `takeUntilDestroyed(destroyRef)` on all subscriptions

## API Endpoints Consumed
See `core/services/api.service.ts` for typed methods covering:
- Organizations CRUD
- Members add/remove/list
- Roles CRUD + assign
- Connections list/enable/disable
- Invitations create/list/revoke
- Audit log with filters
- Health check

## Key Files
- `src/app/app.config.ts` - Zoneless, HTTP interceptors, animations
- `src/app/core/interceptors/retry.interceptor.ts` - 3x exponential backoff (skips 400/401/403/404)
- `src/app/core/interceptors/error.interceptor.ts` - Logs all HTTP errors
- `src/app/interfaces/` - All API types with barrel export
- `proxy.conf.json` - Dev proxy config
- `Dockerfile` + `nginx.conf` - Production container
