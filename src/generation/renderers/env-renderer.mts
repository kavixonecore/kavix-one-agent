import { renderEnvConfig } from "../../../templates/base/env-config.tmpl.mjs";
import { renderEnvExample } from "../../../templates/base/env-example.tmpl.mjs";

import type winston from "winston";
import type { IGenerationContext, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the env config singleton and .env.example file.
 */
export class EnvRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(context: IGenerationContext): IRenderedFile[] {
    this.#logger.info("Rendering env config");

    const envConfigContent = renderEnvConfig(context);
    const envExampleContent = renderEnvExample(context);

    return [
      {
        path: "src/env.mts",
        content: envConfigContent,
      },
      {
        path: ".env.example",
        content: envExampleContent,
      },
    ];
  }
}
