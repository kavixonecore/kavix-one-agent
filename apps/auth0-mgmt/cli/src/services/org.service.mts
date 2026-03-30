import { getAuth0Client } from "./auth0-client.mjs";
import type { Result } from "../interfaces/i-result.mjs";
import type { IOrg, ICreateOrgInput } from "../interfaces/i-org.mjs";

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export async function createOrg(input: ICreateOrgInput): Promise<Result<IOrg>> {
  try {
    const client = getAuth0Client();
    const response = await client.organizations.create({
      name: input.name,
      display_name: input.displayName,
      ...(input.metadata && { metadata: input.metadata }),
    });
    return {
      ok: true,
      value: {
        id: response.id ?? "",
        name: response.name ?? "",
        displayName: response.display_name ?? "",
        metadata: response.metadata as Record<string, string> | undefined,
      },
    };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function listOrgs(): Promise<Result<IOrg[]>> {
  try {
    const client = getAuth0Client();
    const page = await client.organizations.list();
    const orgs: IOrg[] = page.data.map((o) => ({
      id: o.id ?? "",
      name: o.name ?? "",
      displayName: o.display_name ?? "",
      metadata: o.metadata as Record<string, string> | undefined,
    }));
    return { ok: true, value: orgs };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function getOrg(id: string): Promise<Result<IOrg>> {
  try {
    const client = getAuth0Client();
    const response = await client.organizations.get(id);
    return {
      ok: true,
      value: {
        id: response.id ?? "",
        name: response.name ?? "",
        displayName: response.display_name ?? "",
        metadata: response.metadata as Record<string, string> | undefined,
      },
    };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function deleteOrg(id: string): Promise<Result<void>> {
  try {
    const client = getAuth0Client();
    await client.organizations.delete(id);
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}
