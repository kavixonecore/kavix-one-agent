import { z } from "zod/v4";

const envSchema = z.object({
  AUTH0_DOMAIN: z.string().min(1, "AUTH0_DOMAIN is required"),
  AUTH0_CLIENT_ID: z.string().min(1, "AUTH0_CLIENT_ID is required"),
  AUTH0_CLIENT_SECRET: z.string().min(1, "AUTH0_CLIENT_SECRET is required"),
  AUTH0_AUDIENCE: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  PORT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  cachedEnv = result.data;
  return cachedEnv;
}

export function resetEnvCache(): void {
  cachedEnv = null;
}
