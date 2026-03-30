import { z } from "zod/v4";
import { listMembers } from "../services/member.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  orgId: z.string().min(1),
});

export async function listMembersCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["org-id"]);
  const input = schema.parse({ orgId: parsed["org-id"] });
  const result = await listMembers(input.orgId);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result.value, null, 2));
}
