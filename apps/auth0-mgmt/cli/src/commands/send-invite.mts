import { z } from "zod/v4";
import { sendInvite } from "../services/invite.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  orgId: z.string().min(1),
  clientId: z.string().min(1),
  inviterName: z.string().min(1),
  inviteeEmail: z.email(),
  connectionId: z.string().optional(),
  roleIds: z.string().optional(),
  ttlSec: z.string().optional(),
});

export async function sendInviteCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, [
    "org-id", "client-id", "inviter-name",
    "invitee-email", "connection-id", "role-ids", "ttl-sec",
  ]);
  const input = schema.parse({
    orgId: parsed["org-id"],
    clientId: parsed["client-id"],
    inviterName: parsed["inviter-name"],
    inviteeEmail: parsed["invitee-email"],
    connectionId: parsed["connection-id"],
    roleIds: parsed["role-ids"],
    ttlSec: parsed["ttl-sec"],
  });
  const result = await sendInvite({
    orgId: input.orgId,
    clientId: input.clientId,
    inviterName: input.inviterName,
    inviteeEmail: input.inviteeEmail,
    connectionId: input.connectionId,
    roleIds: input.roleIds?.split(","),
    ttlSec: input.ttlSec ? Number(input.ttlSec) : undefined,
  });
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result.value, null, 2));
}
