import { listOrgs } from "../services/org.service.mjs";

export async function listOrgsCommand(_args: string[]): Promise<void> {
  const result = await listOrgs();
  if (!result.ok) {
    console.error(`Error: ${result.error.message}`);
    process.exit(1);
  }
  console.log(JSON.stringify(result.value, null, 2));
}
