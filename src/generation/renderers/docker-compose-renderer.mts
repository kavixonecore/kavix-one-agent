import { renderDockerCompose } from "../../../templates/base/docker-compose.tmpl.mjs";
import { renderGitignore } from "../../../templates/base/gitignore.tmpl.mjs";

import type winston from "winston";
import type { IGenerationContext, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders docker-compose.yml and .gitignore for a generated project.
 */
export class DockerComposeRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(context: IGenerationContext): IRenderedFile[] {
    this.#logger.info("Rendering infrastructure files");

    return [
      {
        path: "docker-compose.yml",
        content: renderDockerCompose(context),
      },
      {
        path: ".gitignore",
        content: renderGitignore(context),
      },
    ];
  }
}
