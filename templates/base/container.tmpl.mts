import type { IFeatureSpec, IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders getContainer() IoC factory.
 * Instantiates all repositories, calls init(), instantiates all services.
 */
export function renderContainer(context: IGenerationContext): string {
  const { features, projectName } = context;

  const repoImports = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `import { ${f.entityName}Repository } from "../features/${lowerName}/repository/${lowerName}-repository.mjs";`;
    })
    .join("\n");

  const serviceImports = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `import { ${f.entityName}Service } from "../features/${lowerName}/service/${lowerName}-service.mjs";`;
    })
    .join("\n");

  const repoInstances = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `  const ${lowerName}Repo = new ${f.entityName}Repository(databaseConfig, dbName, "${f.collectionName}", logger);
  await ${lowerName}Repo.init();`;
    })
    .join("\n");

  const serviceInstances = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `  const ${lowerName}Service = new ${f.entityName}Service(${lowerName}Repo, logger);`;
    })
    .join("\n");

  const repoProps = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `      ${lowerName}Repo,`;
    })
    .join("\n");

  const serviceProps = features
    .map((f: IFeatureSpec) => {
      const lowerName = f.entityName.charAt(0)
.toLowerCase() + f.entityName.slice(1);
      return `      ${lowerName}Service,`;
    })
    .join("\n");

  const safeProjectName = projectName.replace(/-/g, "");
  const dbVar = `${safeProjectName}Db`;

  return `import type winston from "winston";

import { createDatabaseConfiguration } from "./create-database-configuration.mjs";
import type { IContainer } from "./interfaces/i-container.mjs";
import { env } from "../env.mjs";
${repoImports}
${serviceImports}

/**
 * Constructs the application IoC container.
 * Connects to MongoDB, initializes repositories, and wires services.
 */
export async function getContainer(logger: winston.Logger): Promise<IContainer> {
  const databaseConfig = createDatabaseConfiguration(logger);
  const db = await databaseConfig.connect();

  const dbName = env.NODE_ENV === "production" ? "${projectName}-prod" : "${projectName}-dev";
  const ${dbVar} = db.db(dbName);

  void ${dbVar};

${repoInstances}

${serviceInstances}

  return {
    db,
    databaseConfig,
    repositories: {
${repoProps}
    },
    services: {
${serviceProps}
    },
    helpers: {},
  };
}
`;
}
