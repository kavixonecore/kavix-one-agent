import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Renders an index.mts barrel file that re-exports all sibling files.
 */
export function renderBarrel(
  featureName: string,
  layer: string,
  files: string[]
): string {
  const exports = files
    .map((f) => `export * from "./${f}.mjs";`)
    .join("\n");

  return `// Barrel export for ${featureName}/${layer}
${exports}
`;
}

/**
 * Returns the expected file names (without extension) for a feature layer.
 */
export function getLayerFiles(
  feature: IFeatureSpec,
  layer: string
): string[] {
  const lowerName = feature.entityName.charAt(0)
.toLowerCase() + feature.entityName.slice(1);

  const layerMap: Record<string, string[]> = {
    interfaces: [`i-${lowerName}`],
    validation: [`${lowerName}.validation`],
    repository: [`${lowerName}-repository`],
    service: [`${lowerName}-service`, `i-${lowerName}-service`],
    docs: [`${lowerName}-swagger`],
  };

  return layerMap[layer] ?? [];
}
