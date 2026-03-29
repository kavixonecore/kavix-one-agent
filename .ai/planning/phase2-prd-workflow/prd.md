# PRD: Phase 2 — PRD Workflow and State Management
**Feature Slug**: phase2-prd-workflow

## Overview
Implements the input parsing layer (prompt parser, PRD parser, PRD interviewer, CLI args), the state management layer (features-store, PRD-store, session-store), the planning layer (generation planner, feature extractor, dependency resolver), and the human review checkpoint integration into the generation engine.

## Goals
- Parse natural language prompts into IFeatureSpec[] via Claude API
- Parse PRD markdown documents into IFeatureSpec[]
- Provide an interactive interviewer that generates PRD markdown
- Parse CLI arguments for generate/resume/status/trace commands
- Track feature generation state in features.json
- Update PRD checkboxes as features complete
- Generate session handoff documents
- Order features by dependency with topological sort
- Extract and normalize entity names from raw feature specs
- Create ordered IGenerationPlan from IFeatureSpec[]
- Integrate human review checkpoints into generation engine

## Technical Approach
All new modules follow the exact patterns established in Phase 1:
- Winston logger injected via constructor (no console.log)
- Explicit return types on all functions
- Named exports only, no default exports
- .mts source files, .mjs import specifiers
- One interface per file with i- prefix, barrel exports via index.mts
- No `any` types — unknown or explicit interfaces
- Result<T,E> discriminated union for recoverable errors
- Anthropic SDK for LLM calls (prompt-parser, prd-interviewer)
- Bun.file() / Bun.write() for file I/O in stores

Key files to create:
- src/input/prompt-parser.mts
- src/input/prd-parser.mts
- src/input/prd-interviewer.mts
- src/input/cli.mts
- src/input/interfaces/i-cli-command.mts + index.mts
- src/input/index.mts
- src/state/features-store.mts
- src/state/prd-store.mts
- src/state/session-store.mts
- src/state/interfaces/i-features-state.mts + i-feature-entry.mts + index.mts
- src/state/index.mts
- src/planning/generation-planner.mts
- src/planning/feature-extractor.mts
- src/planning/dependency-resolver.mts
- src/planning/index.mts
- tests/input/ (cli, prd-parser, prompt-parser tests)
- tests/state/ (features-store, prd-store, session-store tests)
- tests/planning/ (generation-planner, feature-extractor, dependency-resolver tests)
- Updated src/generation/engine.mts with checkpoint callback

## Tasks
- [ ] **TASK-001**: State interfaces and features-store
  - **Description**: Create i-feature-entry.mts, i-features-state.mts, their barrel, and features-store.mts with loadFeatures/saveFeatures/updateFeatureStatus. features.json shape: { projectName, features: IFeatureEntry[], updatedAt }. IFeatureEntry extends IFeatureSpec with status and timestamps.
  - **Acceptance**: features-store can round-trip write and read a features.json file; updateFeatureStatus mutates the correct entry; TypeScript strict with no any; Winston logger used; Bun.file/Bun.write for I/O.
  - **Test Command**: `bun test tests/state/features-store.test.ts`

- [ ] **TASK-002**: PRD store and session store
  - **Description**: Create prd-store.mts (loadPrd reads markdown, checkFeature toggles `- [ ]` to `- [x]` for matching feature name) and session-store.mts (generateHandoff takes IFeaturesState + ITraceEntry[] and returns a markdown string with summary, completed features, pending features, blockers, next steps).
  - **Acceptance**: prd-store toggles the correct checkbox (case-insensitive feature name match); session-store produces a markdown string with all required sections; unit tests cover checkbox toggle edge cases (already checked, not found, multiple features).
  - **Test Command**: `bun test tests/state/prd-store.test.ts tests/state/session-store.test.ts`

- [ ] **TASK-003**: CLI arg parser and i-cli-command interface
  - **Description**: Create i-cli-command.mts (ICliCommand interface with command, projectName, prompt, prdPath, interactive, subcommand fields), barrel, and cli.mts with parseArgs(argv: string[]): ICliCommand. Handles: `generate <name> --prompt "..."`, `generate <name> --prd <path>`, `generate <name> --interactive`, `resume`, `status`, `trace`. No Commander.js — custom parsing only.
  - **Acceptance**: parseArgs correctly extracts all flags and sub-commands for all four command types; unknown commands return command: "unknown"; missing required args for generate throw descriptive errors; all tests pass.
  - **Test Command**: `bun test tests/input/cli.test.ts`

- [ ] **TASK-004**: PRD parser
  - **Description**: Create prd-parser.mts with parsePrd(prdContent: string): IFeatureSpec[]. Extracts feature specs from PRD markdown with checkboxes. Pattern: lines like `- [ ] **FeatureName**: description` or `### Feature: EntityName` sections with field tables. Must handle the PRD.md format in docs/.
  - **Acceptance**: parsePrd extracts at least entity name, description, and a placeholder fields array from a sample PRD; handles empty/malformed sections gracefully; unit tests cover sample PRD markdown with 2+ features.
  - **Test Command**: `bun test tests/input/prd-parser.test.ts`

