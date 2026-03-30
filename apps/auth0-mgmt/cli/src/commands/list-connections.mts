import { listConnections } from "../services/connection.service.mjs";
import { listOrgConnections } from "../services/connection.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

export async function listConnectionsCommand(
  args: string[],
): Promise<void> {
  const parsed = parseFlags(args, ["org-id"]);
  const orgId = parsed["org-id"];
  const result = orgId
    ? await listOrgConnections(orgId)
    : await listConnections();
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result.value, null, 2));
}
