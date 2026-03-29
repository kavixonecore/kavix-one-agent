import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the MongoDB repository class for an entity.
 * Extends BaseRepository from @sylvesterllc/mongo.
 */
export function renderRepository(feature: IFeatureSpec): string {
  const { entityName, indexes } = feature;
  const className = `${entityName}Repository`;
  const interfaceName = `I${entityName}`;

  const indexLines = indexes
    .map((idx) => {
      const fieldObj = idx.fields
        .map((f) => `${f}: 1`)
        .join(", ");
      return `    await this.collection.createIndex(
      { ${fieldObj} },
      { unique: ${idx.unique}, name: "${idx.name}" }
    );`;
    })
    .join("\n");

  return `import type { MongoClient } from "mongodb";
import { BaseRepository } from "@sylvesterllc/mongo";
import type { IDatabase } from "@sylvesterllc/mongo";
import type winston from "winston";

import type { ${interfaceName} } from "../interfaces/index.mjs";

/**
 * MongoDB repository for ${entityName}.
 */
export class ${className} extends BaseRepository<MongoClient, ${interfaceName}> {

  public constructor(
    database: IDatabase<MongoClient>,
    dbName: string,
    collectionName: string,
    logger: winston.Logger
  ) {
    super(database, dbName, collectionName, logger);
  }

  public async init(): Promise<void> {
    await this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
${indexLines}
  }
}
`;
}
