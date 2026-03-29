import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the service class for an entity with CRUD methods.
 * Constructor receives repository interface and logger (DI).
 */
export function renderService(feature: IFeatureSpec): string {
  const { entityName } = feature;
  const className = `${entityName}Service`;
  const interfaceName = `I${entityName}`;
  const repoInterfaceName = `I${entityName}Repository`;
  const serviceInterfaceName = `I${entityName}Service`;
  const lowerName = entityName.charAt(0)
.toLowerCase() + entityName.slice(1);

  return `import type { ObjectId } from "mongodb";
import type winston from "winston";

import type { ${interfaceName} } from "../interfaces/index.mjs";
import type { ${serviceInterfaceName} } from "./i-${lowerName}-service.mjs";
import type { ${repoInterfaceName} } from "../repository/index.mjs";

/**
 * Service for ${entityName} CRUD operations.
 * Receives repository interface and logger via constructor injection.
 */
export class ${className} implements ${serviceInterfaceName} {

  readonly #repository: ${repoInterfaceName};
  readonly #logger: winston.Logger;

  public constructor(
    repository: ${repoInterfaceName},
    logger: winston.Logger
  ) {
    this.#repository = repository;
    this.#logger = logger;
  }

  public async getAll(): Promise<${interfaceName}[]> {
    try {
      return await this.#repository.findAll();
    } catch (error: unknown) {
      this.#logger.error("Failed to get all ${lowerName}s", { error });
      throw error;
    }
  }

  public async getById(id: ObjectId): Promise<${interfaceName} | null> {
    try {
      return await this.#repository.findById(id);
    } catch (error: unknown) {
      this.#logger.error("Failed to get ${lowerName} by id", { id, error });
      throw error;
    }
  }

  public async create(data: Omit<${interfaceName}, "_id">): Promise<${interfaceName}> {
    try {
      return await this.#repository.create(data);
    } catch (error: unknown) {
      this.#logger.error("Failed to create ${lowerName}", { error });
      throw error;
    }
  }

  public async update(
    id: ObjectId,
    data: Partial<${interfaceName}>
  ): Promise<${interfaceName} | null> {
    try {
      return await this.#repository.update(id, data);
    } catch (error: unknown) {
      this.#logger.error("Failed to update ${lowerName}", { id, error });
      throw error;
    }
  }

  public async delete${entityName}(id: ObjectId): Promise<boolean> {
    try {
      return await this.#repository.delete(id);
    } catch (error: unknown) {
      this.#logger.error("Failed to delete ${lowerName}", { id, error });
      throw error;
    }
  }
}
`;
}
