import type { IFeatureSpec, IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the IContainer interface for the IoC container.
 */
export function renderContainerInterface(
  context: IGenerationContext
): string {
  const { features } = context;

  const repoProps = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `  ${lowerName}Repo: ${f.entityName}Repository;`;
    })
    .join("\n");

  const serviceProps = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `  ${lowerName}Service: I${f.entityName}Service;`;
    })
    .join("\n");

  const repoImports = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `import type { ${f.entityName}Repository } from "../features/${lowerName}/repository/index.mjs";`;
    })
    .join("\n");

  const serviceImports = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `import type { I${f.entityName}Service } from "../features/${lowerName}/service/index.mjs";`;
    })
    .join("\n");

  return `import type { MongoClient } from "mongodb";
import type { IDatabase } from "@sylvesterllc/mongo";

${repoImports}
${serviceImports}

/**
 * IoC container interface — returned by getContainer().
 */
export interface IContainer {

  db: MongoClient;
  databaseConfig: IDatabase<MongoClient>;
  repositories: {
${repoProps}
  };
  services: {
${serviceProps}
  };
  helpers: Record<string, unknown>;
}
`;
}
