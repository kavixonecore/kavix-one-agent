import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the Zod-validated env config singleton for a generated project.
 */
export function renderEnvConfig(_context: IGenerationContext): string {
  return `import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  API_PORT: z.string().default("3500"),
  MONGO_HOSTNAME: z.string()
    .min(1, "MONGO_HOSTNAME is required"),
  MONGO_USERNAME: z.string()
    .min(1, "MONGO_USERNAME is required"),
  MONGO_PASSWORD: z.string()
    .min(1, "MONGO_PASSWORD is required"),
  MONGO_CLUSTER_NAME: z.string()
    .min(1, "MONGO_CLUSTER_NAME is required"),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(Bun.env);
`;
}
