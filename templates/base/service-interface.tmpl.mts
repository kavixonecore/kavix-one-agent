import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Renders the service interface for an entity.
 */
export function renderServiceInterface(feature: IFeatureSpec): string {
  const { entityName } = feature;
  const interfaceName = `I${entityName}`;
  const serviceInterfaceName = `I${entityName}Service`;
  const lowerName = entityName.charAt(0)
.toLowerCase() + entityName.slice(1);

  return `import type { ObjectId } from "mongodb";

import type { ${interfaceName} } from "../interfaces/index.mjs";

/**
 * Service interface for ${entityName} CRUD operations.
 */
export interface ${serviceInterfaceName} {

  getAll(): Promise<${interfaceName}[]>;
  getById(id: ObjectId): Promise<${interfaceName} | null>;
  create(data: Omit<${interfaceName}, "_id">): Promise<${interfaceName}>;
  update(id: ObjectId, data: Partial<${interfaceName}>): Promise<${interfaceName} | null>;
  delete${entityName}(id: ObjectId): Promise<boolean>;
}

export type { ${serviceInterfaceName} as I${entityName}ServiceContract };

export const ${lowerName}ServiceToken = Symbol("${serviceInterfaceName}");
`;
}
