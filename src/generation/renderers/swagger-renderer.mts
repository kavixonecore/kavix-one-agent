import { renderSwaggerDetail } from "../../../templates/base/swagger-detail.tmpl.mjs";

import type winston from "winston";
import type { IFeatureSpec, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the Swagger detail objects file for a feature.
 */
export class SwaggerRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(feature: IFeatureSpec): IRenderedFile[] {
    const lowerName = feature.entityName.charAt(0)
.toLowerCase() + feature.entityName.slice(1);
    const basePath = `src/features/${lowerName}`;

    this.#logger.info("Rendering swagger detail", { feature: feature.name });

    const swaggerContent = renderSwaggerDetail(feature);

    return [
      {
        path: `${basePath}/docs/${lowerName}-swagger.mts`,
        content: swaggerContent,
        featureName: feature.name,
      },
    ];
  }
}
