import { z } from "zod/v4";
import { createSocialConnection } from "../services/connection.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";
import type { SocialProvider } from "../interfaces/i-connection.mjs";

const VALID_PROVIDERS = ["google", "github", "apple", "microsoft"] as const;

const schema = z.object({
  provider: z.enum(VALID_PROVIDERS),
});

export async function setupSocialCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["provider"]);
  const input = schema.parse({ provider: parsed["provider"] });
  const provider = input.provider as SocialProvider;
  const result = await createSocialConnection(provider);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result.value, null, 2));
}
