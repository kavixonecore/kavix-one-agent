import { z } from "zod/v4";
import { deleteOrg } from "../services/org.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  id: z.string().min(1),
});

export async function deleteOrgCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["id"]);
  const input = schema.parse({ id: parsed["id"] });
  const result = await deleteOrg(input.id);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log("Organization deleted successfully.");
}
