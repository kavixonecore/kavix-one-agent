import { z } from "zod/v4";
import { createRole } from "../services/role.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function createRoleCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["name", "description"]);
  const input = schema.parse({
    name: parsed["name"],
    description: parsed["description"],
  });
  const result = await createRole(input.name, input.description);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result.value, null, 2));
}
