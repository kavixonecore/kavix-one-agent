import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the RepositoryFactory — DB-agnostic repository resolution.
 */
export function renderRepositoryFactory(_context: IGenerationContext): string {
  return `import type { IDatabase, IRepository } from "@sylvesterllc/mongo";
import type winston from "winston";

/**
 * Configuration for a repository factory entry.
 */
export interface IRepositoryFactoryConfig<D, T> {
  database: IDatabase<D>;
  dbName: string;
  collectionName: string;
  logger: winston.Logger;
  RepositoryClass: new (
    database: IDatabase<D>,
    dbName: string,
    collectionName: string,
    logger: winston.Logger
  ) => IRepository<D, T>;
}

/**
 * DB-agnostic factory that creates typed repository instances.
 * Allows swapping database backends without touching service/router code.
 */
export function createRepository<D, T>(
  config: IRepositoryFactoryConfig<D, T>
): IRepository<D, T> {
  return new config.RepositoryClass(
    config.database,
    config.dbName,
    config.collectionName,
    config.logger
  );
}
`;
}
