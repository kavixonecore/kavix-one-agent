import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the Winston logger factory for a generated project.
 */
export function renderLogger(_context: IGenerationContext): string {
  return `import winston from "winston";

/**
 * Creates a configured Winston logger instance.
 */
export function createLogger(
  serviceName: string,
  level = "info"
): winston.Logger {
  return winston.createLogger({
    level,
    defaultMeta: { service: serviceName },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [new winston.transports.Console()],
  });
}
`;
}
