/**
 * Specification for a MongoDB index on a generated entity collection.
 */
export interface IIndexSpec {

  fields: string[];
  unique: boolean;
  name: string;
}
