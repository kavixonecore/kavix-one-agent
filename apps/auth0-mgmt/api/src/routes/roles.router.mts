import { Elysia, t } from "elysia";
import { createRole, listRoles, assignRole, getMemberRoles } from "../../../cli/src/services/role.service.mjs";

function errorResponse(error: Error): { success: false; error: string } {
  return { success: false, error: error.message };
}

export function rolesRouter(): Elysia {
  return new Elysia({ prefix: "/roles" })
    .post("/", async ({ body, set }) => {
      const result = await createRole(body.name, body.description);
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      set.status = 201;
      return { success: true as const, data: result.value };
    }, {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
      }),
    })
    .get("/", async ({ set }) => {
      const result = await listRoles();
      if (!result.ok) {
        set.status = 500;
        return errorResponse(result.error);
      }
      return { success: true as const, data: result.value, count: result.value.length };
    })
    .post("/assign", async ({ body, set }) => {
      const result = await assignRole(
        body.orgId,
        body.userId,
        body.roleIds,
      );
      if (!result.ok) {
        set.status = 400;
        return errorResponse(result.error);
      }
      return { success: true as const, data: null };
    }, {
      body: t.Object({
        orgId: t.String(),
        userId: t.String(),
        roleIds: t.Array(t.String()),
      }),
    })
    .get("/org/:orgId/member/:userId", async ({ params, set }) => {
      const result = await getMemberRoles(params.orgId, params.userId);
      if (!result.ok) {
        set.status = 500;
        return errorResponse(result.error);
      }
      return { success: true as const, data: result.value, count: result.value.length };
    }, {
      params: t.Object({ orgId: t.String(), userId: t.String() }),
    });
}
