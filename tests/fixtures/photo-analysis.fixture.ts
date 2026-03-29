import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Complex fixture — based on PhotoAnalysis from ct-ai-photo-qc.
 * Has nested objects (surveyData, analysisItems), metadata, and external service refs.
 */
export const photoAnalysisFixture: IFeatureSpec = {
  name: "photo-analysis",
  entityName: "PhotoAnalysis",
  pluralName: "photoAnalyses",
  collectionName: "photo_analysis",
  fields: [
    { name: "instanceId", type: "string", required: true },
    { name: "photoUrl", type: "string", required: true },
    { name: "status", type: "string", required: true },
    {
      name: "surveyData",
      type: "object",
      required: false,
      nestedFields: [
        { name: "siteId", type: "string", required: true },
        { name: "surveyType", type: "string", required: true },
        { name: "completedAt", type: "Date", required: false },
      ],
    },
    {
      name: "analysisItems",
      type: "object",
      required: false,
      isArray: true,
      nestedFields: [
        { name: "checkId", type: "string", required: true },
        { name: "checkName", type: "string", required: true },
        { name: "passed", type: "boolean", required: true },
        { name: "confidence", type: "number", required: false },
        { name: "notes", type: "string", required: false },
      ],
    },
    { name: "aiModel", type: "string", required: false },
    { name: "tokenUsage", type: "number", required: false },
    { name: "processedAt", type: "Date", required: false },
    { name: "errorMessage", type: "string", required: false },
  ],
  enums: [
    {
      name: "PhotoAnalysisStatus",
      values: ["pending", "processing", "complete", "failed", "skipped"],
      description: "Lifecycle status of a photo analysis task.",
    },
  ],
  indexes: [
    {
      fields: ["instanceId"],
      unique: true,
      name: "idx_instance_id",
    },
    {
      fields: ["status", "processedAt"],
      unique: false,
      name: "idx_status_processed",
    },
  ],
  description: "AI-powered photo quality check results for construction site instances.",
};
