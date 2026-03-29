import { describe, it, expect, mock, beforeEach } from "bun:test";

const SAMPLE_PRD = `# PRD: Work Order API

## Overview
A work order management system.

## Features

- [ ] WorkOrder
- [ ] Technician

### Feature: WorkOrder
> Represents a work order.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | yes | Title |
| status | string | yes | Status |`;

const PRD_RESPONSE = `I have gathered enough information. Here is your PRD:

---BEGIN PRD---
${SAMPLE_PRD}
---END PRD---

Let me know if you need any changes.`;

const QUESTION_RESPONSE = `What kind of API are you building? What entities does it manage?`;

// Track call count for multi-turn simulation
let callCount = 0;

const mockCreate = mock(async (_params: unknown) => {
  callCount++;
  // First call returns a question, second call returns the PRD
  const text = callCount === 1 ? QUESTION_RESPONSE : PRD_RESPONSE;
  return {
    content: [{ type: "text", text }],
  };
});

mock.module("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    public messages = { create: mockCreate };

    public constructor(_opts: unknown) {}
  },
}));

const { interviewForPrd } = await import("../../src/input/prd-interviewer.mjs");

beforeEach(() => {
  mockCreate.mockClear();
  callCount = 0;
});

describe("prd-interviewer", () => {
  describe("interviewForPrd", () => {
    it("calls askQuestion at least once", async () => {
      const mockAsk = mock(async (_q: string) => "I want a work order management API");
      await interviewForPrd(mockAsk, "test-api-key");
      expect(mockAsk)
.toHaveBeenCalled();
    });

    it("passes the assistant question to askQuestion", async () => {
      const questions: string[] = [];
      const mockAsk = mock(async (q: string) => {
        questions.push(q);
        return "I want a work order management API";
      });
      await interviewForPrd(mockAsk, "test-api-key");
      expect(questions.length)
.toBeGreaterThan(0);
      expect(typeof questions[0])
.toBe("string");
    });

    it("returns PRD content extracted between markers", async () => {
      const mockAsk = mock(async (_q: string) => "I want a work order management API");
      const prd = await interviewForPrd(mockAsk, "test-api-key");
      expect(prd)
.toContain("# PRD: Work Order API");
    });

    it("does not include the ---BEGIN PRD--- marker in output", async () => {
      const mockAsk = mock(async (_q: string) => "I want a work order management API");
      const prd = await interviewForPrd(mockAsk, "test-api-key");
      expect(prd).not.toContain("---BEGIN PRD---");
    });

    it("does not include the ---END PRD--- marker in output", async () => {
      const mockAsk = mock(async (_q: string) => "I want a work order management API");
      const prd = await interviewForPrd(mockAsk, "test-api-key");
      expect(prd).not.toContain("---END PRD---");
    });

    it("returns PRD when Claude generates it immediately on first call", async () => {
      // Simulate Claude returning PRD immediately
      mockCreate.mockImplementationOnce(async () => ({
        content: [{ type: "text", text: PRD_RESPONSE }],
      }));
      const mockAsk = mock(async (_q: string) => "anything");
      const prd = await interviewForPrd(mockAsk, "test-api-key");
      expect(prd)
.toContain("# PRD:");
    });

    it("contains feature checkboxes in output", async () => {
      const mockAsk = mock(async (_q: string) => "I want a work order management API");
      const prd = await interviewForPrd(mockAsk, "test-api-key");
      expect(prd)
.toContain("- [ ] WorkOrder");
    });
  });
});
