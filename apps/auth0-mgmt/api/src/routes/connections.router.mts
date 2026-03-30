import { Elysia, t } from "elysia";
import {
  listConnections,
  listOrgConnections,
  enableConnection,
  disableConnection,
  createSocialConnection,
} from "../../../cli/src/services/connection.service.mjs";
import type { SocialProvider } from "../../../cli/src/interfaces/i-connection.mjs";

function errorResponse(error: Error): { success: false; error: string } {
  return { success: false, error: error.message };
}

export function connectionsRouter(): Elysia {
  return new Elysia({ prefix: "/connections" })
    .get("/", async ({ set }) => {
      const result = await listConnections();
      if (!result.ok) {
        set.status = 500;
        return errorResponse(result.error);
      }
      return { success: true as const, data: result.value, count: result.value.length };
    })
    .get("/org/:orgId", async ({ params, set }) => {
      const result = await listOrgConnections(params.orgId);
      if (!result.ok) {
        set.status = 500;
        return errorResponse(result.error);
      }
      return { success: true as const, data: result.value, count: result.value.length };
    }, {
      params: t.Object({ orgId: t.String() }),
    })
    .post("/org/:orgId/enable", async ({ params, body, set }) => {
      const result = await enableConnection({
        orgId: params.orgId,
        connectionId: body.connectionId,
        assignMembershipOnLogin: body.assignMembershipOnLogin,
      });
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      set.status = 201;
      return { success: true as const, data: null };
    }, {
      params: t.Object({ orgId: t.String() }),
      body: t.Object({
        connectionId: t.String(),
        assignMembershipOnLogin: t.Boolean(),
      }),
    })
    .delete("/org/:orgId/:connectionId", async ({ params, set }) => {
      const result = await disableConnection(
        params.orgId,
        params.connectionId,
      );
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      return { success: true as const, data: null };
    }, {
      params: t.Object({ orgId: t.String(), connectionId: t.String() }),
    })
    .post("/social", async ({ body, set }) => {
      const provider = body.provider as SocialProvider;
      const result = await createSocialConnection(provider);
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      set.status = 201;
      return { success: true as const, data: result.value };
    }, {
      body: t.Object({
        provider: t.Union([
          t.Literal("google"),
          t.Literal("github"),
          t.Literal("apple"),
          t.Literal("microsoft"),
        ]),
      }),
    });
}
