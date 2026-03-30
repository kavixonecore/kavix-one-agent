import { z } from "zod/v4";
import { disableConnection } from "../services/connection.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  orgId: z.string().min(1),
  connectionId: z.string().min(1),
});

export async function disableConnectionCommand(
  args: string[],
): Promise<void> {
  const parsed = parseFlags(args, ["org-id", "connection-id"]);
  const input = schema.parse({
    orgId: parsed["org-id"],
    connectionId: parsed["connection-id"],
  });
  const result = await disableConnection(input.orgId, input.connectionId);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log("Connection disabled successfully.");
}
