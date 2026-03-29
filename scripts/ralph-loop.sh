#!/usr/bin/env bash
# =============================================================================
# Ralph Loop for Agent-One
# =============================================================================
#
# One task per iteration. Fresh context each time. State persisted via files.
#
# Based on:
#   - https://ghuntley.com/ralph/
#   - https://block.github.io/goose/docs/tutorials/ralph-loop/
#
# Usage:
#   ./scripts/ralph-loop.sh <project-dir> <tasks-file>
#
# Example:
#   ./scripts/ralph-loop.sh tests/e2e/fitness-tracker tests/e2e/fitness-tracker/docs/TASKS.md
#
# The script:
#   1. Reads the tasks file to find the next unchecked task (- [ ])
#   2. Invokes Claude Code with ONLY that one task
#   3. Claude completes the task, runs eslint --fix, runs bun test
#   4. Script checks the task off in TASKS.md (- [ ] → - [x])
#   5. Writes iteration trace to .ralph/<iteration>.md
#   6. Loops to the next task
#   7. Stops when all tasks are checked or max iterations reached
# =============================================================================

set -euo pipefail

# --- Configuration ---
PROJECT_DIR="${1:?Usage: ralph-loop.sh <project-dir> <tasks-file>}"
TASKS_FILE="${2:?Usage: ralph-loop.sh <project-dir> <tasks-file>}"
MAX_ITERATIONS="${MAX_ITERATIONS:-20}"
RALPH_DIR="${PROJECT_DIR}/.ralph"
CLAUDE_CMD="${CLAUDE_CMD:-claude}"

# --- Setup ---
mkdir -p "${RALPH_DIR}"

# Initialize iteration counter
if [ -f "${RALPH_DIR}/iteration.txt" ]; then
  ITERATION=$(cat "${RALPH_DIR}/iteration.txt")
else
  ITERATION=1
fi

echo "========================================"
echo " Ralph Loop — Agent-One"
echo "========================================"
echo " Project:    ${PROJECT_DIR}"
echo " Tasks:      ${TASKS_FILE}"
echo " Max iter:   ${MAX_ITERATIONS}"
echo " Starting:   iteration ${ITERATION}"
echo "========================================"
echo ""

# --- Main Loop ---
while [ "${ITERATION}" -le "${MAX_ITERATIONS}" ]; do

  # --- Find next unchecked task ---
  NEXT_TASK=$(grep -n '^\- \[ \]' "${TASKS_FILE}" | head -1 || true)

  if [ -z "${NEXT_TASK}" ]; then
    echo ""
    echo "========================================"
    echo " ALL TASKS COMPLETE"
    echo " Iterations used: $((ITERATION - 1))"
    echo "========================================"

    # --- Final Playwright verification ---
    echo ""
    echo " Running final Playwright visual verification..."
    FINAL_PROMPT="Navigate to the Swagger UI page of the API at ${PROJECT_DIR}. \
Start the server if not running (cd ${PROJECT_DIR} && docker compose up -d && MONGODB_URI=mongodb://admin:password@localhost:27017/?authSource=admin bun src/index.mts &). \
Wait for it to start, then use Playwright to: \
1. Navigate to http://localhost:3000/swagger \
2. Verify the page title contains the API name \
3. Take a screenshot and save it to ${PROJECT_DIR}/.docs/swagger-verification.png \
4. Write a RESULTS.md to ${PROJECT_DIR}/.docs/ with: test results, screenshot reference, all verification checks passed"

    ${CLAUDE_CMD} --print --dangerously-skip-permissions \
      -p "${FINAL_PROMPT}" \
      > "${RALPH_DIR}/final-verification.log" 2>&1 || true

    echo " Final verification complete. Check ${PROJECT_DIR}/.docs/"

    touch "${RALPH_DIR}/.ralph-complete"
    exit 0
  fi

  # Extract line number and task text
  TASK_LINE_NUM=$(echo "${NEXT_TASK}" | cut -d: -f1)
  TASK_TEXT=$(echo "${NEXT_TASK}" | cut -d: -f2- | sed 's/^- \[ \] //')

  echo "----------------------------------------"
  echo " Iteration ${ITERATION}: ${TASK_TEXT}"
  echo "----------------------------------------"

  # --- Build the prompt for this single task ---
  PROMPT_FILE="${RALPH_DIR}/prompt-${ITERATION}.md"

  cat > "${PROMPT_FILE}" << PROMPT_EOF
# Ralph Loop — Iteration ${ITERATION}

## Your ONE task this iteration

${TASK_TEXT}

## Project location

${PROJECT_DIR}