- [ ] **TASK-005**: Feature extractor and dependency resolver
  - **Description**: Create feature-extractor.mts with extractFeatures(rawFeatures: IFeatureSpec[]): IFeatureSpec[] — normalizes entity names (ensures PascalCase entityName, kebab-case name, camelCase-friendly pluralName). Create dependency-resolver.mts with resolveOrder(features: IFeatureSpec[]): IFeatureSpec[] — topological sort based on field references to other entity names; detects circular deps and throws a typed error.
  - **Acceptance**: extractFeatures normalizes names correctly; resolveOrder returns features in dependency order; circular dependency detection throws DependencyError with cycle path; unit tests cover linear chain, no-deps (stable order), and circular detection.
  - **Test Command**: `bun test tests/planning/feature-extractor.test.ts tests/planning/dependency-resolver.test.ts`

- [ ] **TASK-006**: Generation planner and planning barrel
  - **Description**: Create generation-planner.mts with createPlan(features: IFeatureSpec[], projectName: string): IGenerationPlan — calls extractFeatures then resolveOrder, sets status: "pending", createdAt/updatedAt to ISO strings, projectDescription from feature descriptions. Create src/planning/index.mts barrel.
  - **Acceptance**: createPlan returns a valid IGenerationPlan with features in dependency order, all statuses pending, timestamps set; unit tests verify ordering and plan shape; barrel exports all three planning modules.
  - **Test Command**: `bun test tests/planning/generation-planner.test.ts`

- [ ] **TASK-007**: Prompt parser (LLM-based)
  - **Description**: Create prompt-parser.mts with parsePrompt(prompt: string, apiKey: string): Promise<IFeatureSpec[]>. Uses Anthropic SDK to call Claude, passing a system prompt that instructs extraction of entities, fields, relationships, and operations. Returns IFeatureSpec[]. Handle API errors with a typed PromptParseError. Install @anthropic-ai/sdk via bun add.
  - **Acceptance**: parsePrompt sends correct system+user messages to Claude; mocked Anthropic client returns parsed IFeatureSpec[]; API errors produce typed PromptParseError; no console.log; unit test mocks the Anthropic SDK.
  - **Test Command**: `bun test tests/input/prompt-parser.test.ts`

- [ ] **TASK-008**: PRD interviewer (LLM-based)
  - **Description**: Create prd-interviewer.mts with interviewForPrd(askQuestion: (q: string) => Promise<string>, apiKey: string): Promise<string>. Uses Anthropic SDK to drive a multi-turn conversation: sends initial question set, collects answers via askQuestion callback, then generates a PRD markdown document with checkboxes. The returned string is valid PRD markdown.
  - **Acceptance**: interviewForPrd calls askQuestion at least once; uses Anthropic SDK (mockable); returns a string containing markdown with `- [ ]` checkboxes; unit test mocks both askQuestion and Anthropic SDK; no console.log.
  - **Test Command**: `bun test tests/input/prd-interviewer.test.ts`

- [ ] **TASK-009**: Human review checkpoint integration in engine
  - **Description**: Update src/generation/engine.mts to add optional onReviewCheckpoint callback: (feature: string, files: IRenderedFile[]) => Promise<"approve" | "reject" | "skip">. Add to constructor options interface IEngineOptions. In generate(), call checkpoint after each feature; if "reject" re-render (up to 3 times); if "skip" move to next; if "approve" continue. Write IEngineOptions interface.
  - **Acceptance**: Engine calls onReviewCheckpoint after each feature if provided; "reject" triggers re-render; "skip" skips feature; "approve" continues; existing behavior unchanged when callback not provided; existing tests still pass.
  - **Test Command**: `bun test tests/generation/ && bun test tests/input/ && bun test tests/state/ && bun test tests/planning/`

- [ ] **TASK-010**: Barrel files, ESLint pass, full test suite
  - **Description**: Create src/input/index.mts and src/state/index.mts barrel files. Run eslint --fix on all new files. Run full bun test suite. Fix any remaining lint errors or test failures.
  - **Acceptance**: `bun run lint` exits 0 with zero errors; `bun test` exits 0 with all tests passing; all new barrel files export all public symbols from their modules.
  - **Test Command**: `bun run lint && bun test`

## Acceptance Criteria
- All 10 tasks pass their test commands
- `bun run lint` exits with zero errors across entire project
- `bun test` runs all tests with zero failures
- No `any` types in any new file
- All new files follow .mts extension, .mjs import specifier convention
- All interfaces use i- prefix and one-per-file convention
- Winston used for all logging, no console.log

## Out of Scope
- Verification pipeline gates (Phase 3)
- Git operations (Phase 3)
- Trace writer (Phase 3)
- MongoDB trace storage (Phase 3)
- Angular UI generation
- CLI distribution/publish
