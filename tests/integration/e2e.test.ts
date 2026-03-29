import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock Anthropic at the external boundary only — same approach as existing tests
const mockCreate = mock(async () => ({
  content: [
    {
      type: "text",
      text: JSON.stringify({
        features: [
          {
            entityName: "User",
            description: "A user entity",
            fields: [
              { name: "email", type: "string", required: true },
              { name: "name", type: "string", required: true },
            ],
          },
        ],
      }),
    },
  ],
}));

mock.module("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    public messages = { create: mockCreate };

    public constructor(_opts: unknown) {}
  },
}));

// Set env vars for the test environment
process.env["ANTHROPIC_API_KEY"] = "test-key-e2e";
process.env["MONGO_HOSTNAME"] = "localhost";
process.env["MONGO_USERNAME"] = "admin";
process.env["MONGO_PASSWORD"] = "password";
process.env["MONGO_CLUSTER_NAME"] = "test-cluster";
process.env["NODE_ENV"] = "test";
process.env["LOG_LEVEL"] = "error";

const { runGeneration } = await import("../../src/runner.mjs");
const { runAgentOne } = await import("../../src/agent-bridge.mjs");

const TMP_DIR = "/tmp/agent-one-e2e-test";

beforeEach(() => {
  mockCreate.mockClear();
});

describe("E2E Integration — prompt → plan (dry-run)", () => {
  it("full flow: prompt → parse → plan (dry-run returns plan)", async () => {
    const progressLog: string[] = [];

    const result = await runGeneration({
      projectName: "e2e-test-project",
      outputDir: TMP_DIR,
      prompt: "Build a user management API with CRUD operations",
      dryRun: true,
      onProgress: (msg) => progressLog.push(msg),
    });

    expect(mockCreate)
.toHaveBeenCalledTimes(1);
    expect(result.plan).not.toBeNull();
    expect(result.plan?.projectName)
.toBe("e2e-test-project");
    expect(result.success)
.toBe(true);
    expect(progressLog.length)
.toBeGreaterThan(0);
  });

  it("plan includes features parsed from the prompt", async () => {
    const result = await runGeneration({
      projectName: "plan-check",
      outputDir: TMP_DIR,
      prompt: "Build a user API",
      dryRun: true,
    });

    expect(result.plan?.features.length)
.toBeGreaterThan(0);
    expect(result.plan?.features[0].entityName)
.toBe("User");
  });

  it("full flow: PRD content → parse → plan (dry-run)", async () => {
    const prdContent = [
      "# PRD: Order API",
      "",
      "### Feature: Order",
      "> Order management",
      "",
      "- total: number (required)",
      "- status: string (required)",
    ].join("\n");

    const result = await runGeneration({
      projectName: "order-api",
      outputDir: TMP_DIR,
      prdContent,
      dryRun: true,
    });

    // No Anthropic call for PRD content
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result.plan).not.toBeNull();
    expect(result.plan?.projectName)
.toBe("order-api");
    expect(result.success)
.toBe(true);
  });

  it("dry-run: returns plan with no traces", async () => {
    const result = await runGeneration({
      projectName: "dry-run-e2e",
      outputDir: TMP_DIR,
      prompt: "Generate an inventory API",
      dryRun: true,
    });

    expect(result.success)
.toBe(true);
    expect(result.plan).not.toBeNull();
    expect(result.featuresCompleted)
.toEqual([]);
    expect(result.traces)
.toEqual([]);
    expect(result.summary)
.toBe("");
  });

  it("returns error result when no input is provided", async () => {
    const result = await runGeneration({
      projectName: "no-input-test",
      outputDir: TMP_DIR,
    });

    expect(result.success)
.toBe(false);
    expect(result.plan)
.toBeNull();
  });

  it("empty features causes failure even with dry-run", async () => {
    mockCreate.mockImplementationOnce(async () => ({
      content: [{ type: "text", text: JSON.stringify({ features: [] }) }],
    }));

    const result = await runGeneration({
      projectName: "empty-features",
      outputDir: TMP_DIR,
      prompt: "vague prompt that yields nothing",
      dryRun: true,
    });

    expect(result.success)
.toBe(false);
  });
});

describe("E2E Integration — resume from partial state", () => {
  it("PRD with unchecked checkboxes parsed into features", async () => {
    const partialPrd = [
      "# PRD: My Project",
      "",
      "## Features",
      "",
      "- [x] User",
      "- [ ] Product",
      "- [ ] Order",
    ].join("\n");

    const result = await runGeneration({
      projectName: "partial-resume",
      outputDir: TMP_DIR,
      prdContent: partialPrd,
      dryRun: true,
    });

    // parsePrd parses unchecked checkboxes (fallback) as features
    expect(result.plan).not.toBeNull();
    // All checkboxes are parsed (including checked ones are not in spec)
    // The checkbox parser takes unchecked only: [ ] Product, [ ] Order
    expect(result.plan?.features.some((f) => f.entityName === "Product"))
.toBe(true);
    expect(result.plan?.features.some((f) => f.entityName === "Order"))
.toBe(true);
  });
});

describe("E2E Integration — agent bridge", () => {
  it("agent bridge dry-run returns bridge result shape", async () => {
    const result = await runAgentOne({
      projectName: "agent-bridge-e2e",
      outputDir: TMP_DIR,
      prompt: "Build a task management API",
      dryRun: true,
    });

    expect(result.success)
.toBe(true);
    expect(result.outputDir)
.toBe(TMP_DIR);
    expect(Array.isArray(result.featuresCompleted))
.toBe(true);
    expect(Array.isArray(result.featuresFailed))
.toBe(true);
    expect(typeof result.traceSummary)
.toBe("string");
  });

  it("agent bridge passes prdPath failure back to result", async () => {
    const result = await runAgentOne({
      projectName: "prd-bridge-test",
      outputDir: TMP_DIR,
      prdPath: "/nonexistent/path.md",
    });

    // Should fail gracefully because the file doesn't exist
    expect(result.success)
.toBe(false);
  });

  it("agent bridge passes onProgress callback messages", async () => {
    const progressMessages: string[] = [];

    await runAgentOne({
      projectName: "progress-bridge-test",
      outputDir: TMP_DIR,
      prompt: "Build something small",
      dryRun: true,
      onProgress: (msg) => progressMessages.push(msg),
    });

    expect(progressMessages.length)
.toBeGreaterThan(0);
  });
});
