import { describe, it, expect } from "bun:test";

import { startTrace, endTrace, recordToolUse, recordError } from "../../src/trace/trace-logger.mjs";

import type { ITraceResult } from "../../src/trace/interfaces/index.mjs";

const BASE_RESULT: ITraceResult = {
  filesGenerated: ["src/features/user/interfaces/i-user.mts"],
  filesModified: [],
  linesOfCode: 42,
  summary: "Generated user interfaces",
};

describe("startTrace", () => {
  it("creates a trace context with required fields", () => {
    const ctx = startTrace("session-1", "user", "interfaces");

    expect(ctx.traceId)
.toBeTruthy();
    expect(ctx.sessionId)
.toBe("session-1");
    expect(ctx.featureName)
.toBe("user");
    expect(ctx.stepName)
.toBe("interfaces");
    expect(ctx.iteration)
.toBe(1);
    expect(ctx.startedAt)
.toBeTruthy();
    expect(ctx.toolUses.size)
.toBe(0);
    expect(ctx.errors)
.toHaveLength(0);
  });

  it("generates unique traceIds for each call", () => {
    const ctx1 = startTrace("s", "f", "step");
    const ctx2 = startTrace("s", "f", "step");

    expect(ctx1.traceId).not.toBe(ctx2.traceId);
  });
});

describe("recordToolUse", () => {
  it("records a new tool use", () => {
    const ctx = startTrace("s", "f", "step");
    recordToolUse(ctx, "Read", 100);

    expect(ctx.toolUses.has("Read"))
.toBe(true);
    expect(ctx.toolUses.get("Read")?.callCount)
.toBe(1);
    expect(ctx.toolUses.get("Read")?.totalDurationMs)
.toBe(100);
  });

  it("accumulates call counts and durations for the same tool", () => {
    const ctx = startTrace("s", "f", "step");
    recordToolUse(ctx, "Read", 100);
    recordToolUse(ctx, "Read", 150);

    expect(ctx.toolUses.get("Read")?.callCount)
.toBe(2);
    expect(ctx.toolUses.get("Read")?.totalDurationMs)
.toBe(250);
  });

  it("tracks different tools independently", () => {
    const ctx = startTrace("s", "f", "step");
    recordToolUse(ctx, "Read", 100);
    recordToolUse(ctx, "Write", 200);

    expect(ctx.toolUses.size)
.toBe(2);
  });
});

describe("recordError", () => {
  it("records an Error instance", () => {
    const ctx = startTrace("s", "f", "step");
    recordError(ctx, new Error("Something broke"), "src/foo.mts");

    expect(ctx.errors)
.toHaveLength(1);
    expect(ctx.errors[0].message)
.toBe("Something broke");
    expect(ctx.errors[0].file)
.toBe("src/foo.mts");
  });

  it("records a non-Error value as string message", () => {
    const ctx = startTrace("s", "f", "step");
    recordError(ctx, "plain string error");

    expect(ctx.errors[0].message)
.toBe("plain string error");
  });
});

describe("endTrace", () => {
  it("produces an ITraceEntry with correct fields", () => {
    const ctx = startTrace("session-1", "user", "interfaces");
    recordToolUse(ctx, "Read", 50);
    const entry = endTrace(ctx, BASE_RESULT);

    expect(entry.traceId)
.toBe(ctx.traceId);
    expect(entry.sessionId)
.toBe("session-1");
    expect(entry.featureName)
.toBe("user");
    expect(entry.stepName)
.toBe("interfaces");
    expect(entry.status)
.toBe("success");
    expect(entry.toolUses)
.toHaveLength(1);
    expect(entry.toolUses[0].toolName)
.toBe("Read");
    expect(entry.result.filesGenerated)
.toHaveLength(1);
    expect(entry.result.linesOfCode)
.toBe(42);
    expect(entry.durationMs)
.toBeGreaterThanOrEqual(0);
  });

  it("sets status=failed when there are recorded errors", () => {
    const ctx = startTrace("s", "f", "step");
    recordError(ctx, new Error("fail"));
    const entry = endTrace(ctx, { ...BASE_RESULT, summary: "failed" });

    expect(entry.status)
.toBe("failed");
  });

  it("computes correct token total", () => {
    const ctx = startTrace("s", "f", "step");
    ctx.tokenPrompt = 1000;
    ctx.tokenCompletion = 500;
    const entry = endTrace(ctx, BASE_RESULT);

    expect(entry.tokenConsumption.total)
.toBe(1500);
    expect(entry.tokenConsumption.prompt)
.toBe(1000);
    expect(entry.tokenConsumption.completion)
.toBe(500);
  });
});
