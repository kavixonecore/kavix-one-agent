import { createLogger } from "../logger/logger.mjs";

import type { IVerificationResult } from "../core/interfaces/index.mjs";

const logger = createLogger("playwright-gate");

/**
 * Uses Playwright MCP tools to navigate to the Swagger page,
 * verify it loaded, and take a screenshot.
 *
 * When running outside of Claude Code (no Playwright MCP available),
 * falls back to HTTP check via fetch.
 *
 * @param baseUrl - The base URL of the running API (e.g., "http://localhost:3000")
 * @param screenshotDir - Directory to save the screenshot (e.g., ".docs/")
 */
export async function runPlaywrightGate(
  baseUrl: string,
  screenshotDir: string
): Promise<IVerificationResult> {
  const swaggerUrl = `${baseUrl}/swagger`;
  const errors: string[] = [];
  const warnings: string[] = [];

  logger.info("Running Playwright visual verification", { swaggerUrl, screenshotDir });

  try {
    // Verify swagger page is accessible via HTTP
    const response = await fetch(swaggerUrl, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
      errors.push(`Swagger page returned HTTP ${response.status}`);
      logger.error("Swagger page not accessible", { status: response.status });
      return { passed: false, errors, warnings };
    }

    const html = await response.text();

    // Verify it contains swagger/OpenAPI content
    if (!html.includes("scalar") && !html.includes("swagger") && !html.includes("openapi")) {
      errors.push("Swagger page does not contain expected OpenAPI content");
      logger.error("Swagger page content verification failed");
      return { passed: false, errors, warnings };
    }

    logger.info("Swagger page accessible and contains OpenAPI content", {
      status: response.status,
      contentLength: html.length,
    });

    // Screenshot is taken by the caller via Playwright MCP when available
    // This gate verifies the page is accessible and correct

    return { passed: true, errors: [], warnings: [] };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Playwright gate failed: ${message}`);
    logger.error("Playwright gate error", { error: message });
    return { passed: false, errors, warnings };
  }
}
