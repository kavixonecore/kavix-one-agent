import { getAuth0Client } from "./auth0-client.mjs";
import type { Result } from "../interfaces/i-result.mjs";
import type { IRole } from "../interfaces/i-role.mjs";

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export async function createRole(
  name: string,
  description?: string,
): Promise<Result<IRole>> {
  try {
    const client = getAuth0Client();
    const response = await client.roles.create({
      name,
      ...(description && { description }),
    });
    return {
      ok: true,
      value: {
        id: response.id ?? "",
        name: response.name ?? "",
        description: response.description ?? undefined,
      },
    };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function listRoles(): Promise<Result<IRole[]>> {
  try {
    const client = getAuth0Client();
    const page = await client.roles.list();
    const roles: IRole[] = page.data.map((r) => ({
      id: r.id ?? "",
      name: r.name ?? "",
      description: r.description ?? undefined,
    }));
    return { ok: true, value: roles };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function assignRole(
  orgId: string,
  userId: string,
  roleIds: string[],
): Promise<Result<void>> {
  try {
    const client = getAuth0Client();
    await client.organizations.members.roles.assign(orgId, userId, {
      roles: roleIds,
    });
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function getMemberRoles(
  orgId: string,
  userId: string,
): Promise<Result<IRole[]>> {
  try {
    const client = getAuth0Client();
    const page = await client.organizations.members.roles.list(
      orgId,
      userId,
    );
    const roles: IRole[] = page.data.map((r) => ({
      id: r.id ?? "",
      name: r.name ?? "",
      description: r.description ?? undefined,
    }));
    return { ok: true, value: roles };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}
