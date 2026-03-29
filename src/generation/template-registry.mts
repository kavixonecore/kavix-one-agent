import { join } from "path";

import { TemplateType } from "../core/enums/index.mjs";

import type winston from "winston";
import type { ITemplate } from "../core/interfaces/index.mjs";

/**
 * Registry that manages base and addon templates.
 * Templates are registered by name and looked up at render time.
 * Supports filesystem-based discovery of addon templates from a directory.
 */
export class TemplateRegistry {

  readonly #templates: Map<string, ITemplate>;

  readonly #logger: winston.Logger;

  public constructor(logger: winston.Logger) {
    this.#templates = new Map();
    this.#logger = logger;
  }

  public register(template: ITemplate): void {
    if (this.#templates.has(template.name)) {
      this.#logger.warn("Template already registered, overwriting", {
        name: template.name,
      });
    }
    this.#templates.set(template.name, template);
    this.#logger.info("Registered template", {
      name: template.name,
      type: template.type,
    });
  }

  public get(name: string): ITemplate | undefined {
    return this.#templates.get(name);
  }

  public getAll(): ITemplate[] {
    return Array.from(this.#templates.values());
  }

  public getByType(type: TemplateType): ITemplate[] {
    return this.getAll()
.filter((t) => t.type === type);
  }

  public getBaseTemplates(): ITemplate[] {
    return this.getByType(TemplateType.BASE);
  }

  public getAddonTemplates(): ITemplate[] {
    return this.getByType(TemplateType.ADDON);
  }

  public has(name: string): boolean {
    return this.#templates.has(name);
  }

  public size(): number {
    return this.#templates.size;
  }

  /**
   * Registers an addon template directly.
   */
  public registerAddon(template: ITemplate): void {
    this.register(template);
  }

  /**
   * Retrieves an addon template by name.
   */
  public getAddon(name: string): ITemplate | undefined {
    const template = this.#templates.get(name);
    if (template?.type === TemplateType.ADDON) {
      return template;
    }
    return undefined;
  }

  /**
   * Lists all registered addon templates.
   */
  public listAddons(): ITemplate[] {
    return this.getAddonTemplates();
  }

  /**
   * Discovers addon templates from a filesystem directory.
   * Each subdirectory must contain an index.mts (compiled to index.mjs) that
   * exports an ITemplate implementation as the default or named export "template".
   */
  public async discoverAddons(addonsDir: string): Promise<ITemplate[]> {
    const discovered: ITemplate[] = [];

    let entries: string[];
    try {
      const dir = Bun.file(addonsDir);
      void dir;
      const glob = new Bun.Glob("*/index.mjs");
      const matches = await Array.fromAsync(glob.scan({ cwd: addonsDir }));
      entries = matches;
    } catch {
      this.#logger.warn("Could not scan addons directory", { addonsDir });
      return discovered;
    }

    for (const entry of entries) {
      const indexPath = join(addonsDir, entry);
      try {
        const mod = await import(indexPath) as Record<string, unknown>;
        let template: ITemplate | undefined;

        if (mod["template"] && this.#isTemplate(mod["template"])) {
          template = mod["template"] as ITemplate;
        } else if (mod["default"] && this.#isTemplate(mod["default"])) {
          template = mod["default"] as ITemplate;
        }

        if (template) {
          this.registerAddon(template);
          discovered.push(template);
          this.#logger.info("Discovered addon template", {
            name: template.name,
            path: indexPath,
          });
        } else {
          this.#logger.warn("Addon index does not export a valid ITemplate", {
            path: indexPath,
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.#logger.error("Failed to load addon template", {
          path: indexPath,
          error: message,
        });
      }
    }

    return discovered;
  }

  #isTemplate(value: unknown): boolean {
    if (typeof value !== "object" || value === null) {
return false;
}
    const obj = value as Record<string, unknown>;
    return (
      typeof obj["name"] === "string" &&
      typeof obj["type"] === "string" &&
      typeof obj["description"] === "string" &&
      typeof obj["plan"] === "function" &&
      typeof obj["render"] === "function" &&
      typeof obj["validate"] === "function"
    );
  }
}
