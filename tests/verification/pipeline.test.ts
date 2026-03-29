import { describe, it, expect } from "bun:test";

import { runVerificationPipeline, type IVerificationGates } from "../../src/verification/pipeline.mjs";

import type { IVerificationResult } from "../../src/core/interfaces/index.mjs";

function passingEslint(): Promise<IVerificationResult> {
  return Promise.resolve({ passed: true, gate: "eslint", errors: [], warnings: [], durationMs: 10 });
}

function failingEslint(): Promise<IVerificationResult> {
  return Promise.resolve({
    passed: false,
    gate: "eslint",
    errors: ["Lint error"],
    warnings: [],
    durationMs: 5,
  });
}

function passingTest(): Promise<IVerificationResult> {
  return Promise.resolve({ passed: true, gate: "test", errors: [], warnings: [], durationMs: 20 });
}

function failingTest(): Promise<IVerificationResult> {
  return Promise.resolve({ passed: false, gate: "test", errors: ["Test failed"], warnings: [], durationMs: 15 });
}

function passingSmoke(_dir: string, _endpoints: string[]): Promise<IVerificationResult> {
  return Promise.resolve({ passed: true, gate: "smoke", errors: [], warnings: [], durationMs: 30 });
}

function failingSmoke(_dir: string, _endpoints: string[]): Promise<IVerificationResult> {
  return Promise.resolve({ passed: false, gate: "smoke", errors: ["Smoke failed"], warnings: [], durationMs: 10 });
}

const ALL_PASSING_GATES: IVerificationGates = {
  eslint: passingEslint,
  test: passingTest,
  smoke: passingSmoke,
};

describe("runVerificationPipeline", () => {
  it("returns passed=true when all gates pass (smoke skipped)", async () => {
    const result = await runVerificationPipeline(
      "/fake/project",
      { maxRetries: 0, skipSmoke: true },
      { eslint: passingEslint, test: passingTest }
    );

    expect(result.passed)
.toBe(true);
    expect(result.gate)
.toBe("pipeline");
  });

  it("returns passed=false when eslint gate fails", async () => {
    const result = await runVerificationPipeline(
      "/fake/project",
      { maxRetries: 0, skipSmoke: true },
      { eslint: failingEslint, test: passingTest }
    );

    expect(result.passed)
.toBe(false);
    expect(result.errors)
.toContain("Lint error");
  });

  it("returns passed=false when test gate fails", async () => {
    const result = await runVerificationPipeline(
      "/fake/project",
      { maxRetries: 0, skipSmoke: true },
      { eslint: passingEslint, test: failingTest }
    );

    expect(result.passed)
.toBe(false);
    expect(result.errors)
.toContain("Test failed");
  });

  it("retries and passes on second attempt", async () => {
    let callCount = 0;
    const flakyEslint = (): Promise<IVerificationResult> => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ passed: false, gate: "eslint", errors: ["First try error"], warnings: [], durationMs: 5 });
      }
      return Promise.resolve({ passed: true, gate: "eslint", errors: [], warnings: [], durationMs: 5 });
    };

    const result = await runVerificationPipeline(
      "/fake/project",
      { maxRetries: 2, skipSmoke: true },
      { eslint: flakyEslint, test: passingTest }
    );

    expect(result.passed)
.toBe(true);
    expect(callCount)
.toBeGreaterThan(1);
  });

  it("respects skipSmoke=false and runs smoke gate", async () => {
    const result = await runVerificationPipeline(
      "/fake/project",
      { maxRetries: 0, skipSmoke: false, endpoints: ["/healthz"] },
      ALL_PASSING_GATES
    );

    expect(result.passed)
.toBe(true);
  });

  it("returns passed=false when smoke gate fails", async () => {
    const result = await runVerificationPipeline(
      "/fake/project",
      { maxRetries: 0, skipSmoke: false, endpoints: ["/healthz"] },
      { eslint: passingEslint, test: passingTest, smoke: failingSmoke }
    );

    expect(result.passed)
.toBe(false);
    expect(result.errors)
.toContain("Smoke failed");
  });

  it("returns pipeline as gate name", async () => {
    const result = await runVerificationPipeline(
      "/fake/project",
      { maxRetries: 0, skipSmoke: true },
      { eslint: passingEslint, test: passingTest }
    );

    expect(result.gate)
.toBe("pipeline");
  });

  it("exhausts all retries and returns final failure state", async () => {
    const alwaysFailingEslint = (): Promise<IVerificationResult> =>
      Promise.resolve({ passed: false, gate: "eslint", errors: ["Persistent error"], warnings: [], durationMs: 1 });

    const result = await runVerificationPipeline(
      "/fake/project",
      { maxRetries: 2, skipSmoke: true },
      { eslint: alwaysFailingEslint, test: passingTest }
    );

    expect(result.passed)
.toBe(false);
  });
});
