import { getAuth0Client } from "./auth0-client.mjs";
import type { Result } from "../interfaces/i-result.mjs";
import type { IInvite, ISendInviteInput } from "../interfaces/i-invite.mjs";

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export async function sendInvite(
  input: ISendInviteInput,
): Promise<Result<IInvite>> {
  try {
    const client = getAuth0Client();
    const response = await client.organizations.invitations.create(
      input.orgId,
      {
        inviter: { name: input.inviterName },
        invitee: { email: input.inviteeEmail },
        client_id: input.clientId,
        ...(input.connectionId && { connection_id: input.connectionId }),
        ...(input.roleIds && { roles: input.roleIds }),
        ...(input.ttlSec && { ttl_sec: input.ttlSec }),
      },
    );
    return {
      ok: true,
      value: {
        id: response.id ?? "",
        inviteeEmail: response.invitee?.email ?? "",
        inviterName: response.inviter?.name ?? "",
        createdAt: response.created_at ?? "",
        expiresAt: response.expires_at ?? "",
        roles: response.roles ?? [],
      },
    };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function listInvites(
  orgId: string,
): Promise<Result<IInvite[]>> {
  try {
    const client = getAuth0Client();
    const page = await client.organizations.invitations.list(orgId);
    const invites: IInvite[] = page.data.map((inv) => ({
      id: inv.id ?? "",
      inviteeEmail: inv.invitee?.email ?? "",
      inviterName: inv.inviter?.name ?? "",
      createdAt: inv.created_at ?? "",
      expiresAt: inv.expires_at ?? "",
      roles: inv.roles ?? [],
    }));
    return { ok: true, value: invites };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

export async function revokeInvite(
  orgId: string,
  inviteId: string,
): Promise<Result<void>> {
  try {
    const client = getAuth0Client();
    await client.organizations.invitations.delete(orgId, inviteId);
    return { ok: true, value: undefined };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}
