import { renderTest } from "../../../templates/base/test.tmpl.mjs";

import type winston from "winston";
import type { IFeatureSpec, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the unit test stubs for a feature's service.
 */
export class TestRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(feature: IFeatureSpec): IRenderedFile[] {
    const lowerName = feature.entityName.charAt(0)
.toLowerCase() + feature.entityName.slice(1);

    this.#logger.info("Rendering tests", { feature: feature.name });

    const testContent = renderTest(feature);

    return [
      {
        path: `tests/${lowerName}/${lowerName}-service.test.ts`,
        content: testContent,
        featureName: feature.name,
      },
    ];
  }
}
