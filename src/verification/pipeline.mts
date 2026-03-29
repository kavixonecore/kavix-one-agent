import { createLogger } from "../logger/logger.mjs";
import { runEslintGate } from "./eslint-gate.mjs";
import { runTestGate } from "./test-gate.mjs";
import { runSmokeGate } from "./smoke-gate.mjs";

import type { IVerificationResult } from "../core/interfaces/index.mjs";
import type { IVerificationOptions } from "./interfaces/index.mjs";

const logger = createLogger("verification-pipeline");

type EslintGateFn = (dir: string) => Promise<IVerificationResult>;
type TestGateFn = (dir: string) => Promise<IVerificationResult>;
type SmokeGateFn = (dir: string, endpoints: string[]) => Promise<IVerificationResult>;

/**
 * Injectable gate functions for testing.
 * When omitted, the real gate implementations are used.
 */
export interface IVerificationGates {
  eslint?: EslintGateFn;
  test?: TestGateFn;
  smoke?: SmokeGateFn;
}

/**
 * Merges multiple IVerificationResult objects into a single combined result.
 * @param gate - The name to assign the combined gate.
 * @param results - Results to merge.
 */
function mergeResults(gate: string, results: IVerificationResult[]): IVerificationResult {
  const allErrors = results.flatMap((r) => r.errors);
  const allWarnings = results.flatMap((r) => r.warnings);
  const durationMs = results.reduce((sum, r) => sum + r.durationMs, 0);
  const passed = results.every((r) => r.passed);
  return {
    passed,
    gate,
    errors: allErrors,
    warnings: allWarnings,
    durationMs,
  };
}

/**
 * Runs the full verification pipeline: eslint → test → smoke.
 * Retries up to options.maxRetries on failure.
 * @param projectDir - Absolute path to the generated project directory.
 * @param options - Pipeline configuration.
 * @param gates - Optional injectable gate functions (for testing).
 */
export async function runVerificationPipeline(
  projectDir: string,
  options: IVerificationOptions,
  gates: IVerificationGates = {}
): Promise<IVerificationResult> {
  const { maxRetries, skipSmoke = false, endpoints = ["/healthz"] } = options;
  const eslintFn: EslintGateFn = gates.eslint ?? runEslintGate;
  const testFn: TestGateFn = gates.test ?? runTestGate;
  const smokeFn: SmokeGateFn = gates.smoke ?? runSmokeGate;

  let attempt = 0;
  let lastFailureResult: IVerificationResult | null = null;

  while (attempt <= maxRetries) {
    if (attempt > 0) {
      logger.warn("Retrying verification pipeline", { attempt, maxRetries });
    }

    logger.info("Running verification pipeline", { projectDir, attempt });

    const gateResults: IVerificationResult[] = [];

    // Gate 1: ESLint
    const eslintResult = await eslintFn(projectDir);
    gateResults.push(eslintResult);

    if (!eslintResult.passed) {
      logger.warn("ESLint gate failed", { errors: eslintResult.errors.length });
      lastFailureResult = mergeResults("pipeline", gateResults);
      attempt++;
      continue;
    }

    // Gate 2: Tests
    const testResult = await testFn(projectDir);
    gateResults.push(testResult);

    if (!testResult.passed) {
      logger.warn("Test gate failed", { errors: testResult.errors.length });
      lastFailureResult = mergeResults("pipeline", gateResults);
      attempt++;
      continue;
    }

    // Gate 3: Smoke (optional)
    if (!skipSmoke) {
      const smokeResult = await smokeFn(projectDir, endpoints);
      gateResults.push(smokeResult);

      if (!smokeResult.passed) {
        logger.warn("Smoke gate failed", { errors: smokeResult.errors.length });
        lastFailureResult = mergeResults("pipeline", gateResults);
        attempt++;
        continue;
      }
    }

    // All gates passed
    const merged = mergeResults("pipeline", gateResults);
    logger.info("Verification pipeline passed", { attempt, durationMs: merged.durationMs });
    return merged;
  }

  // All retries exhausted — return the last tracked failure
  logger.error("Verification pipeline failed after all retries", { maxRetries });

  if (lastFailureResult) {
    return { ...lastFailureResult, passed: false };
  }

  return {
    passed: false,
    gate: "pipeline",
    errors: [`Verification pipeline failed after ${maxRetries} retries`],
    warnings: [],
    durationMs: 0,
  };
}
