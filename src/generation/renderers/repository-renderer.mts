import { renderRepository } from "../../../templates/base/repository.tmpl.mjs";

import type winston from "winston";
import type { IFeatureSpec, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the repository class and its barrel export.
 */
export class RepositoryRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(feature: IFeatureSpec): IRenderedFile[] {
    const lowerName = feature.entityName.charAt(0)
.toLowerCase() + feature.entityName.slice(1);
    const basePath = `src/features/${lowerName}`;

    this.#logger.info("Rendering repository", { feature: feature.name });

    const repoContent = renderRepository(feature);
    const barrelContent = `export { ${feature.entityName}Repository } from "./${lowerName}-repository.mjs";\n`;

    return [
      {
        path: `${basePath}/repository/${lowerName}-repository.mts`,
        content: repoContent,
        featureName: feature.name,
      },
      {
        path: `${basePath}/repository/index.mts`,
        content: barrelContent,
        featureName: feature.name,
      },
    ];
  }
}
