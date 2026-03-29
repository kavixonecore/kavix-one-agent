import winston from "winston";

/**
 * Creates a silent Winston logger suitable for unit tests.
 * No output to stdout/stderr — prevents test noise.
 */
export function createTestLogger(): winston.Logger {
  return winston.createLogger({
    level: "error",
    silent: true,
    transports: [],
  });
}
