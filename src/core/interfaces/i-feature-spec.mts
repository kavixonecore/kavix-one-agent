import type { IEnumSpec } from "./i-enum-spec.mjs";
import type { IFieldSpec } from "./i-field-spec.mjs";
import type { IIndexSpec } from "./i-index-spec.mjs";

/**
 * Full specification for a single feature/domain to be generated.
 * Drives all renderers bottom-up (interfaces → schema → repo → service → router → tests).
 */
export interface IFeatureSpec {

  name: string;
  entityName: string;
  pluralName: string;
  collectionName: string;
  fields: IFieldSpec[];
  enums: IEnumSpec[];
  indexes: IIndexSpec[];
  description?: string;
}
