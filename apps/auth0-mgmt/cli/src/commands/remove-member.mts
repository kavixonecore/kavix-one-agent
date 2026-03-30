import { z } from "zod/v4";
import { removeMember } from "../services/member.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  orgId: z.string().min(1),
  userId: z.string().min(1),
});

export async function removeMemberCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["org-id", "user-id"]);
  const input = schema.parse({
    orgId: parsed["org-id"],
    userId: parsed["user-id"],
  });
  const result = await removeMember(input.orgId, input.userId);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log("Member removed successfully.");
}
