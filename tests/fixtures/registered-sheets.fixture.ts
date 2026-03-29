import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Medium complexity fixture — based on RegisteredSheet from smartsheet-api.
 * Has a string-enum field, multiple custom indexes, and an optional array field.
 */
export const registeredSheetsFixture: IFeatureSpec = {
  name: "registered-sheets",
  entityName: "RegisteredSheet",
  pluralName: "registeredSheets",
  collectionName: "registered_sheets",
  fields: [
    { name: "sheetId", type: "string", required: true },
    { name: "sheetName", type: "string", required: true },
    { name: "workspaceId", type: "string", required: true },
    { name: "status", type: "string", required: true },
    { name: "columnMappings", type: "object", required: false, isArray: true },
    { name: "lastSyncedAt", type: "Date", required: false },
    { name: "errorMessage", type: "string", required: false },
    { name: "retryCount", type: "number", required: true, default: 0 },
  ],
  enums: [
    {
      name: "RegisteredSheetStatus",
      values: ["active", "inactive", "error", "syncing"],
      description: "Lifecycle status of a registered Smartsheet.",
    },
  ],
  indexes: [
    {
      fields: ["sheetId"],
      unique: true,
      name: "idx_sheet_id",
    },
    {
      fields: ["workspaceId", "status"],
      unique: false,
      name: "idx_workspace_status",
    },
  ],
  description: "Tracks Smartsheet sheets registered for sync operations.",
};
