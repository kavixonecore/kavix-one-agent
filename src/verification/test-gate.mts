import { createLogger } from "../logger/logger.mjs";

import type { IVerificationResult } from "../core/interfaces/index.mjs";

const logger = createLogger("test-gate");

interface ITestCounts {
  total: number;
  passed: number;
  failed: number;
}

/**
 * Parses bun test output to extract pass/fail counts.
 * @param output - Combined stdout/stderr from bun test.
 */
function parseTestOutput(output: string): ITestCounts {
  // bun test summary line looks like: "42 pass, 3 fail" or "42 pass"
  const passMatch = output.match(/(\d+)\s+pass/);
  const failMatch = output.match(/(\d+)\s+fail/);
  const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
  const failed = failMatch ? parseInt(failMatch[1], 10) : 0;
  return {
    total: passed + failed,
    passed,
    failed,
  };
}

/**
 * Runs `bun test` in the given project directory and parses results.
 * @param projectDir - Absolute path to the generated project directory.
 */
export async function runTestGate(
  projectDir: string
): Promise<IVerificationResult & { details: ITestCounts }> {
  const startMs = Date.now();
  logger.info("Running test gate", { projectDir });

  const proc = Bun.spawn(["bun", "test"], {
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await proc.exited;

  const stdoutText = await new Response(proc.stdout)
.text();
  const stderrText = await new Response(proc.stderr)
.text();
  const combinedOutput = [stdoutText, stderrText].filter(Boolean)
.join("\n");

  const details = parseTestOutput(combinedOutput);
  const errors: string[] = [];

  if (exitCode !== 0 || details.failed > 0) {
    // Extract failing test lines
    for (const line of combinedOutput.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("✗") || trimmed.includes("FAIL") || trimmed.includes("error:")) {
        errors.push(trimmed);
      }
    }
    if (errors.length === 0 && exitCode !== 0) {
      errors.push(`bun test exited with code ${exitCode}`);
    }
  }

  const passed = exitCode === 0 && details.failed === 0;
  const durationMs = Date.now() - startMs;

  logger.info("Test gate complete", { passed, details, durationMs });

  return {
    passed,
    gate: "test",
    errors,
    warnings: [],
    durationMs,
    output: combinedOutput,
    details,
  };
}
