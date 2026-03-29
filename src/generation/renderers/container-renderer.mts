import { renderContainer } from "../../../templates/base/container.tmpl.mjs";
import { renderContainerInterface } from "../../../templates/base/container-interface.tmpl.mjs";

import type winston from "winston";
import type { IGenerationContext, IRenderedFile } from "../../core/interfaces/index.mjs";

/**
 * Renders the IoC getContainer() function and IContainer interface.
 */
export class ContainerRenderer {

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#logger = logger;
  }

  public render(context: IGenerationContext): IRenderedFile[] {
    this.#logger.info("Rendering IoC container", {
      features: context.features.length,
    });

    const containerContent = renderContainer(context);
    const containerInterfaceContent = renderContainerInterface(context);

    return [
      {
        path: "src/ioc/get-container.mts",
        content: containerContent,
      },
      {
        path: "src/ioc/interfaces/i-container.mts",
        content: containerInterfaceContent,
      },
    ];
  }
}
