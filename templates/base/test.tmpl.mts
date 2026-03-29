import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

/**
 * Renders unit test stubs for the entity service.
 * Uses bun:test with in-memory mock repository.
 */
export function renderTest(feature: IFeatureSpec): string {
  const { entityName } = feature;
  const className = `${entityName}Service`;
  const interfaceName = `I${entityName}`;
  const repoInterfaceName = `I${entityName}Repository`;
  const lowerName = entityName.charAt(0)
.toLowerCase() + entityName.slice(1);

  return `import { describe, it, expect, mock } from "bun:test";

import type { ${interfaceName} } from "../../src/features/${lowerName}/interfaces/index.mjs";
import type { ${repoInterfaceName} } from "../../src/features/${lowerName}/repository/index.mjs";
import { ${className} } from "../../src/features/${lowerName}/service/${lowerName}-service.mjs";

const mockLogger = {
  info: mock(() => {}),
  error: mock(() => {}),
  warn: mock(() => {}),
  debug: mock(() => {}),
};

function createMockRepository(): ${repoInterfaceName} {
  return {
    findAll: mock(async () => [] as ${interfaceName}[]),
    findById: mock(async (_id: unknown) => null as ${interfaceName} | null),
    create: mock(async (data: unknown) => data as ${interfaceName}),
    update: mock(async (_id: unknown, _data: unknown) => null as ${interfaceName} | null),
    delete: mock(async (_id: unknown) => true),
    init: mock(async () => {}),
  };
}

describe("${className}", () => {
  it("getAll returns empty array when no records exist", async () => {
    const repo = createMockRepository();
    const service = new ${className}(repo, mockLogger as unknown as import("winston").Logger);
    const result = await service.getAll();
    expect(result).toEqual([]);
  });

  it("getById returns null when record not found", async () => {
    const repo = createMockRepository();
    const service = new ${className}(repo, mockLogger as unknown as import("winston").Logger);
    const result = await service.getById(
      "000000000000000000000000" as unknown as import("mongodb").ObjectId
    );
    expect(result).toBeNull();
  });

  it("create returns the created entity", async () => {
    const mockData: Omit<${interfaceName}, "_id"> = {} as Omit<${interfaceName}, "_id">;
    const repo = createMockRepository();
    (repo.create as ReturnType<typeof mock>).mockImplementation(
      async (data: unknown) => ({ ...data as object }) as ${interfaceName}
    );
    const service = new ${className}(repo, mockLogger as unknown as import("winston").Logger);
    const result = await service.create(mockData);
    expect(result).toBeDefined();
  });

  it("update returns null when record not found", async () => {
    const repo = createMockRepository();
    const service = new ${className}(repo, mockLogger as unknown as import("winston").Logger);
    const result = await service.update(
      "000000000000000000000000" as unknown as import("mongodb").ObjectId,
      {}
    );
    expect(result).toBeNull();
  });

  it("delete${entityName} returns true on success", async () => {
    const repo = createMockRepository();
    const service = new ${className}(repo, mockLogger as unknown as import("winston").Logger);
    const result = await service.delete${entityName}(
      "000000000000000000000000" as unknown as import("mongodb").ObjectId
    );
    expect(result).toBe(true);
  });
});
`;
}
