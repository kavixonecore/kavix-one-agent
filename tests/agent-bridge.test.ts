import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock the Anthropic module at the external boundary
const mockCreate = mock(async () => ({
  content: [
    {
      type: "text",
      text: JSON.stringify({
        features: [
          {
            entityName: "User",
            description: "A user entity",
            fields: [{ name: "email", type: "string", required: true }],
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

process.env["ANTHROPIC_API_KEY"] = "test-key-bridge";
process.env["MONGO_HOSTNAME"] = "localhost";
process.env["MONGO_USERNAME"] = "admin";
process.env["MONGO_PASSWORD"] = "password";
process.env["MONGO_CLUSTER_NAME"] = "test-cluster";
process.env["NODE_ENV"] = "test";
process.env["LOG_LEVEL"] = "error";

const { runAgentOne } = await import("../src/agent-bridge.mjs");

const TMP_DIR = "/tmp/agent-bridge-test";

beforeEach(() => {
  mockCreate.mockClear();
});

describe("runAgentOne", () => {
  it("returns IAgentBridgeResult shape with all required fields (dry-run)", async () => {
    const result = await runAgentOne({
      projectName: "test-project",
      outputDir: TMP_DIR,
      prompt: "Build a user API",
      dryRun: true,
    });

    expect(typeof result.success)
.toBe("boolean");
    expect(typeof result.outputDir)
.toBe("string");
    expect(Array.isArray(result.featuresCompleted))
.toBe(true);
    expect(Array.isArray(result.featuresFailed))
.toBe(true);
    expect(typeof result.traceSummary)
.toBe("string");
  });

  it("sets outputDir in result from options", async () => {
    const result = await runAgentOne({
      projectName: "proj",
      outputDir: "/tmp/my-specific-dir",
      prompt: "Create a blog API",
      dryRun: true,
    });

    expect(result.outputDir)
.toBe("/tmp/my-specific-dir");
  });

  it("returns failure when prdPath file does not exist", async () => {
    const result = await runAgentOne({
      projectName: "proj",
      outputDir: TMP_DIR,
      prdPath: "/absolutely/nonexistent/prd.md",
    });

    expect(result.success)
.toBe(false);
  });

  it("returns failure when no prompt or prdPath is provided", async () => {
    const result = await runAgentOne({
      projectName: "empty-proj",
      outputDir: TMP_DIR,
    });

    expect(result.success)
.toBe(false);
  });

  it("calls Anthropic when prompt is provided in dry-run", async () => {
    await runAgentOne({
      projectName: "prompt-test",
      outputDir: TMP_DIR,
      prompt: "Build an API",
      dryRun: true,
    });

    expect(mockCreate)
.toHaveBeenCalledTimes(1);
  });

  it("does not call Anthropic when prdPath fails on file not found", async () => {
    await runAgentOne({
      projectName: "prd-test",
      outputDir: TMP_DIR,
      prdPath: "/nonexistent/file.md",
    });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("invokes onProgress callback with progress messages (dry-run)", async () => {
    const messages: string[] = [];

    await runAgentOne({
      projectName: "progress-test",
      outputDir: TMP_DIR,
      prompt: "Build something",
      dryRun: true,
      onProgress: (msg) => messages.push(msg),
    });

    expect(messages.length)
.toBeGreaterThan(0);
  });

  it("dry-run success returns empty featuresCompleted", async () => {
    const result = await runAgentOne({
      projectName: "dry-run-test",
      outputDir: TMP_DIR,
      prompt: "Build a minimal API",
      dryRun: true,
    });

    expect(result.success)
.toBe(true);
    expect(result.featuresCompleted)
.toEqual([]);
  });
});
