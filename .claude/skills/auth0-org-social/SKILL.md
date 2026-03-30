---
name: auth0-org-social
description: Scaffold or extend the Auth0 management app (apps/auth0-mgmt) with CLI + web dashboard for managing organizations, social login connections, members, roles, and invitations. Also wires @auth0/auth0-angular into Angular apps. Use when the user says "auth0", "social login", "organization setup", or "wire auth".
user-invocable: true
disable-model-invocation: false
argument-hint: [action]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, WebSearch
---

# Auth0 Organization & Social Login Management

You are building and maintaining the **Auth0 Management App** at `apps/auth0-mgmt/` in this monorepo. This app provides both a **CLI** and a **minimal web dashboard** (Elysia API + Angular UI) for managing Auth0 organizations, social connections, members, roles, and invitations across all projects.

## Arguments

- `/auth0-org-social scaffold` — Create the full auth0-mgmt app from scratch
- `/auth0-org-social add-provider <name>` — Add a social provider (google, github, apple, microsoft)
- `/auth0-org-social wire <project-path>` — Wire @auth0/auth0-angular into an Angular app
- `/auth0-org-social` (no args) — Review current state and suggest next steps

## Architecture

### App Location & Structure

```
apps/auth0-mgmt/
  cli/
    src/
      commands/
        create-org.mts            # Create Auth0 organization
        delete-org.mts            # Delete organization
        list-orgs.mts             # List all organizations
        add-member.mts            # Add user to organization
        remove-member.mts         # Remove user from organization
        list-members.mts          # List org members
        create-role.mts           # Create a role
        assign-role.mts           # Assign role to org member
        list-roles.mts            # List roles
        enable-connection.mts     # Enable social connection on org
        disable-connection.mts    # Disable social connection on org
        list-connections.mts      # List enabled connections for org
        send-invite.mts           # Send org membership invitation
        list-invites.mts          # List pending invitations
        revoke-invite.mts         # Revoke invitation
        setup-social.mts          # Interactive: configure a social provider
        index.mts                 # CLI entry point (arg parser)
      services/
        auth0-client.mts          # Auth0 Management API client wrapper
        org.service.mts           # Organization operations
        member.service.mts        # Member operations
        role.service.mts          # Role operations
        connection.service.mts    # Connection operations
        invite.service.mts        # Invitation operations
      interfaces/
        i-org.mts
        i-member.mts
        i-role.mts
        i-connection.mts
        i-invite.mts
        index.mts
      config/
        env.mts                   # Typed env validation (Zod)
      index.mts                   # Entry point
    package.json
    tsconfig.json
  api/
    src/
      routes/
        orgs.router.mts           # /api/v1/orgs — CRUD + members
        roles.router.mts          # /api/v1/roles — CRUD + assignment
        connections.router.mts    # /api/v1/connections — list, enable, disable
        invites.router.mts        # /api/v1/invites — send, list, revoke
        audit.router.mts          # /api/v1/audit — auth event log viewer
      services/                   # Reuse cli/src/services via workspace imports
      app.mts                     # Elysia app
      index.mts                   # Server entry point
    package.json
    tsconfig.json
  ui/
    (Angular app — same standards as angular-ui agent)
    src/app/
      features/
        organizations/            # Org list, create, detail
        members/                  # Member list, add, remove, role assignment
        connections/              # Social provider status, toggle
        invitations/              # Send invite, pending list, revoke
        roles/                    # Role CRUD, assignment
        audit/                    # Audit log viewer with filters
        settings/                 # Login page config, branding
      core/
        services/
          auth0-api.service.ts    # HTTP client to api/
        ...
      app.routes.ts
      app.config.ts
    Dockerfile                    # Multi-stage, nginx:alpine
    package.json
  docker-compose.yml              # API + UI + optional MongoDB for audit cache
  README.md
```

### Technology Stack

Follow ALL rules from the global CLAUDE.md. Additionally:

| Component | Stack |
|-----------|-------|
| CLI | Bun, TypeScript (.mts), Zod validation |
| API | Bun, Elysia, @elysiajs/openapi |
| UI | Angular (latest), standalone components, signals, SCSS, ag-grid community, Luxon |
| Auth0 SDK | `auth0` npm package (Management API client) |
| HTTP | Node fetch (built into Bun) for Auth0 Management API |

### Environment Variables

```bash
# Auth0 Management API credentials (M2M app)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=m2m-app-client-id
AUTH0_CLIENT_SECRET=m2m-app-client-secret
AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/

# Per-app org IDs (add more as apps are onboarded)
AUTH0_WORKOUT_RUN_TRACKER_ORG_ID=org_xxxxxxxxxx

# Social provider credentials (stored in Auth0, referenced here for setup)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
```

