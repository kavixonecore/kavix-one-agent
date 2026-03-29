import { ulid } from "ulid";

import { createLogger } from "../logger/logger.mjs";

import type { IToolUse, ITraceEntry, ITraceError } from "../core/interfaces/index.mjs";
import type { ITraceContext, ITraceResult } from "./interfaces/index.mjs";

const logger = createLogger("trace-logger");

/**
 * Starts a new trace context for a generation step.
 * @param sessionId - Unique identifier for the current session.
 * @param featureName - The feature being generated.
 * @param stepName - The current step within the feature.
 */
export function startTrace(
  sessionId: string,
  featureName: string,
  stepName: string
): ITraceContext {
  const context: ITraceContext = {
    traceId: ulid(),
    sessionId,
    featureName,
    stepName,
    iteration: 1,
    startedAt: new Date()
.toISOString(),
    toolUses: new Map<string, IToolUse>(),
    errors: [],
    tokenPrompt: 0,
    tokenCompletion: 0,
  };

  logger.debug("Trace started", { traceId: context.traceId, stepName });
  return context;
}

/**
 * Records a tool invocation in the trace context.
 * Accumulates call counts and durations per tool.
 * @param context - The active trace context.
 * @param toolName - Name of the tool invoked.
 * @param durationMs - How long the tool call took.
 */
export function recordToolUse(
  context: ITraceContext,
  toolName: string,
  durationMs: number
): void {
  const existing = context.toolUses.get(toolName);
  if (existing) {
    context.toolUses.set(toolName, {
      toolName,
      callCount: existing.callCount + 1,
      totalDurationMs: existing.totalDurationMs + durationMs,
    });
  } else {
    context.toolUses.set(toolName, {
      toolName,
      callCount: 1,
      totalDurationMs: durationMs,
    });
  }

  logger.debug("Tool use recorded", { toolName, durationMs });
}

/**
 * Records token consumption from an LLM API call.
 * @param context - The active trace context.
 * @param promptTokens - Number of prompt/input tokens consumed.
 * @param completionTokens - Number of completion/output tokens consumed.
 */
export function recordTokens(
  context: ITraceContext,
  promptTokens: number,
  completionTokens: number
): void {
  context.tokenPrompt += promptTokens;
  context.tokenCompletion += completionTokens;

  logger.debug("Tokens recorded", {
    promptTokens,
    completionTokens,
    totalSoFar: context.tokenPrompt + context.tokenCompletion,
  });
}

/**
 * Records an error in the trace context.
 * @param context - The active trace context.
 * @param error - The error that occurred (any unknown value).
 * @param file - Optional file path where the error occurred.
 */
export function recordError(
  context: ITraceContext,
  error: unknown,
  file?: string
): void {
  const traceError: ITraceError = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    file,
    context: {},
  };

  context.errors.push(traceError);
  logger.warn("Error recorded in trace", { message: traceError.message, file });
}

/**
 * Finalizes the trace context into an immutable ITraceEntry.
 * @param context - The active trace context to finalize.
 * @param result - The outcome data for this step.
 */
export function endTrace(
  context: ITraceContext,
  result: ITraceResult
): ITraceEntry {
  const completedAt = new Date()
.toISOString();
  const startMs = new Date(context.startedAt)
.getTime();
  const endMs = new Date(completedAt)
.getTime();
  const durationMs = endMs - startMs;

  const status: ITraceEntry["status"] = context.errors.length > 0 ? "failed" : "success";
  const toolUses: IToolUse[] = Array.from(context.toolUses.values());

  const entry: ITraceEntry = {
    traceId: context.traceId,
    sessionId: context.sessionId,
    featureName: context.featureName,
    stepName: context.stepName,
    iteration: context.iteration,
    startedAt: context.startedAt,
    completedAt,
    durationMs,
    status,
    toolUses,
    tokenConsumption: {
      prompt: context.tokenPrompt,
      completion: context.tokenCompletion,
      total: context.tokenPrompt + context.tokenCompletion,
    },
    result: {
      filesGenerated: result.filesGenerated,
      filesModified: result.filesModified,
      linesOfCode: result.linesOfCode,
      summary: result.summary,
    },
    errors: context.errors,
    documentation: "",
  };

  logger.info("Trace ended", { traceId: entry.traceId, status, durationMs });
  return entry;
}
