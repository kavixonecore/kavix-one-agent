import type { IFeatureSpec } from "./i-feature-spec.mjs";

/**
 * Runtime context passed to every renderer during code generation.
 */
export interface IGenerationContext {

  projectName: string;
  projectScope: string;
  outputDir: string;
  features: IFeatureSpec[];
  currentFeature?: IFeatureSpec;
  dryRun: boolean;
}
