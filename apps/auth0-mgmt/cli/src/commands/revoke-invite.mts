import { z } from "zod/v4";
import { revokeInvite } from "../services/invite.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  orgId: z.string().min(1),
  inviteId: z.string().min(1),
});

export async function revokeInviteCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["org-id", "invite-id"]);
  const input = schema.parse({
    orgId: parsed["org-id"],
    inviteId: parsed["invite-id"],
  });
  const result = await revokeInvite(input.orgId, input.inviteId);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log("Invite revoked successfully.");
}