## Context files to read

- ${TASKS_FILE} — full task list (you are doing the FIRST unchecked task only)
- ${PROJECT_DIR}/docs/PRD.md — project requirements
- C:\\Users\\davis\\.claude\\CLAUDE.md — global coding standards

## Rules

1. Do ONLY the one task above. Do not work on other tasks.
2. Follow all coding standards from CLAUDE.md (strict TS, .mts files, double quotes, no any, explicit return types, Winston logger, Zod validation, as const enums)
3. Run \`eslint --fix\` after writing files
4. Run \`bun test\` after writing tests
5. When done, output a summary with: files created, tests added, lint status, errors encountered
6. If this is the FINAL task (integration/smoke test), also:
   a. Start the server and verify /swagger loads (HTTP 200)
   b. Use Playwright to take a screenshot of the Swagger UI page
   c. Save the screenshot to .docs/swagger-verification.png
   d. Write a RESULTS.md to .docs/ with test results, screenshot reference, and verification checklist
7. After ANY code change, update all documentation to stay in sync:
   - ui/memory.md (API reference, interfaces, endpoints, business rules)
   - .docs/RESULTS.md (test results)
   - docs/TASKS.md (check off completed items)
   - docs/PRD.md (check off completed requirements)
   - Swagger detail objects if route signatures changed
   Documentation must ALWAYS match the current state of the API.
8. NEVER use deprecated packages, methods, or APIs. Always use latest stable versions.
   - Use @elysiajs/openapi (NOT @elysiajs/swagger which is deprecated)
   - If unsure about an API, read the docs (https://elysiajs.com)
   - If a deprecation warning appears, fix it immediately

## Important patterns

- Router factory: \`(logger, service) => new Elysia({ prefix })\`
- Response: \`{ success: true, data, count }\` or \`{ success: false, error }\`
- DI: update getContainer() and app.mts when adding new entities
- Zod schema-first, derive types with z.infer
- Result<T,E> for recoverable errors in services
- ULID for entity IDs
- One interface per file with i- prefix
- Barrel exports (index.mts) per folder
PROMPT_EOF

  # --- Invoke Claude Code with fresh context ---
  ITERATION_START=$(date +%s)

  echo "  Invoking Claude Code..."

  # Run claude with the prompt, capturing output
  ITERATION_LOG="${RALPH_DIR}/iteration-${ITERATION}.log"

  if ${CLAUDE_CMD} --print --dangerously-skip-permissions \
    -p "$(cat "${PROMPT_FILE}")" \
    > "${ITERATION_LOG}" 2>&1; then
    TASK_STATUS="success"
  else
    TASK_STATUS="failed"
  fi

  ITERATION_END=$(date +%s)
  DURATION=$(( ITERATION_END - ITERATION_START ))

  # --- Check off the task in TASKS.md ---
  if [ "${TASK_STATUS}" = "success" ]; then
    # Replace the first occurrence of "- [ ]" on that specific line with "- [x]"
    sed -i "${TASK_LINE_NUM}s/- \[ \]/- [x]/" "${TASKS_FILE}"
    echo "  Task checked off in TASKS.md"
  else
    echo "  Task FAILED — not checked off"
  fi

  # --- Write iteration trace ---
  TRACE_FILE="${RALPH_DIR}/trace-${ITERATION}.md"

  cat > "${TRACE_FILE}" << TRACE_EOF
# Iteration ${ITERATION}

| Field | Value |
|-------|-------|
| Task | ${TASK_TEXT} |
| Status | ${TASK_STATUS} |
| Duration | ${DURATION}s |
| Timestamp | $(date -Iseconds) |

## Claude Output

\`\`\`
$(tail -100 "${ITERATION_LOG}")
\`\`\`
TRACE_EOF

  echo "  Trace written to ${TRACE_FILE}"
  echo "  Status: ${TASK_STATUS} | Duration: ${DURATION}s"

  # --- Update iteration counter ---
  ITERATION=$((ITERATION + 1))
  echo "${ITERATION}" > "${RALPH_DIR}/iteration.txt"

  # --- If task failed, pause for human review ---
  if [ "${TASK_STATUS}" = "failed" ]; then
    echo ""
    echo "  TASK FAILED. Review ${ITERATION_LOG} for details."
    echo "  To continue: re-run this script"
    echo "  To skip: manually check off the task in ${TASKS_FILE}"
    exit 1
  fi

  echo ""
done

echo ""
echo "========================================"
echo " MAX ITERATIONS (${MAX_ITERATIONS}) REACHED"
echo " Last iteration: ${ITERATION}"
echo "========================================"
exit 1
