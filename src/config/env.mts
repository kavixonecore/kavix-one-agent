import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string()
.min(1, "ANTHROPIC_API_KEY is required"),
  MONGO_HOSTNAME: z.string()
.min(1, "MONGO_HOSTNAME is required"),
  MONGO_USERNAME: z.string()
.min(1, "MONGO_USERNAME is required"),
  MONGO_PASSWORD: z.string()
.min(1, "MONGO_PASSWORD is required"),
  MONGO_CLUSTER_NAME: z.string()
.min(1, "MONGO_CLUSTER_NAME is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .default("info"),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(Bun.env);
