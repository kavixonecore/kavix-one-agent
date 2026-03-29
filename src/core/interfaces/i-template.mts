import type { TemplateType } from "../enums/index.mjs";
import type { IFeatureSpec } from "./i-feature-spec.mjs";
import type { IGeneratedFile } from "./i-generated-file.mjs";
import type { IGenerationContext } from "./i-generation-context.mjs";
import type { IRenderedFile } from "./i-rendered-file.mjs";
import type { IValidationResult } from "./i-validation-result.mjs";

/**
 * Contract all templates (base and addon) must implement.
 */
export interface ITemplate {

  readonly name: string;
  readonly type: TemplateType;
  readonly description: string;

  plan(feature: IFeatureSpec): IGeneratedFile[];
  render(feature: IFeatureSpec, context: IGenerationContext): IRenderedFile[];
  validate(files: IRenderedFile[]): IValidationResult;
}
