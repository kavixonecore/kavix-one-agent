import { z } from "zod/v4";
import { createOrg } from "../services/org.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
});

export async function createOrgCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["name", "display-name"]);
  const input = schema.parse({
    name: parsed["name"],
    displayName: parsed["display-name"],
  });
  const result = await createOrg(input);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result.value, null, 2));
}
