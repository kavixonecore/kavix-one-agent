import type { IFeatureSpec } from "./i-feature-spec.mjs";
import type { GenerationStatus } from "../types/index.mjs";

/**
 * An ordered plan containing all features to be generated for a project.
 */
export interface IGenerationPlan {

  projectName: string;
  projectDescription: string;
  features: IFeatureSpec[];
  /**
   * Optional list of addon template names to apply after base feature generation.
   * Each name must match a registered addon in the TemplateRegistry.
   * Example: ["azure-terraform", "teams-notification"]
   */
  addons?: string[];
  status: GenerationStatus;
  createdAt: string;
  updatedAt: string;
}
