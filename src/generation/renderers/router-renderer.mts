import { renderRouter } from "../../../templates/base/router.tmpl.mjs";

import type winston from "winston";
import type { IFeatureSpec, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the Elysia router factory file.
 */
export class RouterRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(feature: IFeatureSpec): IRenderedFile[] {
    const lowerName = feature.entityName.charAt(0)
.toLowerCase() + feature.entityName.slice(1);

    this.#logger.info("Rendering router", { feature: feature.name });

    const routerContent = renderRouter(feature);

    return [
      {
        path: `src/api/routes/${lowerName}-router.mts`,
        content: routerContent,
        featureName: feature.name,
      },
    ];
  }
}
