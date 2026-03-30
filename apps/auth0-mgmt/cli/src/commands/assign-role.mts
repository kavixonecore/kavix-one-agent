import { z } from "zod/v4";
import { assignRole } from "../services/role.service.mjs";
import { parseFlags } from "../utils/parse-flags.mjs";

const schema = z.object({
  orgId: z.string().min(1),
  userId: z.string().min(1),
  roleIds: z.string().min(1),
});

export async function assignRoleCommand(args: string[]): Promise<void> {
  const parsed = parseFlags(args, ["org-id", "user-id", "role-ids"]);
  const input = schema.parse({
    orgId: parsed["org-id"],
    userId: parsed["user-id"],
    roleIds: parsed["role-ids"],
  });
  const roleIds = input.roleIds.split(",");
  const result = await assignRole(input.orgId, input.userId, roleIds);
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log("Roles assigned successfully.");
}
