import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock the Anthropic module at the external boundary (same as existing test files do)
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

// Provide env vars before env.mts is loaded
process.env["ANTHROPIC_API_KEY"] = "test-key-runner";
process.env["MONGO_HOSTNAME"] = "localhost";
process.env["MONGO_USERNAME"] = "admin";
process.env["MONGO_PASSWORD"] = "password";
process.env["MONGO_CLUSTER_NAME"] = "test-cluster";
process.env["NODE_ENV"] = "test";
process.env["LOG_LEVEL"] = "error";

const { runGeneration } = await import("../src/runner.mjs");

const TMP_DIR = "/tmp/agent-one-runner-test";

beforeEach(() => {
  mockCreate.mockClear();
});

describe("runGeneration", () => {
  describe("dry-run with prompt input", () => {
    it("calls Claude to parse prompt and creates a plan", async () => {
      const result = await runGeneration({
        projectName: "runner-test",
        outputDir: TMP_DIR,
        prompt: "Build a user management API",
        dryRun: true,
      });

      // Anthropic was called to parse the prompt
      expect(mockCreate)
.toHaveBeenCalledTimes(1);
      expect(result.plan).not.toBeNull();
      expect(result.plan?.projectName)
.toBe("runner-test");
      expect(result.success)
.toBe(true);
    });

    it("dry-run does not produce trace entries", async () => {
      const result = await runGeneration({
        projectName: "runner-test",
        outputDir: TMP_DIR,
        prompt: "Build a user API",
        dryRun: true,
      });

      expect(result.traces)
.toEqual([]);
      expect(result.featuresCompleted)
.toEqual([]);
    });
  });

  describe("dry-run with PRD content input", () => {
    it("parses PRD content and skips Anthropic API call", async () => {
      const prdContent = "# PRD: Test\n\n### Feature: Order\n> Order tracking\n\n- name: string (required)\n";

      const result = await runGeneration({
        projectName: "prd-test",
        outputDir: TMP_DIR,
        prdContent,
        dryRun: true,
      });

      // No Anthropic call for PRD content
      expect(mockCreate).not.toHaveBeenCalled();
      expect(result.plan).not.toBeNull();
      expect(result.plan?.projectName)
.toBe("prd-test");
      expect(result.success)
.toBe(true);
    });
  });

  describe("dry-run mode", () => {
    it("returns plan with empty featuresCompleted in dry-run", async () => {
      const result = await runGeneration({
        projectName: "dry-run-test",
        outputDir: TMP_DIR,
        prompt: "Build something",
        dryRun: true,
      });

      expect(result.success)
.toBe(true);
      expect(result.plan).not.toBeNull();
      expect(result.featuresCompleted)
.toEqual([]);
      expect(result.summary)
.toBe("");
    });

    it("has empty traces in dry-run mode", async () => {
      const result = await runGeneration({
        projectName: "dry-run-test",
        outputDir: TMP_DIR,
        prompt: "Build something",
        dryRun: true,
      });

      expect(result.success)
.toBe(true);
      expect(result.traces)
.toEqual([]);
    });
  });

  describe("error cases", () => {
    it("returns failure when no input is provided", async () => {
      const result = await runGeneration({
        projectName: "test-project",
        outputDir: TMP_DIR,
      });

      expect(result.success)
.toBe(false);
      expect(result.summary)
.toContain("No input provided");
    });

    it("returns failure when interactive mode has no askQuestion callback", async () => {
      const result = await runGeneration({
        projectName: "test-project",
        outputDir: TMP_DIR,
        interactive: true,
      });

      expect(result.success)
.toBe(false);
      expect(result.summary)
.toContain("askQuestion");
    });

    it("returns failure when parsePrompt returns empty features", async () => {
      mockCreate.mockImplementationOnce(async () => ({
        content: [{ type: "text", text: JSON.stringify({ features: [] }) }],
      }));

      const result = await runGeneration({
        projectName: "test-project",
        outputDir: TMP_DIR,
        prompt: "vague description",
      });

      expect(result.success)
.toBe(false);
      expect(result.summary)
.toContain("No features");
    });

    it("returns plan=null when failing before plan creation", async () => {
      const result = await runGeneration({
        projectName: "test-project",
        outputDir: TMP_DIR,
      });

      expect(result.plan)
.toBeNull();
    });
  });

  describe("progress callbacks", () => {
    it("calls onProgress with messages during dry-run generation", async () => {
      const progressMessages: string[] = [];

      await runGeneration({
        projectName: "progress-test",
        outputDir: TMP_DIR,
        prompt: "Build something",
        dryRun: true,
        onProgress: (msg) => progressMessages.push(msg),
      });

      expect(progressMessages.length)
.toBeGreaterThan(0);
      expect(progressMessages.some((m) => m.includes("Parsing prompt")))
.toBe(true);
    });
  });
});
