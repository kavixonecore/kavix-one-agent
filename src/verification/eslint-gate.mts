import { createLogger } from "../logger/logger.mjs";

import type { IVerificationResult } from "../core/interfaces/index.mjs";

const logger = createLogger("eslint-gate");

/**
 * Runs eslint --fix on the project directory, then checks for remaining errors.
 * @param projectDir - Absolute path to the generated project directory.
 */
export async function runEslintGate(projectDir: string): Promise<IVerificationResult> {
  const startMs = Date.now();
  logger.info("Running eslint gate", { projectDir });

  // Step 1: run eslint --fix
  const fixResult = Bun.spawn(["npx", "eslint", ".", "--fix", "--no-error-on-unmatched-pattern"], {
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
  });
  await fixResult.exited;

  // Step 2: run eslint check (no fix)
  const checkProc = Bun.spawn(["npx", "eslint", ".", "--format", "compact", "--no-error-on-unmatched-pattern"], {
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await checkProc.exited;

  const stdoutText = await new Response(checkProc.stdout)
.text();
  const stderrText = await new Response(checkProc.stderr)
.text();
  const combinedOutput = [stdoutText, stderrText].filter(Boolean)
.join("\n");

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const line of combinedOutput.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    // ESLint compact format: "<file>: line N, col N, error - <message>"
    // ESLint stylish format: "<N>:<N>  error  <message>"
    const isError =
      trimmed.includes(", error -") ||
      trimmed.includes(", error ") ||
      /\d+:\d+\s+error\s+/.test(trimmed);
    const isWarning =
      trimmed.includes(", warning -") ||
      trimmed.includes(", warning ") ||
      /\d+:\d+\s+warning\s+/.test(trimmed);

    if (isError) {
      errors.push(trimmed);
    } else if (isWarning) {
      warnings.push(trimmed);
    }
  }

  const passed = exitCode === 0 && errors.length === 0;
  const durationMs = Date.now() - startMs;

  logger.info("Eslint gate complete", { passed, errors: errors.length, warnings: warnings.length, durationMs });

  return {
    passed,
    gate: "eslint",
    errors,
    warnings,
    durationMs,
    output: combinedOutput,
  };
}