Validate ALL env vars at startup with Zod in `cli/src/config/env.mts`. Only `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` are required; social provider vars are optional (only needed when running `setup-social`).

## Auth0 Management API Reference

### Authentication

All Management API calls require a bearer token obtained via client credentials:

```typescript
POST https://{AUTH0_DOMAIN}/oauth/token
Content-Type: application/json

{
  "client_id": "{AUTH0_CLIENT_ID}",
  "client_secret": "{AUTH0_CLIENT_SECRET}",
  "audience": "https://{AUTH0_DOMAIN}/api/v2/",
  "grant_type": "client_credentials"
}
```

Cache the token (expires in 24h). Refresh on 401.

### Key Endpoints

| Action | Method | Endpoint | Scopes Required |
|--------|--------|----------|-----------------|
| Create org | POST | `/api/v2/organizations` | `create:organizations` |
| List orgs | GET | `/api/v2/organizations` | `read:organizations` |
| Get org | GET | `/api/v2/organizations/{id}` | `read:organizations` |
| Delete org | DELETE | `/api/v2/organizations/{id}` | `delete:organizations` |
| List members | GET | `/api/v2/organizations/{id}/members` | `read:organization_members` |
| Add members | POST | `/api/v2/organizations/{id}/members` | `create:organization_members` |
| Remove member | DELETE | `/api/v2/organizations/{id}/members/{userId}` | `delete:organization_members` |
| Get member roles | GET | `/api/v2/organizations/{id}/members/{userId}/roles` | `read:organization_member_roles` |
| Assign roles | POST | `/api/v2/organizations/{id}/members/{userId}/roles` | `create:organization_member_roles` |
| Enable connection | POST | `/api/v2/organizations/{id}/enabled_connections` | `create:organization_connections` |
| List connections | GET | `/api/v2/organizations/{id}/enabled_connections` | `read:organization_connections` |
| Disable connection | DELETE | `/api/v2/organizations/{id}/enabled_connections/{connId}` | `delete:organization_connections` |
| Send invitation | POST | `/api/v2/organizations/{id}/invitations` | `create:organization_invitations` |
| List invitations | GET | `/api/v2/organizations/{id}/invitations` | `read:organization_invitations` |
| Revoke invitation | DELETE | `/api/v2/organizations/{id}/invitations/{inviteId}` | `delete:organization_invitations` |
| Create role | POST | `/api/v2/roles` | `create:roles` |
| List roles | GET | `/api/v2/roles` | `read:roles` |
| Create connection | POST | `/api/v2/connections` | `create:connections` |
| List connections | GET | `/api/v2/connections` | `read:connections` |

### Social Connection Strategies

| Provider | Strategy Name | Required Options |
|----------|--------------|-----------------|
| Google | `google-oauth2` | `client_id`, `client_secret` |
| GitHub | `github` | `client_id`, `client_secret` |
| Apple | `apple` | `client_id`, `client_secret`, `team_id`, `key_id` |
| Microsoft | `windowslive` | `client_id`, `client_secret` |

### Organization Connection Body

```json
{
  "connection_id": "con_xxxxxxxxxx",
  "assign_membership_on_login": true,
  "show_as_button": true
}
```

`assign_membership_on_login: true` is critical — it auto-adds users as org members on first social login.

### Invitation Body

```json
{
  "client_id": "spa-app-client-id",
  "inviter": { "name": "Admin Name" },
  "invitee": { "email": "user@example.com" },
  "connection_id": "con_xxxxxxxxxx",
  "roles": ["rol_xxxxxxxxxx"],
  "send_invitation_email": true,
  "ttl_sec": 604800
}
```

## CLI Commands

Every CLI command follows this pattern:

```typescript
// commands/create-org.mts
import { getAuth0Client } from "../services/auth0-client.mjs";
import type { ICreateOrgInput } from "../interfaces/index.mjs";

export async function createOrg(input: ICreateOrgInput): Promise<void> {
  const client = await getAuth0Client();
  const org = await client.organizations.create({
    name: input.name,
    display_name: input.displayName,
    metadata: input.metadata,
  });
  console.log(`Organization created: ${org.data.id} (${org.data.name})`);
}
```

CLI entry point uses positional args:

```bash
bun run cli/src/index.mts create-org --name acme --display-name "Acme Corp"
bun run cli/src/index.mts enable-connection --org org_xxx --provider google
bun run cli/src/index.mts send-invite --org org_xxx --email user@acme.com --role member
bun run cli/src/index.mts list-orgs
bun run cli/src/index.mts list-members --org org_xxx
bun run cli/src/index.mts assign-role --org org_xxx --user auth0|xxx --role rol_xxx
bun run cli/src/index.mts setup-social --provider google  # Interactive: prompts for credentials
```

