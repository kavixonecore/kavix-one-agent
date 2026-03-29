import type { FieldType } from "../types/index.mjs";

/**
 * Specification for a single field in a generated entity.
 */
export interface IFieldSpec {

  name: string;
  type: FieldType;
  required: boolean;
  default?: unknown;
  isArray?: boolean;
  nestedFields?: IFieldSpec[];
  description?: string;
  enumRef?: string;
}
