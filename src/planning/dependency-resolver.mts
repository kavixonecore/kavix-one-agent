import { createLogger } from "../logger/logger.mjs";

import type { IFeatureSpec } from "../core/interfaces/index.mjs";

const logger = createLogger("dependency-resolver");

/**
 * Topologically sorts features based on field references to other entities.
 * A feature A depends on feature B if any of A's fields have a type matching
 * B's entityName or a name that references B's entityName.
 *
 * @param features - Features to sort
 * @throws {Error} When a circular dependency is detected
 */
export function resolveOrder(features: IFeatureSpec[]): IFeatureSpec[] {
  const entityNames = new Set(features.map((f) => f.entityName));
  const deps = buildDependencyMap(features, entityNames);

  logger.debug("Resolved dependency map", {
    features: features.map((f) => ({ name: f.entityName, deps: deps.get(f.entityName) })),
  });

  return topologicalSort(features, deps);
}

/**
 * Builds a map of entityName -> Set<dependsOn entityName>
 */
function buildDependencyMap(
  features: IFeatureSpec[],
  entityNames: Set<string>
): Map<string, Set<string>> {
  const deps = new Map<string, Set<string>>();

  for (const feature of features) {
    const featureDeps = new Set<string>();

    for (const field of feature.fields) {
      // Check if field name contains a reference to another entity (e.g., workOrderId)
      for (const entity of entityNames) {
        if (entity === feature.entityName) {
continue;
}

        const entityLower = entity.toLowerCase();
        const fieldLower = field.name.toLowerCase();

        // e.g., field name "workOrderId" references entity "WorkOrder"
        if (fieldLower.includes(entityLower) || field.type === entity) {
          featureDeps.add(entity);
        }
      }
    }

    deps.set(feature.entityName, featureDeps);
  }

  return deps;
}

function topologicalSort(
  features: IFeatureSpec[],
  deps: Map<string, Set<string>>
): IFeatureSpec[] {
  const sorted: IFeatureSpec[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const featureMap = new Map(features.map((f) => [f.entityName, f]));

  function visit(entityName: string): void {
    if (visited.has(entityName)) {
return;
}

    if (visiting.has(entityName)) {
      throw new Error(
        `Circular dependency detected involving entity: "${entityName}". ` +
        `Entities in cycle: ${[...visiting].join(" -> ")} -> ${entityName}`
      );
    }

    visiting.add(entityName);

    const featureDeps = deps.get(entityName) ?? new Set<string>();
    for (const dep of featureDeps) {
      if (featureMap.has(dep)) {
        visit(dep);
      }
    }

    visiting.delete(entityName);
    visited.add(entityName);

    const feature = featureMap.get(entityName);
    if (feature) {
      sorted.push(feature);
    }
  }

  for (const feature of features) {
    visit(feature.entityName);
  }

  logger.info("Resolved feature generation order", {
    order: sorted.map((f) => f.entityName),
  });

  return sorted;
}
