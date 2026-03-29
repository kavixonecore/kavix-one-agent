import { join } from "path";

import { createLogger } from "../logger/logger.mjs";

import type { ITraceEntry } from "../core/interfaces/index.mjs";

const logger = createLogger("trace-writer-fs");

/**
 * Formats a duration in milliseconds as a human-readable string.
 * @param ms - Duration in milliseconds.
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Renders an ITraceEntry as a markdown document.
 * @param entry - The trace entry to render.
 */
function renderMarkdown(entry: ITraceEntry): string {
  const lines: string[] = [];

  lines.push(`# Trace: ${entry.stepName} (iteration ${entry.iteration})`);
  lines.push("");
  lines.push(`**Session:** ${entry.sessionId}`);
  lines.push(`**Trace ID:** ${entry.traceId}`);
  lines.push(`**Feature:** ${entry.featureName}`);
  lines.push(`**Status:** ${entry.status}`);
  lines.push(`**Started:** ${entry.startedAt}`);
  lines.push(`**Completed:** ${entry.completedAt}`);
  lines.push(`**Duration:** ${formatDuration(entry.durationMs)}`);
  lines.push("");

  // Token consumption
  lines.push("## Token Consumption");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("|------|-------|");
  lines.push(`| Prompt | ${entry.tokenConsumption.prompt} |`);
  lines.push(`| Completion | ${entry.tokenConsumption.completion} |`);
  lines.push(`| Total | ${entry.tokenConsumption.total} |`);
  lines.push("");

  // Tool uses
  if (entry.toolUses.length > 0) {
    lines.push("## Tool Uses");
    lines.push("");
    lines.push("| Tool | Calls | Total Duration |");
    lines.push("|------|-------|----------------|");
    for (const tool of entry.toolUses) {
      lines.push(`| ${tool.toolName} | ${tool.callCount} | ${formatDuration(tool.totalDurationMs)} |`);
    }
    lines.push("");
  }

  // Result
  lines.push("## Result");
  lines.push("");
  lines.push(`**Summary:** ${entry.result.summary}`);
  lines.push(`**Lines of Code:** ${entry.result.linesOfCode}`);
  lines.push("");

  if (entry.result.filesGenerated.length > 0) {
    lines.push("### Files Generated");
    lines.push("");
    for (const file of entry.result.filesGenerated) {
      lines.push(`- \`${file}\``);
    }
    lines.push("");
  }

  if (entry.result.filesModified.length > 0) {
    lines.push("### Files Modified");
    lines.push("");
    for (const file of entry.result.filesModified) {
      lines.push(`- \`${file}\``);
    }
    lines.push("");
  }

  // Errors
  if (entry.errors.length > 0) {
    lines.push("## Errors");
    lines.push("");
    for (const err of entry.errors) {
      lines.push(`### ${err.message}`);
      lines.push("");
      if (err.file) {
        lines.push(`**File:** \`${err.file}\``);
        lines.push("");
      }
      if (err.stack) {
        lines.push("```");
        lines.push(err.stack);
        lines.push("```");
        lines.push("");
      }
    }
  }

  // Documentation
  if (entry.documentation) {
    lines.push("## Documentation");
    lines.push("");
    lines.push(entry.documentation);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Writes an ITraceEntry as a human-readable markdown file.
 * Output path: <outputDir>/.docs/<stepName>-<iteration>.md
 * @param outputDir - Root directory of the generated project.
 * @param entry - The trace entry to write.
 * @returns The absolute path of the file written.
 */
export async function writeTraceToFs(outputDir: string, entry: ITraceEntry): Promise<string> {
  const fileName = `${entry.stepName}-${entry.iteration}.md`;
  const filePath = join(outputDir, ".docs", fileName);

  const markdown = renderMarkdown(entry);

  try {
    await Bun.write(filePath, markdown);
    logger.info("Wrote trace to filesystem", { filePath });
    return filePath;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Failed to write trace file", { filePath, error: message });
    throw err;
  }
}
