import { join, dirname } from "path";

import type winston from "winston";
import type { IRenderedFile } from "../core/interfaces/index.mjs";

/**
 * Result of a file write operation.
 */
export interface IWriteResult {
  path: string;
  written: boolean;
  error?: string;
}

/**
 * Writes rendered files to disk using Bun.write().
 * Creates parent directories as needed.
 */
export class FileWriter {

  readonly #outputDir: string;

  readonly #logger: winston.Logger;

  readonly #dryRun: boolean;

  public constructor(
    outputDir: string,
    logger: winston.Logger,
    dryRun = false
  ) {
    this.#outputDir = outputDir;
    this.#logger = logger;
    this.#dryRun = dryRun;
  }

  public async writeFile(file: IRenderedFile): Promise<IWriteResult> {
    const absolutePath = join(this.#outputDir, file.path);

    if (this.#dryRun) {
      this.#logger.info("[dry-run] Would write file", { path: absolutePath });
      return { path: absolutePath, written: false };
    }

    try {
      const dir = dirname(absolutePath);
      await Bun.write(
        absolutePath,
        file.content
      );
      void dir;
      this.#logger.info("Wrote file", { path: absolutePath });
      return { path: absolutePath, written: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.#logger.error("Failed to write file", { path: absolutePath, error });
      return { path: absolutePath, written: false, error: message };
    }
  }

  public async writeFiles(files: IRenderedFile[]): Promise<IWriteResult[]> {
    const results: IWriteResult[] = [];
    for (const file of files) {
      const result = await this.writeFile(file);
      results.push(result);
    }
    return results;
  }
}
