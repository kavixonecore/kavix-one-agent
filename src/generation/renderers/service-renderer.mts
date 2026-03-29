import { renderService } from "../../../templates/base/service.tmpl.mjs";
import { renderServiceInterface } from "../../../templates/base/service-interface.tmpl.mjs";

import type winston from "winston";
import type { IFeatureSpec, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the service class, service interface, and barrel export.
 */
export class ServiceRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(feature: IFeatureSpec): IRenderedFile[] {
    const lowerName = feature.entityName.charAt(0)
.toLowerCase() + feature.entityName.slice(1);
    const basePath = `src/features/${lowerName}`;

    this.#logger.info("Rendering service", { feature: feature.name });

    const serviceContent = renderService(feature);
    const serviceInterfaceContent = renderServiceInterface(feature);
    const barrelContent = `export { ${feature.entityName}Service } from "./${lowerName}-service.mjs";\nexport type { I${feature.entityName}Service } from "./i-${lowerName}-service.mjs";\n`;

    return [
      {
        path: `${basePath}/service/${lowerName}-service.mts`,
        content: serviceContent,
        featureName: feature.name,
      },
      {
        path: `${basePath}/service/i-${lowerName}-service.mts`,
        content: serviceInterfaceContent,
        featureName: feature.name,
      },
      {
        path: `${basePath}/service/index.mts`,
        content: barrelContent,
        featureName: feature.name,
      },
    ];
  }
}
