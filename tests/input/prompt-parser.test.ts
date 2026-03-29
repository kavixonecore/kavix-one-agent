import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock the Anthropic module before importing prompt-parser
const mockCreate = mock(async (_params: unknown) => ({
  content: [
    {
      type: "text",
      text: JSON.stringify({
        features: [
          {
            entityName: "WorkOrder",
            description: "Represents a work order",
            fields: [
              { name: "title", type: "string", required: true, description: "Title" },
              { name: "status", type: "string", required: true },
              { name: "priority", type: "number", required: false },
              { name: "createdAt", type: "Date", required: true },
            ],
          },
          {
            entityName: "Technician",
            description: "A field technician",
            fields: [
              { name: "firstName", type: "string", required: true },
              { name: "email", type: "string", required: true },
            ],
          },
        ],
      }),
    },
  ],
  usage: {
    input_tokens: 150,
    output_tokens: 320,
  },
}));

mock.module("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    public messages = { create: mockCreate };

    public constructor(_opts: unknown) {}
  },
}));

// Import AFTER mocking
const { parsePrompt } = await import("../../src/input/prompt-parser.mjs");

beforeEach(() => {
  mockCreate.mockClear();
});

describe("prompt-parser", () => {
  describe("parsePrompt", () => {
    it("calls Claude API with the given prompt", async () => {
      await parsePrompt("Build a work order API", "test-api-key");
      expect(mockCreate)
.toHaveBeenCalledTimes(1);
      const callArgs = mockCreate.mock.calls[0][0] as { messages: Array<{ content: string }> };
      expect(callArgs.messages[0].content)
.toBe("Build a work order API");
    });

    it("returns parsed feature specs", async () => {
      const result = await parsePrompt("Build a work order API", "test-api-key");
      expect(result.features)
.toHaveLength(2);
    });

    it("returns feature with correct entityName", async () => {
      const result = await parsePrompt("Build a work order API", "test-api-key");
      const workOrder = result.features.find((s) => s.entityName === "WorkOrder");
      expect(workOrder)
.toBeDefined();
    });

    it("converts entityName to kebab-case name", async () => {
      const result = await parsePrompt("Build a work order API", "test-api-key");
      const workOrder = result.features.find((s) => s.entityName === "WorkOrder");
      expect(workOrder?.name)
.toBe("work-order");
    });

    it("maps fields correctly from Claude response", async () => {
      const result = await parsePrompt("Build a work order API", "test-api-key");
      const workOrder = result.features.find((s) => s.entityName === "WorkOrder");
      const titleField = workOrder?.fields.find((f) => f.name === "title");
      expect(titleField)
.toBeDefined();
      expect(titleField?.type)
.toBe("string");
      expect(titleField?.required)
.toBe(true);
    });

    it("maps Date type correctly", async () => {
      const result = await parsePrompt("Build a work order API", "test-api-key");
      const workOrder = result.features.find((s) => s.entityName === "WorkOrder");
      const createdAt = workOrder?.fields.find((f) => f.name === "createdAt");
      expect(createdAt?.type)
.toBe("Date");
    });

    it("sets enums and indexes to empty arrays", async () => {
      const result = await parsePrompt("Build a work order API", "test-api-key");
      for (const spec of result.features) {
        expect(spec.enums)
.toHaveLength(0);
        expect(spec.indexes)
.toHaveLength(0);
      }
    });

    it("returns empty array when API call fails", async () => {
      mockCreate.mockImplementationOnce(async () => {
        throw new Error("Network error");
      });
      const result = await parsePrompt("Build a work order API", "test-api-key");
      expect(result.features)
.toHaveLength(0);
    });

    it("returns empty array when response is invalid JSON", async () => {
      mockCreate.mockImplementationOnce(async () => ({
        content: [{ type: "text", text: "this is not json at all" }],
      }));
      const result = await parsePrompt("Build a work order API", "test-api-key");
      expect(result.features)
.toHaveLength(0);
    });

    it("returns empty array when response schema is wrong", async () => {
      mockCreate.mockImplementationOnce(async () => ({
        content: [{ type: "text", text: '{"wrong": "schema"}' }],
      }));
      const result = await parsePrompt("Build a work order API", "test-api-key");
      expect(result.features)
.toHaveLength(0);
    });

    it("handles JSON wrapped in markdown code block", async () => {
      mockCreate.mockImplementationOnce(async () => ({
        content: [
          {
            type: "text",
            text: "```json\n" + JSON.stringify({
              features: [
                {
                  entityName: "Product",
                  fields: [{ name: "name", type: "string", required: true }],
                },
              ],
            }) + "\n```",
          },
        ],
      }));
      const result = await parsePrompt("Build a product API", "test-api-key");
      expect(result.features)
.toHaveLength(1);
      expect(result.features[0].entityName)
.toBe("Product");
    });

    it("returns token usage from Claude API response", async () => {
      const result = await parsePrompt("Build a work order API", "test-api-key");
      expect(result.tokenUsage.promptTokens)
.toBe(150);
      expect(result.tokenUsage.completionTokens)
.toBe(320);
      expect(result.tokenUsage.totalTokens)
.toBe(470);
    });

    it("returns zero tokens when API call fails", async () => {
      mockCreate.mockImplementationOnce(async () => {
        throw new Error("Network error");
      });
      const result = await parsePrompt("Build a work order API", "test-api-key");
      expect(result.tokenUsage.totalTokens)
.toBe(0);
    });
  });
});
