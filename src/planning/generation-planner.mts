import { createLogger } from "../logger/logger.mjs";
import { extractFeatures } from "./feature-extractor.mjs";
import { resolveOrder } from "./dependency-resolver.mjs";

import type { IFeatureSpec, IGenerationPlan } from "../core/interfaces/index.mjs";

const logger = createLogger("generation-planner");

/**
 * Creates an ordered generation plan from a set of raw feature specs.
 * Normalises features via extractFeatures and orders them via resolveOrder.
 *
 * @param features - Raw feature specs (from PRD parser or prompt parser)
 * @param projectName - Name of the project being generated
 */
export function createPlan(features: IFeatureSpec[], projectName: string): IGenerationPlan {
  logger.info("Creating generation plan", { projectName, features: features.length });

  const extracted = extractFeatures(features);
  const ordered = resolveOrder(extracted);

  const now = new Date()
.toISOString();

  const plan: IGenerationPlan = {
    projectName,
    projectDescription: `Generated project: ${projectName}`,
    features: ordered,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  logger.info("Generation plan created", {
    projectName,
    featureCount: ordered.length,
    order: ordered.map((f) => f.entityName),
  });

  return plan;
}
