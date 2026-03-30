import { Elysia } from "elysia";

export function auditRouter(): Elysia {
  return new Elysia({ prefix: "/audit" })
    .get("/", () => {
      return {
        success: true as const,
        data: [],
        count: 0,
        message: "Audit endpoint placeholder. Will query MongoDB audit collection when integrated.",
      };
    });
}