## Wiring Angular Apps with Auth0

When invoked with `/auth0-org-social wire <path>`, the skill:

1. Installs `@auth0/auth0-angular` in the target Angular project
2. Adds Auth0 env vars to `environment.ts` and `environment.prod.ts`:

```typescript
auth0: {
  domain: "your-tenant.auth0.com",
  clientId: "spa-client-id",
  audience: "https://your-api-identifier",
  organizationId: "org_xxxxxxxxxx",  // From AUTH0_WORKOUT_RUN_TRACKER_ORG_ID
}
```

3. Updates `app.config.ts` to add `provideAuth0()`:

```typescript
import { provideAuth0 } from "@auth0/auth0-angular";

provideAuth0({
  domain: environment.auth0.domain,
  clientId: environment.auth0.clientId,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: environment.auth0.audience,
    organization: environment.auth0.organizationId,
  },
  httpInterceptor: {
    allowedList: [`${environment.apiBaseUrl}/*`],
  },
}),
```

4. Replaces the dev-login component with a real login page:

```typescript
// features/auth/components/login/login.component.ts
@Component({ ... })
export class LoginComponent {
  private readonly auth = inject(AuthService);

  loginWithGoogle(): void {
    this.auth.loginWithRedirect({
      authorizationParams: {
        organization: environment.auth0.organizationId,
        connection: "google-oauth2",
      },
    });
  }

  loginWithGitHub(): void {
    this.auth.loginWithRedirect({
      authorizationParams: {
        organization: environment.auth0.organizationId,
        connection: "github",
      },
    });
  }

  loginWithApple(): void {
    this.auth.loginWithRedirect({
      authorizationParams: {
        organization: environment.auth0.organizationId,
        connection: "apple",
      },
    });
  }

  loginWithMicrosoft(): void {
    this.auth.loginWithRedirect({
      authorizationParams: {
        organization: environment.auth0.organizationId,
        connection: "windowslive",
      },
    });
  }
}
```

5. Creates an auth guard using `@auth0/auth0-angular`:

```typescript
import { inject } from "@angular/core";
import { AuthService } from "@auth0/auth0-angular";
import type { CanActivateFn } from "@angular/router";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated$;
};
```

6. Updates `app.routes.ts` to protect routes with the guard
7. Replaces the custom `authInterceptor` with Auth0's built-in `httpInterceptor`
8. Updates `StorageService` to no longer store raw JWT tokens (Auth0 SDK handles token lifecycle)

## Web Dashboard Features

| Page | Route | Features |
|------|-------|----------|
| Organizations | `/organizations` | ag-grid list, create form, delete confirmation |
| Org Detail | `/organizations/:id` | Members tab, connections tab, invitations tab, settings |
| Members | `/organizations/:id/members` | ag-grid list, add member, remove, role assignment |
| Connections | `/organizations/:id/connections` | Toggle social providers on/off per org, connection status |
| Invitations | `/organizations/:id/invitations` | Send invite form, pending list, revoke |
| Roles | `/roles` | ag-grid list, create role form |
| Audit Log | `/audit` | ag-grid with date/event/user/status filters |
| Settings | `/settings` | Login page branding config, default org |

## Hard Rules

1. Follow ALL rules from global CLAUDE.md (Bun, TypeScript strict, .mts, Elysia patterns, DI, etc.)
2. Follow ALL Angular rules from the angular-ui agent (standalone, signals, SCSS, ag-grid, Luxon, etc.)
3. CLI and API share service layer — `cli/src/services/` is imported by `api/src/`
4. All Auth0 Management API calls go through `auth0-client.mts` — never direct fetch in commands/routes
5. Token caching with auto-refresh on 401
6. All methods <= 25 lines
7. Result<T, E> pattern for all Auth0 API calls (they can fail)
8. Structured logging via shared logger
9. Never store Auth0 client secret in source — always env vars
10. Validate all inputs with Zod schemas
11. ESLint after every change
12. `ng build` must pass with zero errors for the UI
13. Docker images always Alpine

## When to Use This Skill

- User says "auth0", "organization", "social login", "add provider", "wire auth"
- User wants to manage Auth0 orgs, members, roles, connections, or invitations
- User wants to integrate Auth0 into an Angular app
- User references `AUTH0_WORKOUT_RUN_TRACKER_ORG_ID` or similar env vars
