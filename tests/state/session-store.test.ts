import { describe, it, expect } from "bun:test";

import { generateHandoff } from "../../src/state/session-store.mjs";

import type { IFeaturesState } from "../../src/state/interfaces/index.mjs";

const mixedState: IFeaturesState = {
  projectName: "my-api",
  features: [
    { name: "user", status: "complete", startedAt: "2026-01-01T00:00:00Z", completedAt: "2026-01-01T01:00:00Z" },
    { name: "product", status: "in-progress", startedAt: "2026-01-01T01:00:00Z" },
    { name: "order", status: "pending" },
    { name: "payment", status: "failed", error: "ESLint errors" },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T02:00:00.000Z",
};

const allCompleteState: IFeaturesState = {
  projectName: "done-project",
  features: [
    { name: "user", status: "complete" },
    { name: "product", status: "complete" },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T01:00:00.000Z",
};

describe("session-store", () => {
  describe("generateHandoff", () => {
    it("includes the project name in the heading", () => {
      const doc = generateHandoff(mixedState, []);
      expect(doc)
.toContain("my-api");
    });

    it("lists completed features with checkboxes", () => {
      const doc = generateHandoff(mixedState, []);
      expect(doc)
.toContain("- [x] user");
    });

    it("lists pending/in-progress features", () => {
      const doc = generateHandoff(mixedState, []);
      expect(doc)
.toContain("- [ ] product");
      expect(doc)
.toContain("- [ ] order");
    });

    it("lists failed features with error details", () => {
      const doc = generateHandoff(mixedState, []);
      expect(doc)
.toContain("payment");
      expect(doc)
.toContain("ESLint errors");
    });

    it("includes provided errors in the Errors section", () => {
      const doc = generateHandoff(mixedState, ["Test runner crashed", "Lint gate failed"]);
      expect(doc)
.toContain("Test runner crashed");
      expect(doc)
.toContain("Lint gate failed");
    });

    it("shows no-errors message when errors array is empty", () => {
      const doc = generateHandoff(mixedState, []);
      expect(doc)
.toContain("_No errors recorded._");
    });

    it("includes correct summary counts", () => {
      const doc = generateHandoff(mixedState, []);
      expect(doc)
.toContain("Complete | 1");
      expect(doc)
.toContain("Failed | 1");
      expect(doc)
.toContain("Total | 4");
    });

    it("includes next steps for pending features", () => {
      const doc = generateHandoff(mixedState, []);
      expect(doc)
.toContain("Next Steps");
      expect(doc)
.toContain("product");
    });

    it("shows all-complete message when no pending features remain", () => {
      const doc = generateHandoff(allCompleteState, []);
      expect(doc)
.toContain("All features are complete");
    });

    it("returns a non-empty string", () => {
      const doc = generateHandoff(mixedState, []);
      expect(doc.length)
.toBeGreaterThan(0);
    });
  });
});
