import { renderSchema } from "../../../templates/base/schema.tmpl.mjs";

import type winston from "winston";
import type { IFeatureSpec, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the Zod validation schema and barrel export.
 */
export class SchemaRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(feature: IFeatureSpec): IRenderedFile[] {
    const lowerName = feature.entityName.charAt(0)
.toLowerCase() + feature.entityName.slice(1);
    const basePath = `src/features/${lowerName}`;

    this.#logger.info("Rendering schema", { feature: feature.name });

    const schemaContent = renderSchema(feature);
    const barrelContent = `export { ${feature.entityName}Schema, validate${feature.entityName} } from "./${lowerName}.validation.mjs";\nexport type { ${feature.entityName} } from "./${lowerName}.validation.mjs";\n`;

    return [
      {
        path: `${basePath}/validation/${lowerName}.validation.mts`,
        content: schemaContent,
        featureName: feature.name,
      },
      {
        path: `${basePath}/validation/index.mts`,
        content: barrelContent,
        featureName: feature.name,
      },
    ];
  }
}
