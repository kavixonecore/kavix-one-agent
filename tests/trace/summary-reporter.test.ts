import { describe, it, expect } from "bun:test";

import { generateSummary } from "../../src/trace/summary-reporter.mjs";

import type { ITraceEntry } from "../../src/core/interfaces/index.mjs";

function makeEntry(overrides: Partial<ITraceEntry> = {}): ITraceEntry {
  return {
    traceId: "01ABC",
    sessionId: "session-1",
    featureName: "user",
    stepName: "interfaces",
    iteration: 1,
    startedAt: "2026-03-28T10:00:00.000Z",
    completedAt: "2026-03-28T10:00:05.000Z",
    durationMs: 5000,
    status: "success",
    toolUses: [{ toolName: "Read", callCount: 2, totalDurationMs: 200 }],
    tokenConsumption: { prompt: 500, completion: 250, total: 750 },
    result: {
      filesGenerated: ["src/features/user/interfaces/i-user.mts"],
      filesModified: [],
      linesOfCode: 20,
      summary: "Generated interfaces",
    },
    errors: [],
    documentation: "",
    ...overrides,
  };
}

describe("generateSummary", () => {
  it("returns a fallback message when no traces provided", () => {
    const result = generateSummary([]);

    expect(result)
.toContain("No trace data available");
  });

  it("includes session ID in the output", () => {
    const result = generateSummary([makeEntry()]);

    expect(result)
.toContain("session-1");
  });

  it("counts total steps correctly", () => {
    const traces = [
      makeEntry({ stepName: "interfaces", iteration: 1 }),
      makeEntry({ stepName: "schema", iteration: 1 }),
      makeEntry({ stepName: "repository", iteration: 1 }),
    ];
    const result = generateSummary(traces);

    expect(result)
.toContain("Total Steps:** 3");
  });

  it("counts features completed (distinct feature names with success status)", () => {
    const traces = [
      makeEntry({ featureName: "user", status: "success" }),
      makeEntry({ featureName: "user", stepName: "schema", status: "success" }),
      makeEntry({ featureName: "product", status: "success" }),
    ];
    const result = generateSummary(traces);

    expect(result)
.toContain("Features Completed:** 2");
  });

  it("lists features failed when present", () => {
    const traces = [
      makeEntry({ featureName: "user", status: "success" }),
      makeEntry({ featureName: "order", status: "failed" }),
    ];
    const result = generateSummary(traces);

    expect(result)
.toContain("Features Failed");
    expect(result)
.toContain("order");
  });

  it("sums token consumption across all traces", () => {
    const traces = [
      makeEntry({ tokenConsumption: { prompt: 100, completion: 50, total: 150 } }),
      makeEntry({ tokenConsumption: { prompt: 200, completion: 100, total: 300 } }),
    ];
    const result = generateSummary(traces);

    // Total should be 450
    expect(result)
.toContain("450");
  });

  it("includes tool usage breakdown", () => {
    const traces = [
      makeEntry({ toolUses: [{ toolName: "Read", callCount: 5, totalDurationMs: 500 }] }),
      makeEntry({ toolUses: [{ toolName: "Write", callCount: 3, totalDurationMs: 300 }] }),
    ];
    const result = generateSummary(traces);

    expect(result)
.toContain("Tool Usage Breakdown");
    expect(result)
.toContain("Read");
    expect(result)
.toContain("Write");
  });

  it("accumulates tool calls across multiple traces", () => {
    const traces = [
      makeEntry({ toolUses: [{ toolName: "Read", callCount: 3, totalDurationMs: 300 }] }),
      makeEntry({ toolUses: [{ toolName: "Read", callCount: 2, totalDurationMs: 200 }] }),
    ];
    const result = generateSummary(traces);

    // "5" total Read calls should appear in the table
    expect(result)
.toContain("| Read | 5 |");
  });

  it("includes errors section when errors exist", () => {
    const traces = [
      makeEntry({
        errors: [{ message: "Something failed", file: "src/foo.mts", context: {} }],
        status: "failed",
      }),
    ];
    const result = generateSummary(traces);

    expect(result)
.toContain("Errors Encountered");
    expect(result)
.toContain("Something failed");
  });

  it("includes step details table", () => {
    const result = generateSummary([makeEntry()]);

    expect(result)
.toContain("Step Details");
    expect(result)
.toContain("interfaces");
  });
});
