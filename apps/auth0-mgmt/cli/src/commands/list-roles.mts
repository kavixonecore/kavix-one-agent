import { listRoles } from "../services/role.service.mjs";

export async function listRolesCommand(_args: string[]): Promise<void> {
  const result = await listRoles();
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result.value, null, 2));
}
