import { renderServer } from "../../../templates/base/server.tmpl.mjs";
import { renderHealthRouter } from "../../../templates/base/health-router.tmpl.mjs";
import { renderVersionRouter } from "../../../templates/base/version-router.tmpl.mjs";
import { renderTracePlugin } from "../../../templates/base/trace-plugin.tmpl.mjs";
import { renderLogger } from "../../../templates/base/logger.tmpl.mjs";

import type { IGenerationContext, IRenderedFile } from "../../core/interfaces/index.mjs";
import type winston from "winston";

/**
 * Renders the Elysia server, trace plugin, health/version routers, and logger.
 */
export class ServerRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(context: IGenerationContext): IRenderedFile[] {
    this.#logger.info("Rendering server files");

    return [
      {
        path: "src/api/index.mts",
        content: renderServer(context),
      },
      {
        path: "src/api/plugins/trace.plugin.mts",
        content: renderTracePlugin(context),
      },
      {
        path: "src/api/routes/health-router.mts",
        content: renderHealthRouter(context),
      },
      {
        path: "src/api/routes/version-router.mts",
        content: renderVersionRouter(context),
      },
      {
        path: "src/loggers/logger.mts",
        content: renderLogger(context),
      },
    ];
  }
}
