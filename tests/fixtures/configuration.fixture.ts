import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Simple CRUD fixture — based on the Configuration entity from cmms.
 * No enums, one composite unique index.
 */
export const configurationFixture: IFeatureSpec = {
  name: "configuration",
  entityName: "Configuration",
  pluralName: "configurations",
  collectionName: "configuration",
  fields: [
    { name: "serviceName", type: "string", required: true },
    { name: "configKey", type: "string", required: true },
    { name: "configValue", type: "string", required: true },
    { name: "isActive", type: "boolean", required: true, default: true },
    { name: "description", type: "string", required: false },
  ],
  enums: [],
  indexes: [
    {
      fields: ["serviceName", "configKey"],
      unique: true,
      name: "idx_service_config",
    },
  ],
  description: "Application configuration key-value store per service.",
};
