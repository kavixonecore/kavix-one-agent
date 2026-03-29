import { join } from "path";

import { describe, it, expect, mock } from "bun:test";

import { GenerationEngine, type ReviewResponse } from "../../src/generation/engine.mjs";
import { createLogger } from "../../src/logger/logger.mjs";

import type { IGenerationPlan, IRenderedFile } from "../../src/core/interfaces/index.mjs";

const logger = createLogger("engine-review-test", "error");

// A minimal generation plan with two features
const plan: IGenerationPlan = {
  projectName: "test-project",
  projectDescription: "Test project",
  features: [
    {
      name: "user",
      entityName: "User",
      pluralName: "users",
      collectionName: "user",
      fields: [{ name: "name", type: "string", required: true }],
      enums: [],
      indexes: [],
    },
    {
      name: "product",
      entityName: "Product",
      pluralName: "products",
      collectionName: "product",
      fields: [{ name: "name", type: "string", required: true }],
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

const outputDir = join(import.meta.dir, "__tmp_output");

describe("GenerationEngine — review checkpoint", () => {
  it("auto-approves all features when no callback provided", async () => {
    const engine = new GenerationEngine(logger);
    const result = await engine.generate(plan, outputDir, true);
    // dryRun=true so no files written, but no errors
    expect(result.featureResults)
.toHaveLength(2);
    expect(result.featureResults.every((r) => r.errors.length === 0))
.toBe(true);
  });

  it("calls onReviewCheckpoint for each feature", async () => {
    const engine = new GenerationEngine(logger);
    const checkpoints: string[] = [];

    const onReview = mock(
      async (featureName: string, _files: IRenderedFile[]): Promise<ReviewResponse> => {
        checkpoints.push(featureName);
        return "approve";
      }
    );

    await engine.generate(plan, outputDir, true, onReview);
    expect(checkpoints)
.toHaveLength(2);
    expect(checkpoints)
.toContain("user");
    expect(checkpoints)
.toContain("product");
  });

  it("passes rendered files to the checkpoint callback", async () => {
    const engine = new GenerationEngine(logger);
    let capturedFiles: IRenderedFile[] = [];

    const onReview = mock(
      async (_name: string, files: IRenderedFile[]): Promise<ReviewResponse> => {
        capturedFiles = files;
        return "approve";
      }
    );

    await engine.generate(plan, outputDir, true, onReview);
    expect(capturedFiles.length)
.toBeGreaterThan(0);
    expect(capturedFiles[0])
.toHaveProperty("path");
    expect(capturedFiles[0])
.toHaveProperty("content");
  });

  it("skips a feature when checkpoint returns skip", async () => {
    const engine = new GenerationEngine(logger);

    const onReview = mock(
      async (featureName: string, _files: IRenderedFile[]): Promise<ReviewResponse> => {
        return featureName === "user" ? "skip" : "approve";
      }
    );

    const result = await engine.generate(plan, outputDir, true, onReview);
    const userResult = result.featureResults.find((r) => r.featureName === "user");
    expect(userResult?.filesWritten)
.toHaveLength(0);
  });

  it("re-renders a feature when checkpoint returns reject, then stops after max attempts", async () => {
    const engine = new GenerationEngine(logger);
    let callCount = 0;

    const onReview = mock(
      async (featureName: string, _files: IRenderedFile[]): Promise<ReviewResponse> => {
        if (featureName === "user") {
          callCount++;
          return "reject";
        }
        return "approve";
      }
    );

    const result = await engine.generate(plan, outputDir, true, onReview);
    // Should have tried 3 times (MAX_REGEN_ATTEMPTS)
    expect(callCount)
.toBe(3);

    const userResult = result.featureResults.find((r) => r.featureName === "user");
    expect(userResult?.errors.length)
.toBeGreaterThan(0);
    expect(userResult?.errors[0])
.toContain("rejected");
  });

  it("continues to next feature after a skip", async () => {
    const engine = new GenerationEngine(logger);
    const approved: string[] = [];

    const onReview = mock(
      async (featureName: string, _files: IRenderedFile[]): Promise<ReviewResponse> => {
        if (featureName === "user") {
          return "skip";
        }
        approved.push(featureName);
        return "approve";
      }
    );

    await engine.generate(plan, outputDir, true, onReview);
    expect(approved)
.toContain("product");
  });
});
