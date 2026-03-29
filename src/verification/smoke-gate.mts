import { createLogger } from "../logger/logger.mjs";

import type { IVerificationResult } from "../core/interfaces/index.mjs";

const logger = createLogger("smoke-gate");

const DOCKER_COMPOSE_UP_TIMEOUT_MS = 30_000;
const SERVER_START_TIMEOUT_MS = 15_000;
const SERVER_PORT = 3000;

/**
 * Waits for the server to be reachable, polling every 500ms.
 * @param port - Port the server is expected to be listening on.
 * @param timeoutMs - How long to wait before giving up.
 */
async function waitForServer(port: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://localhost:${port}/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        return true;
      }
    } catch {
      // not ready yet
    }
    await Bun.sleep(500);
  }
  return false;
}

/**
 * Starts docker-compose in the project directory and waits for it to be ready.
 * @param projectDir - Absolute path to the generated project directory.
 */
async function startDockerCompose(projectDir: string): Promise<void> {
  const proc = Bun.spawn(["docker-compose", "up", "-d"], {
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await Promise.race([
    proc.exited,
    Bun.sleep(DOCKER_COMPOSE_UP_TIMEOUT_MS)
.then(() => -1),
  ]);
  if (exitCode !== 0) {
    throw new Error(`docker-compose up failed with exit code ${exitCode}`);
  }
}

/**
 * Stops docker-compose in the project directory.
 * @param projectDir - Absolute path to the generated project directory.
 */
async function stopDockerCompose(projectDir: string): Promise<void> {
  const proc = Bun.spawn(["docker-compose", "down"], {
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
  });
  await proc.exited;
}

/**
 * Runs smoke tests against a generated Elysia server.
 * Starts docker-compose, starts the server, hits endpoints, shuts everything down.
 * @param projectDir - Absolute path to the generated project directory.
 * @param endpoints - List of endpoint paths to test (e.g. ["/health", "/api/users"]).
 */
export async function runSmokeGate(
  projectDir: string,
  endpoints: string[]
): Promise<IVerificationResult> {
  const startMs = Date.now();
  logger.info("Running smoke gate", { projectDir, endpoints });

  const errors: string[] = [];
  let serverProc: ReturnType<typeof Bun.spawn> | null = null;

  try {
    // Start infrastructure
    await startDockerCompose(projectDir);
    logger.info("docker-compose started");

    // Start the server
    serverProc = Bun.spawn(["bun", "run", "src/index.mts"], {
      cwd: projectDir,
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, PORT: String(SERVER_PORT) },
    });

    // Wait for server to be ready
    const ready = await waitForServer(SERVER_PORT, SERVER_START_TIMEOUT_MS);
    if (!ready) {
      errors.push(`Server did not start on port ${SERVER_PORT} within ${SERVER_START_TIMEOUT_MS}ms`);
    } else {
      // Hit each endpoint
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`http://localhost:${SERVER_PORT}${endpoint}`, {
            signal: AbortSignal.timeout(5000),
          });
          if (!response.ok) {
            errors.push(`${endpoint} returned HTTP ${response.status}`);
          } else {
            logger.debug("Smoke endpoint OK", { endpoint, status: response.status });
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(`${endpoint} fetch failed: ${message}`);
        }
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Smoke gate setup failed: ${message}`);
  } finally {
    // Always clean up
    if (serverProc) {
      serverProc.kill();
    }
    try {
      await stopDockerCompose(projectDir);
      logger.info("docker-compose stopped");
    } catch (cleanupErr: unknown) {
      const message = cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr);
      logger.warn("Failed to stop docker-compose during cleanup", { error: message });
    }
  }

  const passed = errors.length === 0;
  const durationMs = Date.now() - startMs;

  logger.info("Smoke gate complete", { passed, errors: errors.length, durationMs });

  return {
    passed,
    gate: "smoke",
    errors,
    warnings: [],
    durationMs,
  };
}
