# agent-one

A coding agent harness that generates production-ready Elysia APIs on Bun.

---

## Features

- Generates complete CRUD feature sets in bottom-up order: interfaces, Zod schemas, repositories, services, routers, tests, and Swagger docs
- Enforces strict TypeScript conventions, layered architecture, and DI patterns across all generated code
- Accepts natural language prompts, PRD documents, or interactive interviews as input
- Supports long-running generation with pause, resume, and session handoff
- Human-in-the-loop review checkpoints after PRD generation and each completed feature
- Verification pipeline with ESLint, bun test, and endpoint smoke testing gates
- Full observability via per-step trace logging to local markdown files and MongoDB
- Pluggable addon template system for infrastructure scaffolding (Azure Terraform, AWS CDK, queues, timers)
- Dual delivery: standalone CLI and Claude Code custom agent integration
- Generates monorepo-ready projects with scoped package names, path aliases, and a shared libs folder
- Git integration with conventional commits after each verified feature

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Docker](https://www.docker.com/) (for smoke tests)
- An Anthropic API key (for prompt parsing and PRD generation)

### Install

```bash
bun install
```

### Configure Environment

Create a `.env` file with the required variables (see [Configuration](#configuration) below):

```bash
ANTHROPIC_API_KEY="your-anthropic-api-key"
MONGO_USERNAME="your-mongo-username"
MONGO_PASSWORD="your-mongo-password"
MONGO_HOSTNAME="your-mongo-hostname"
```

### Run

```bash
# Generate a new API from a natural language prompt
bun run src/index.mts generate my-api --prompt "Generate a work order management API with CRUD and status transitions"

# Generate from a PRD file
bun run src/index.mts generate my-api --prd ./docs/my-prd.md

# Interactive mode (agent-one interviews you to build a PRD)
bun run src/index.mts generate my-api --interactive
```

---

## Usage

agent-one provides four CLI commands: `generate`, `resume`, `status`, and `trace`.

### generate

Create a new API project from a prompt, PRD file, or interactive interview.

```bash
# From a natural language prompt
agent-one generate <project-name> --prompt "description of your API"

# From a PRD markdown file
agent-one generate <project-name> --prd ./path/to/prd.md

# Interactive PRD interview
agent-one generate <project-name> --interactive

# Dry run (outputs the generation plan without writing files)
agent-one generate <project-name> --prompt "..." --dry-run
```

### resume

Resume a previously interrupted generation session. Run this from inside the project directory where `features.json` exists.

```bash
cd my-api
agent-one resume
```

### status

Display the current generation status for all features in the project.

```bash
cd my-api
agent-one status
```

### trace

View execution traces from local `.docs/` files or from MongoDB.

```bash
# View local trace files
cd my-api
agent-one trace

# Query traces from MongoDB
agent-one trace --mongo

# Query traces for a specific session
agent-one trace --mongo --session <session-id>
```

---

## Claude Code Integration

agent-one works as a Claude Code custom agent. The agent bridge (`src/agent-bridge.mts`) exposes a `runAgentOne` function that accepts options from the Claude Code invocation context and delegates to the shared runner.

```typescript
import { runAgentOne } from "./agent-bridge.mjs";

const result = await runAgentOne({
  projectName: "my-api",
  outputDir: "/path/to/output",
  prompt: "Generate a work order management API",
  onProgress: (msg) => console.log(msg),
  onReviewCheckpoint: async (featureName, files) => {
    // Present files for review in the Claude Code conversation
    return { action: "approve" };
  },
});
```

In Claude Code mode:

- File operations use Claude Code's tool system (read, write, edit)
- Human review checkpoints are natural pauses in the conversation
- Smoke tests are skipped by default (no Docker dependency required)
- Progress updates are surfaced through the `onProgress` callback

---

## Generated Project Structure

Every generated project follows this structure:

```
<project-name>/
  package.json                        # Scoped name: @project/api, type: module
  tsconfig.json                       # Strict, path aliases: @project/shared -> libs/shared/src
  .env.example                        # All required env vars documented
  docker-compose.yml                  # MongoDB service for dev/testing
  src/
    index.mts                         # Entry point
    env.mts                           # Zod-validated Bun.env config singleton
    api/
      index.mts                       # Elysia app: cors + swagger + tracePlugin + routes
      plugins/
        trace.plugin.mts              # onRequest(ULID) + onAfterHandle + onError
      routes/
        health-router.mts
        version-router.mts
        index.mts
    features/
      <domain>/
        interfaces/
          i-<entity>.mts              # One interface per file
          index.mts
        validation/
          <entity>.validation.mts     # Zod schema + z.infer<> type
          index.mts
        repository/
          <entity>-repository.mts     # extends BaseRepository, ensureIndexes()
          index.mts
        service/
          <entity>-service.mts        # Constructor(repo interface, logger)
          i-<entity>-service.mts
          index.mts
        helpers/
        enums/
        docs/
          <entity>-swagger.mts        # Swagger detail objects
    ioc/
      get-container.mts               # Returns { db, databaseConfig, repositories, services, helpers }
      create-database-configuration.mts
      repository-factory.mts          # DB-agnostic factory: IRepository<D,T> resolution
      interfaces/
        i-container.mts
    loggers/
      logger.mts                      # Winston + TraceLogger factory
  libs/
    shared/
      src/
        types/
        index.mts
  tests/
    <domain>/
      <entity>-service.test.ts
  .docs/                              # Execution trace output (gitignored)
```

---

## Architecture

agent-one's internal pipeline follows five stages:

```
Input -> Planning -> Generation -> Verification -> Output
```

1. **Input** -- Accepts a natural language prompt, PRD markdown file, or interactive interview. The prompt parser uses the Claude API to extract features, entities, and relationships. The PRD parser converts markdown checkboxes into structured feature specs.

2. **Planning** -- The feature extractor identifies entities, relationships, and operations. The dependency resolver orders features so that dependencies are generated first. The generation planner produces an ordered plan written to `features.json`.

3. **Generation** -- The engine iterates through the plan and calls renderers in bottom-up order per feature: interfaces, Zod schemas, repository, service, router, tests, and Swagger docs. Templates are raw TypeScript template literals (`.tmpl.mts` files exporting render functions).

4. **Verification** -- Each completed feature passes through a gate pipeline: ESLint (programmatic API with auto-fix), bun test, and endpoint smoke test. Failures trigger up to 3 auto-fix retries before escalating to human review.

5. **Output** -- Verified files are written to disk, the feature is marked complete in `features.json`, PRD checkboxes are updated, a conventional commit is created, and a trace entry is logged to both `.docs/` and MongoDB.

---

## Addon Templates

agent-one ships with six addon templates for infrastructure scaffolding:

| Addon | Description |
|-------|-------------|
| **Azure Terraform** | Queue consumers, timer jobs, KeyVault, and managed identity scaffolding for Azure |
| **AWS CDK** | Infrastructure-as-code scaffolding for AWS deployments |
| **Queue Consumer** | Message queue consumer template with connection handling and retry logic |
| **External API Client** | HTTP client template with typed request/response contracts and error handling |
| **Teams Notification** | Microsoft Teams webhook notification integration template |
| **Timer Job** | Scheduled/cron job template with configurable intervals and logging |

Addons implement the `ITemplate` interface and are discovered automatically via filesystem-based registry. Drop a new template folder into `templates/addons/` and it becomes available.

---

## Testing

```bash
# Run all tests
bun test

# Run tests for a specific module
bun test tests/generation/

# Lint all TypeScript files
bun run lint

# Lint with auto-fix
bun run lint:fix
```

The test suite covers four levels:

- **L1** -- Template unit tests (3 domain fixtures: Configuration, Registered Sheets, Photo Analysis)
- **L2** -- Renderer integration tests (full feature and multi-feature generation)
- **L3** -- Compilation tests (`tsc --noEmit` on generated output)
- **L4** -- Lint tests (`eslint --fix` + `eslint` on generated output)

---

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | API key for Claude (used for prompt parsing and PRD generation) |
| `MONGO_USERNAME` | No | MongoDB username (required for trace storage and `trace --mongo`) |
| `MONGO_PASSWORD` | No | MongoDB password |
| `MONGO_HOSTNAME` | No | MongoDB hostname |

All environment variables are validated at startup using a Zod schema defined in `src/config/env.mts`.

---

## Tech Stack

| Concern | Technology |
|---------|------------|
| Runtime | Bun |
| Language | TypeScript (strict mode, `.mts` / `.mjs`) |
| LLM Integration | Anthropic SDK (Claude API) |
| Template Engine | Raw TypeScript template literals |
| Database | MongoDB (trace storage) |
| Git Operations | simple-git |
| Logging | Winston |
| Validation | Zod |
| ID Generation | ULID |
| Linting | ESLint with @stylistic, typescript-eslint, eslint-plugin-import, eslint-plugin-jsdoc |
| Testing | bun test |

---

## License

MIT
