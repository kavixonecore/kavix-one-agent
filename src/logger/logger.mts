import winston from "winston";

/**
 * Creates a configured Winston logger instance.
 * @param serviceName - Identifies this logger in structured log output.
 * @param level - Override the log level (defaults to "info").
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
