import { renderRepositoryFactory } from "../../../templates/base/repository-factory.tmpl.mjs";
import { renderDatabaseConfig } from "../../../templates/base/database-config.tmpl.mjs";

import type winston from "winston";
import type { IGenerationContext, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the RepositoryFactory and database configuration files.
 */
export class RepositoryFactoryRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(context: IGenerationContext): IRenderedFile[] {
    this.#logger.info("Rendering repository factory");

    return [
      {
        path: "src/ioc/repository-factory.mts",
        content: renderRepositoryFactory(context),
      },
      {
        path: "src/ioc/create-database-configuration.mts",
        content: renderDatabaseConfig(context),
      },
    ];
  }
}
