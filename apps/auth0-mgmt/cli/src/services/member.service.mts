import { getAuth0Client } from "./auth0-client.mjs";
import type { Result } from "../interfaces/i-result.mjs";
import type { IMember } from "../interfaces/i-member.mjs";

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export async function listMembers(orgId: string): Promise<Result<IMember[]>> {
  try {
    const client = getAuth0Client();
    const page = await client.organizations.members.list(orgId);
    const members: IMember[] = page.data.map((m) => ({
      userId: m.user_id ?? "",
      email: m.email ?? undefined,
      name: m.name ?? undefined,
      picture: m.picture ?? undefined,
    }));
    return { ok: true, value: members };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function addMember(
  orgId: string,
  userId: string,
): Promise<Result<void>> {
  try {
    const client = getAuth0Client();
    await client.organizations.members.create(orgId, {
      members: [userId],
    });
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function removeMember(
  orgId: string,
  userId: string,
): Promise<Result<void>> {
  try {
    const client = getAuth0Client();
    await client.organizations.members.delete(orgId, {
      members: [userId],
    });
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}
