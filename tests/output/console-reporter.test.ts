import { describe, it, expect } from "bun:test";

// Import the reporter functions directly without mocking the logger
// These functions log via Winston; we verify they complete without error
// and that the reporter module exports the expected functions.
const {
  reportPlan,
  reportFeatureStart,
  reportFeatureComplete,
  reportFeatureFailed,
  reportVerificationResult,
  reportSummary,
  reportStatus,
} = await import("../../src/output/console-reporter.mjs");

import type { IGenerationPlan, IVerificationResult } from "../../src/core/interfaces/index.mjs";
import type { IFeaturesState } from "../../src/state/interfaces/index.mjs";

const mockPlan: IGenerationPlan = {
  projectName: "test-project",
  projectDescription: "A test project",
  features: [
    {
      name: "user",
      entityName: "User",
      pluralName: "users",
      collectionName: "user",
      fields: [{ name: "email", type: "string", required: true }],
      enums: [],
      indexes: [],
    },
  ],
  status: "pending",
  createdAt: new Date()
.toISOString(),
  updatedAt: new Date()
.toISOString(),
};

const mockState: IFeaturesState = {
  projectName: "test-project",
  createdAt: new Date()
.toISOString(),
  updatedAt: new Date()
.toISOString(),
  features: [
    {
      name: "user",
      status: "complete",
      startedAt: new Date()
.toISOString(),
      completedAt: new Date()
.toISOString(),
    },
    { name: "product", status: "failed", error: "Lint failed" },
    { name: "order", status: "pending" },
  ],
};

describe("console-reporter", () => {
  describe("reportPlan", () => {
    it("executes without throwing", () => {
      expect(() => reportPlan(mockPlan)).not.toThrow();
    });

    it("handles plan with addons without throwing", () => {
      expect(() => reportPlan({ ...mockPlan, addons: ["azure-terraform"] })).not.toThrow();
    });

    it("handles plan with no features without throwing", () => {
      expect(() => reportPlan({ ...mockPlan, features: [] })).not.toThrow();
    });
  });

  describe("reportFeatureStart", () => {
    it("executes without throwing", () => {
      expect(() => reportFeatureStart("user")).not.toThrow();
    });
  });

  describe("reportFeatureComplete", () => {
    it("executes without throwing with multiple files", () => {
      expect(() =>
        reportFeatureComplete("user", ["src/user.mts", "src/user.service.mts"])
      ).not.toThrow();
    });

    it("executes without throwing with empty file list", () => {
      expect(() => reportFeatureComplete("user", [])).not.toThrow();
    });
  });

  describe("reportFeatureFailed", () => {
    it("executes without throwing", () => {
      expect(() =>
        reportFeatureFailed("user", ["Lint error at line 5"])
      ).not.toThrow();
    });
  });

  describe("reportVerificationResult", () => {
    it("executes without throwing on pass", () => {
      const result: IVerificationResult = {
        passed: true,
        gate: "lint",
        errors: [],
        warnings: [],
        durationMs: 120,
      };
      expect(() => reportVerificationResult(result)).not.toThrow();
    });

    it("executes without throwing on fail with errors", () => {
      const result: IVerificationResult = {
        passed: false,
        gate: "lint",
        errors: ["ESLint error: unexpected any"],
        warnings: ["deprecated API usage"],
        durationMs: 50,
      };
      expect(() => reportVerificationResult(result)).not.toThrow();
    });
  });

  describe("reportSummary", () => {
    it("executes without throwing", () => {
      expect(() => reportSummary("# Session Summary\n\nAll good.")).not.toThrow();
    });
  });

  describe("reportStatus", () => {
    it("executes without throwing with mixed feature statuses", () => {
      expect(() => reportStatus(mockState)).not.toThrow();
    });

    it("executes without throwing with empty feature list", () => {
      expect(() =>
        reportStatus({ ...mockState, features: [] })
      ).not.toThrow();
    });
  });
});
