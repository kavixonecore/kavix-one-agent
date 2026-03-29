import { renderInterface } from "../../../templates/base/interface.tmpl.mjs";

import type winston from "winston";
import type { IFeatureSpec, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the entity interface file and its barrel export.
 */
export class InterfaceRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(feature: IFeatureSpec): IRenderedFile[] {
    const lowerName = feature.entityName.charAt(0)
.toLowerCase() + feature.entityName.slice(1);
    const basePath = `src/features/${lowerName}`;

    this.#logger.info("Rendering interface", { feature: feature.name });

    const interfaceContent = renderInterface(feature);
    const barrelContent = `export type { I${feature.entityName} } from "./i-${lowerName}.mjs";\n`;

    return [
      {
        path: `${basePath}/interfaces/i-${lowerName}.mts`,
        content: interfaceContent,
        featureName: feature.name,
      },
      {
        path: `${basePath}/interfaces/index.mts`,
        content: barrelContent,
        featureName: feature.name,
      },
    ];
  }
}
