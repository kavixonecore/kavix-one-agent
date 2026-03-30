import { z } from "zod/v4";
import { enableConnection } from "../services/connection.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  orgId: z.string().min(1),
  connectionId: z.string().min(1),
  assignMembershipOnLogin: z.string().optional(),
});

export async function enableConnectionCommand(
  args: string[],
): Promise<void> {
  const parsed = parseFlags(args, [
    "org-id",
    "connection-id",
    "assign-membership",
  ]);
  const input = schema.parse({
    orgId: parsed["org-id"],
    connectionId: parsed["connection-id"],
    assignMembershipOnLogin: parsed["assign-membership"],
  });
  const result = await enableConnection({
    orgId: input.orgId,
    connectionId: input.connectionId,
    assignMembershipOnLogin: input.assignMembershipOnLogin === "true",
  });
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log("Connection enabled successfully.");
}
