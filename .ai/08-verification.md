# PRD Verification Report

> **Date:** 2026-03-28
> **Verified Against:** Decision Registry (06-decision-registry.md), Requirements Interview (04-requirements-interview.md), Open Questions (05-open-questions-resolved.md)

---

## Verification Method

Each decision from the registry was cross-referenced against PRD sections to confirm:
1. The decision is represented in the PRD
2. The PRD language matches the decision exactly (no drift)
3. No stale/contradictory references remain from before decisions were resolved

---

## Issues Found

### Issue 1 — STALE: Phase 1 references "Handlebars or ETA"
- **Location:** PRD Section 7, Phase 1, line 534
- **Text:** `Template engine integration (Handlebars or ETA)`
- **Decision:** Raw TypeScript template literals (Round 5, Q1)
- **Severity:** Contradiction — resolved decision not applied to timeline
- **Fix:** Change to "Raw TypeScript template literal templates (.tmpl.mts)"

### Issue 2 — STALE: Phase 5 references "Commander.js"
- **Location:** PRD Section 7, Phase 5, line 579
- **Text:** `CLI scaffolding with Commander.js (generate, resume, status, trace commands)`
- **Decision:** Custom arg parser (Round 5, Q3)
- **Severity:** Contradiction — resolved decision not applied to timeline
- **Fix:** Change to "Custom CLI arg parser (generate, resume, status, trace commands)"

### Issue 3 — STALE: Module structure references "Handlebars/ETA" comment
- **Location:** PRD Section 4.3, line 312
- **Text:** `base/                          # CRUD base templates (Handlebars/ETA)`
- **Decision:** Raw TypeScript template literals
- **Severity:** Contradiction
- **Fix:** Change comment to "# CRUD base templates (raw TypeScript template literals)"

### Issue 4 — STALE: cli.mts comment references "Commander"
- **Location:** PRD Section 4.3, line 292
- **Text:** `cli.mts                          # Commander setup, arg parsing`
- **Decision:** Custom arg parser
- **Severity:** Minor contradiction
- **Fix:** Change comment to "# Custom arg parser, CLI entry"

### Issue 5 — MISSING: RepositoryFactory not in module structure
- **Location:** PRD Section 4.3 (module structure)
- **Decision:** IRepository<D,T> + RepositoryFactory (Round 6, Q6)
- **Severity:** Gap — decided pattern has no file in the module tree
- **Fix:** Add to generation/renderers/ or core/: `repository-factory-renderer.mts`

### Issue 6 — MISSING: docker-compose.yml not mentioned in generation output
- **Location:** PRD Section 3 (Functional Requirements) and Section 4.3 (Module Structure)
- **Decision:** Docker + real MongoDB via docker-compose for smoke tests (Round 5, Q4)
- **Severity:** Gap — smoke test infrastructure not in generated output or templates
- **Fix:** Add docker-compose template to base templates, add requirement to Section 3.4

### Issue 7 — MISSING: Monorepo readiness details not in functional requirements
- **Location:** PRD Section 3 (Functional Requirements)
- **Decision:** Scoped pkg name + libs/ folder + tsconfig path aliases (Round 6, Q8)
- **Severity:** Gap — structural decisions not captured as functional requirements
- **Fix:** Add to Section 3.2 (Code Generation Engine)

### Issue 8 — MISSING: libs/ folder not in generated project structure
- **Location:** PRD does not describe the structure of generated projects
- **Decision:** libs/ folder from day one for monorepo readiness
- **Severity:** Gap — PRD describes agent-one's own structure but not the generated project's structure
- **Fix:** Add a new section (4.7) describing the generated project structure

### Issue 9 — MISSING: Session initialization protocol
- **Location:** PRD Section 3.5 and 4.4
- **Decision:** Anthropic research recommends: verify directory → read progress → review feature list → test baseline → then start new work
- **Severity:** Gap — resuming a session has no defined protocol in the generation flow
- **Fix:** Add session resume protocol to Section 4.4 between steps 1 and 2

### Issue 10 — MISSING: Iteration-level trace documentation format
- **Location:** PRD Section 3.6
- **Decision:** Full documentation from each step (user-provided requirement)
- **Severity:** Gap — "full step docs" is listed but format/schema not defined
- **Fix:** Add trace entry schema to Section 4 (Technical Architecture)

### Issue 11 — WEAK: Verification checklist items not checked
- **Location:** PRD Verification Checklist (lines 605-610) and Progress Checklist (lines 12-16)
- **Severity:** Cosmetic — checklist items for completed documentation sections should be checked
- **Fix:** Check the 6 documentation items in both checklists

---

## Verification Summary

| Category | Total Decisions | Represented in PRD | Issues |
|----------|-----------------|--------------------|--------|
| Input & Interaction | 4 | 4 | 0 |
| What Gets Generated | 13 | 11 | 2 gaps (RepositoryFactory, monorepo structure) |
| Generation Process | 5 | 5 | 2 stale refs (Handlebars, Commander) |
| State Management | 7 | 6 | 1 gap (docker-compose) |
| Execution Tracing | 4 | 3 | 1 gap (trace schema) |
| Delivery & Distribution | 5 | 5 | 2 stale refs (Commander) |
| Infrastructure Addons | 6 | 6 | 0 |
| **Total** | **44** | **40** | **11 issues** |

---

## Fixes Applied

All 11 issues fixed in PRD — see commit or diff for details.
