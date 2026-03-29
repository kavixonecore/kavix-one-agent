import { createLogger } from "../logger/logger.mjs";

import type { IFeaturesState } from "./interfaces/index.mjs";

const logger = createLogger("session-store");

/**
 * Generates a markdown handoff document summarising the current generation session.
 * @param featuresState - Current features state
 * @param errors - List of error/blocker messages encountered during the session
 */
export function generateHandoff(featuresState: IFeaturesState, errors: string[]): string {
  const completed = featuresState.features.filter((f) => f.status === "complete");
  const pending = featuresState.features.filter(
    (f) => f.status === "pending" || f.status === "in-progress"
  );
  const failed = featuresState.features.filter((f) => f.status === "failed");

  const completedSection =
    completed.length > 0
      ? completed.map((f) => `- [x] ${f.name}`)
.join("\n")
      : "_None completed yet._";

  const pendingSection =
    pending.length > 0
      ? pending.map((f) => `- [ ] ${f.name} (${f.status})`)
.join("\n")
      : "_All features completed or failed._";

  const failedSection =
    failed.length > 0
      ? failed.map((f) => `- ${f.name}${f.error ? `: ${f.error}` : ""}`)
.join("\n")
      : "_No failures._";

  const errorSection =
    errors.length > 0 ? errors.map((e) => `- ${e}`)
.join("\n") : "_No errors recorded._";

  const nextSteps =
    pending.length > 0
      ? pending.map((f) => `- Resume generation for: **${f.name}**`)
.join("\n")
      : "- All features are complete. Review and commit.";

  const doc = `# Session Handoff — ${featuresState.projectName}

**Generated:** ${new Date()
.toISOString()}
**Project:** ${featuresState.projectName}
**Session Started:** ${featuresState.createdAt}
**Last Updated:** ${featuresState.updatedAt}

---

## Summary

| Status | Count |
|--------|-------|
| Complete | ${completed.length} |
| Pending / In-Progress | ${pending.length} |
| Failed | ${failed.length} |
| Total | ${featuresState.features.length} |

---

## Completed Features

${completedSection}

---

## Pending Features

${pendingSection}

---

## Failed Features

${failedSection}

---

## Errors / Blockers

${errorSection}

---

## Next Steps

${nextSteps}
`;

  logger.debug("Generated handoff document", {
    project: featuresState.projectName,
    completed: completed.length,
    pending: pending.length,
    failed: failed.length,
  });

  return doc;
}
