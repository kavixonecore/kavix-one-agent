import { createLogger } from "../logger/logger.mjs";

import type { ITraceEntry } from "../core/interfaces/index.mjs";

const logger = createLogger("summary-reporter");

interface IToolSummary {
  toolName: string;
  totalCalls: number;
  totalDurationMs: number;
}

/**
 * Formats a duration in milliseconds as a human-readable string.
 * @param ms - Duration in milliseconds.
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Aggregates tool usage across all trace entries.
 * @param traces - All trace entries to aggregate.
 */
function aggregateToolUses(traces: ITraceEntry[]): IToolSummary[] {
  const toolMap = new Map<string, IToolSummary>();

  for (const trace of traces) {
    for (const tool of trace.toolUses) {
      const existing = toolMap.get(tool.toolName);
      if (existing) {
        existing.totalCalls += tool.callCount;
        existing.totalDurationMs += tool.totalDurationMs;
      } else {
        toolMap.set(tool.toolName, {
          toolName: tool.toolName,
          totalCalls: tool.callCount,
          totalDurationMs: tool.totalDurationMs,
        });
      }
    }
  }

  return Array.from(toolMap.values())
.sort((a, b) => b.totalCalls - a.totalCalls);
}

/**
 * Generates a markdown summary report from a collection of trace entries.
 * @param traces - All trace entries for the session.
 * @returns Markdown string containing the session summary.
 */
export function generateSummary(traces: ITraceEntry[]): string {
  if (traces.length === 0) {
    logger.warn("No traces provided to generateSummary");
    return "# Session Summary\n\nNo trace data available.\n";
  }

  const sessionId = traces[0].sessionId;
  const totalDurationMs = traces.reduce((sum, t) => sum + t.durationMs, 0);
  const totalTokens = traces.reduce((sum, t) => sum + t.tokenConsumption.total, 0);
  const promptTokens = traces.reduce((sum, t) => sum + t.tokenConsumption.prompt, 0);
  const completionTokens = traces.reduce((sum, t) => sum + t.tokenConsumption.completion, 0);

  const featuresCompleted = [
    ...new Set(
      traces
        .filter((t) => t.status === "success")
        .map((t) => t.featureName)
    ),
  ];
  const featuresFailed = [
    ...new Set(
      traces
        .filter((t) => t.status === "failed")
        .map((t) => t.featureName)
    ),
  ];

  const allErrors = traces.flatMap((t) => t.errors);
  const toolSummaries = aggregateToolUses(traces);

  const lines: string[] = [];

  lines.push("# Session Summary");
  lines.push("");
  lines.push(`**Session ID:** ${sessionId}`);
  lines.push(`**Total Duration:** ${formatDuration(totalDurationMs)}`);
  lines.push(`**Total Steps:** ${traces.length}`);
  lines.push(`**Features Completed:** ${featuresCompleted.length}`);
  lines.push(`**Features Failed:** ${featuresFailed.length}`);
  lines.push("");

  // Token consumption
  lines.push("## Token Consumption");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("|------|-------|");
  lines.push(`| Prompt | ${promptTokens.toLocaleString()} |`);
  lines.push(`| Completion | ${completionTokens.toLocaleString()} |`);
  lines.push(`| **Total** | **${totalTokens.toLocaleString()}** |`);
  lines.push("");

  // Features completed
  if (featuresCompleted.length > 0) {
    lines.push("## Features Completed");
    lines.push("");
    for (const feature of featuresCompleted) {
      lines.push(`- ${feature}`);
    }
    lines.push("");
  }

  // Features failed
  if (featuresFailed.length > 0) {
    lines.push("## Features Failed");
    lines.push("");
    for (const feature of featuresFailed) {
      lines.push(`- ${feature}`);
    }
    lines.push("");
  }

  // Errors encountered
  if (allErrors.length > 0) {
    lines.push("## Errors Encountered");
    lines.push("");
    lines.push(`Total errors: **${allErrors.length}**`);
    lines.push("");
    for (const err of allErrors) {
      lines.push(`- ${err.message}${err.file ? ` (\`${err.file}\`)` : ""}`);
    }
    lines.push("");
  }

  // Tool usage breakdown
  if (toolSummaries.length > 0) {
    lines.push("## Tool Usage Breakdown");
    lines.push("");
    lines.push("| Tool | Total Calls | Total Duration |");
    lines.push("|------|-------------|----------------|");
    for (const tool of toolSummaries) {
      lines.push(`| ${tool.toolName} | ${tool.totalCalls} | ${formatDuration(tool.totalDurationMs)} |`);
    }
    lines.push("");
  }

  // Step-by-step trace
  lines.push("## Step Details");
  lines.push("");
  lines.push("| Step | Feature | Status | Duration | Tokens |");
  lines.push("|------|---------|--------|----------|--------|");
  for (const trace of traces) {
    const status = trace.status === "success" ? "✓" : "✗";
    lines.push(
      `| ${trace.stepName} (${trace.iteration}) | ${trace.featureName} | ${status} | ${formatDuration(trace.durationMs)} | ${trace.tokenConsumption.total} |`
    );
  }
  lines.push("");

  logger.info("Generated session summary", {
    sessionId,
    steps: traces.length,
    featuresCompleted: featuresCompleted.length,
    featuresFailed: featuresFailed.length,
  });

  return lines.join("\n");
}
