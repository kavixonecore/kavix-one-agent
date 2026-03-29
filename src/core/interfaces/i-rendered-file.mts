/**
 * A file that has been rendered from a template and is ready to write to disk.
 */
export interface IRenderedFile {

  path: string;
  content: string;
  featureName?: string;
}
