import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the database configuration factory using @sylvesterllc/mongo.
 */
export function renderDatabaseConfig(_context: IGenerationContext): string {
  return `import { MongoDatabase } from "@sylvesterllc/mongo";
import type { IDatabase } from "@sylvesterllc/mongo";
import type { MongoClient } from "mongodb";
import type winston from "winston";

import { env } from "../env.mjs";

/**
 * Creates a configured MongoDB IDatabase instance.
 * Uses env vars for connection string construction.
 */
export function createDatabaseConfiguration(
  logger: winston.Logger
): IDatabase<MongoClient> {
  const connectionString =
    \`mongodb+srv://\${env.MONGO_USERNAME}:\${env.MONGO_PASSWORD}\` +
    \`@\${env.MONGO_HOSTNAME}/?retryWrites=true&w=majority\` +
    \`&appName=\${env.MONGO_CLUSTER_NAME}\`;

  return new MongoDatabase(connectionString, logger);
}
`;
}
