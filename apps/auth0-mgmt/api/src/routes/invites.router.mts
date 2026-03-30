import { Elysia, t } from "elysia";
import { sendInvite, listInvites, revokeInvite } from "../../../cli/src/services/invite.service.mjs";

function errorResponse(error: Error): { success: false; error: string } {
  return { success: false, error: error.message };
}

export function invitesRouter(): Elysia {
  return new Elysia({ prefix: "/invites" })
    .post("/", async ({ body, set }) => {
      const result = await sendInvite({
        orgId: body.orgId,
        clientId: body.clientId,
        inviterName: body.inviterName,
        inviteeEmail: body.inviteeEmail,
        connectionId: body.connectionId,
        roleIds: body.roleIds,
        ttlSec: body.ttlSec,
      });
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      set.status = 201;
      return { success: true as const, data: result.value };
    }, {
      body: t.Object({
        orgId: t.String(),
        clientId: t.String(),
        inviterName: t.String(),
        inviteeEmail: t.String(),
        connectionId: t.Optional(t.String()),
        roleIds: t.Optional(t.Array(t.String())),
        ttlSec: t.Optional(t.Number()),
      }),
    })
    .get("/org/:orgId", async ({ params, set }) => {
      const result = await listInvites(params.orgId);
      if (!result.ok) {
        set.status = 500;
        return errorResponse(result.error);
      }
      return { success: true as const, data: result.value, count: result.value.length };
    }, {
      params: t.Object({ orgId: t.String() }),
    })
    .delete("/:inviteId/org/:orgId", async ({ params, set }) => {
      const result = await revokeInvite(params.orgId, params.inviteId);
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      return { success: true as const, data: null };
    }, {
      params: t.Object({ inviteId: t.String(), orgId: t.String() }),
    });
}
