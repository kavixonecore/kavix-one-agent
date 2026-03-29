import { describe, it, expect } from "bun:test";

// Test the status command integration by verifying the IFeaturesState shape
// that the status command would display. We do NOT mock features-store or
// console-reporter here to avoid contaminating those module's own tests.

import type { IFeaturesState } from "../../src/state/interfaces/index.mjs";

describe("status command integration — state shape", () => {
  it("IFeaturesState has the expected structure for status display", () => {
    const state: IFeaturesState = {
      projectName: "my-project",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T01:00:00.000Z",
      features: [
        {
          name: "user",
          status: "complete",
          startedAt: "2026-01-01T00:00:00.000Z",
          completedAt: "2026-01-01T00:05:00.000Z",
        },
        { name: "product", status: "failed", error: "Type error" },
        { name: "order", status: "pending" },
      ],
    };

    expect(state.projectName)
.toBe("my-project");
    expect(state.features)
.toHaveLength(3);
    expect(state.features[0].status)
.toBe("complete");
    expect(state.features[1].status)
.toBe("failed");
    expect(state.features[1].error)
.toBe("Type error");
    expect(state.features[2].status)
.toBe("pending");
  });

  it("counts features by status correctly", () => {
    const state: IFeaturesState = {
      projectName: "test",
      createdAt: new Date()
.toISOString(),
      updatedAt: new Date()
.toISOString(),
      features: [
        { name: "a", status: "complete" },
        { name: "b", status: "failed" },
        { name: "c", status: "pending" },
        { name: "d", status: "in-progress" },
        { name: "e", status: "complete" },
      ],
    };

    const completed = state.features.filter((f) => f.status === "complete").length;
    const failed = state.features.filter((f) => f.status === "failed").length;
    const pending = state.features.filter(
      (f) => f.status === "pending" || f.status === "in-progress"
    ).length;

    expect(completed)
.toBe(2);
    expect(failed)
.toBe(1);
    expect(pending)
.toBe(2);
  });

  it("features with error messages have error property", () => {
    const state: IFeaturesState = {
      projectName: "test",
      createdAt: new Date()
.toISOString(),
      updatedAt: new Date()
.toISOString(),
      features: [
        { name: "broken", status: "failed", error: "ESLint failed: no-explicit-any" },
      ],
    };

    const failedFeature = state.features.find((f) => f.name === "broken");
    expect(failedFeature?.error)
.toBe("ESLint failed: no-explicit-any");
  });
});
