import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders .env.example listing all required environment variables.
 */
export function renderEnvExample(context: IGenerationContext): string {
  const { projectName } = context;

  return `# ${projectName} API — Environment Variables
# Copy this file to .env and fill in the values

# Application
NODE_ENV=development
API_PORT=3500

# MongoDB
MONGO_HOSTNAME=your-cluster.mongodb.net
MONGO_USERNAME=your-username
MONGO_PASSWORD=your-password
MONGO_CLUSTER_NAME=your-cluster-name
`;
}
