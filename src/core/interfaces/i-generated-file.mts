/**
 * Metadata about a file that a template plans to generate, before rendering.
 */
export interface IGeneratedFile {

  path: string;
  description: string;
  templateName: string;
  featureName?: string;
}
