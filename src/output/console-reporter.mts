import { createLogger } from "../logger/logger.mjs";

import type { IGenerationPlan, IVerificationResult } from "../core/interfaces/index.mjs";
import type { IFeaturesState } from "../state/interfaces/index.mjs";

const logger = createLogger("console-reporter");

/**
 * Reports the full generation plan in a formatted summary.
 * @param plan - The generation plan to report.
 */
export function reportPlan(plan: IGenerationPlan): void {
  const lines: string[] = [];
  lines.push(`\n=== Generation Plan: ${plan.projectName} ===`);
  lines.push(`Description: ${plan.projectDescription}`);
  lines.push(`Features (${plan.features.length}):`);

  for (const feature of plan.features) {
    lines.push(`  - ${feature.entityName} (${feature.name})`);
    if (feature.fields.length > 0) {
      lines.push(`    Fields: ${feature.fields.map((f) => f.name)
.join(", ")}`);
    }
  }

  if (plan.addons && plan.addons.length > 0) {
    lines.push(`Addons: ${plan.addons.join(", ")}`);
  }

  lines.push("=".repeat(40));
  logger.info(lines.join("\n"));
}

/**
 * Reports that a feature generation has started.
 * @param featureName - The name of the feature being generated.
 */
export function reportFeatureStart(featureName: string): void {
  logger.info(`[START] Generating feature: ${featureName}`);
}

/**
 * Reports that a feature has been successfully generated.
 * @param featureName - The name of the completed feature.
 * @param files - List of file paths written.
 */
export function reportFeatureComplete(featureName: string, files: string[]): void {
  const lines = [
    `[COMPLETE] Feature: ${featureName}`,
    `  Files written (${files.length}):`,
    ...files.map((f) => `    - ${f}`),
  ];
  logger.info(lines.join("\n"));
}

/**
 * Reports that a feature generation has failed.
 * @param featureName - The name of the failed feature.
 * @param errors - List of error messages encountered.
 */
export function reportFeatureFailed(featureName: string, errors: string[]): void {
  const lines = [
    `[FAILED] Feature: ${featureName}`,
    `  Errors (${errors.length}):`,
    ...errors.map((e) => `    - ${e}`),
  ];
  logger.error(lines.join("\n"));
}

/**
 * Reports the result of a verification pipeline run.
 * @param result - The verification result to display.
 */
export function reportVerificationResult(result: IVerificationResult): void {
  const status = result.passed ? "[PASS]" : "[FAIL]";
  const lines = [
    `${status} Verification gate: ${result.gate}`,
    `  Duration: ${result.durationMs}ms`,
  ];

  if (result.errors.length > 0) {
    lines.push(`  Errors:`);
    for (const err of result.errors) {
      lines.push(`    - ${err}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(`  Warnings:`);
    for (const warn of result.warnings) {
      lines.push(`    - ${warn}`);
    }
  }

  if (result.passed) {
    logger.info(lines.join("\n"));
  } else {
    logger.error(lines.join("\n"));
  }
}

/**
 * Reports a generated markdown summary.
 * @param summary - The markdown summary string.
 */
export function reportSummary(summary: string): void {
  logger.info(`\n${summary}`);
}

/**
 * Reports the current features state as a status table.
 * @param state - The features state to display.
 */
export function reportStatus(state: IFeaturesState): void {
  const lines: string[] = [];
  lines.push(`\n=== Status: ${state.projectName} ===`);
  lines.push(`Created: ${state.createdAt}`);
  lines.push(`Updated: ${state.updatedAt}`);
  lines.push("");

  const colWidths = { name: 20, status: 12, started: 25, completed: 25 };
  const header = [
    "Feature".padEnd(colWidths.name),
    "Status".padEnd(colWidths.status),
    "Started".padEnd(colWidths.started),
    "Completed".padEnd(colWidths.completed),
  ].join(" | ");

  const separator = "-".repeat(header.length);
  lines.push(header);
  lines.push(separator);

  for (const feature of state.features) {
    const row = [
      feature.name.padEnd(colWidths.name),
      feature.status.padEnd(colWidths.status),
      (feature.startedAt ?? "-").padEnd(colWidths.started),
      (feature.completedAt ?? "-").padEnd(colWidths.completed),
    ].join(" | ");
    lines.push(row);

    if (feature.error) {
      lines.push(`  Error: ${feature.error}`);
    }
  }

  lines.push(separator);
  const completed = state.features.filter((f) => f.status === "complete").length;
  const failed = state.features.filter((f) => f.status === "failed").length;
  const pending = state.features.filter(
    (f) => f.status === "pending" || f.status === "in-progress"
  ).length;
  lines.push(`Total: ${state.features.length} | Complete: ${completed} | Failed: ${failed} | Pending: ${pending}`);

  logger.info(lines.join("\n"));
}
