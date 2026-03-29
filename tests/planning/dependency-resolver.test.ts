import { describe, it, expect } from "bun:test";

import { resolveOrder } from "../../src/planning/dependency-resolver.mjs";

import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

function makeFeature(entityName: string, fieldNames: string[] = []): IFeatureSpec {
  return {
    name: entityName.toLowerCase(),
    entityName,
    pluralName: `${entityName.toLowerCase()}s`,
    collectionName: entityName.toLowerCase(),
    fields: fieldNames.map((name) => ({ name, type: "string" as const, required: false })),
    enums: [],
    indexes: [],
  };
}

describe("dependency-resolver", () => {
  describe("resolveOrder", () => {
    it("returns features in same order when no dependencies", () => {
      const features = [
        makeFeature("User"),
        makeFeature("Product"),
        makeFeature("Category"),
      ];
      const result = resolveOrder(features);
      expect(result)
.toHaveLength(3);
    });

    it("places dependency before dependent feature", () => {
      // WorkOrder has field "technicianId" which references Technician
      const features = [
        makeFeature("WorkOrder", ["title", "technicianId"]),
        makeFeature("Technician", ["firstName", "lastName"]),
      ];
      const result = resolveOrder(features);
      const workOrderIdx = result.findIndex((f) => f.entityName === "WorkOrder");
      const technicianIdx = result.findIndex((f) => f.entityName === "Technician");
      expect(technicianIdx)
.toBeLessThan(workOrderIdx);
    });

    it("handles multiple levels of dependency", () => {
      // Site <- Technician <- WorkOrder
      const features = [
        makeFeature("WorkOrder", ["technicianId"]),
        makeFeature("Technician", ["siteId"]),
        makeFeature("Site", ["name"]),
      ];
      const result = resolveOrder(features);
      const siteIdx = result.findIndex((f) => f.entityName === "Site");
      const techIdx = result.findIndex((f) => f.entityName === "Technician");
      const woIdx = result.findIndex((f) => f.entityName === "WorkOrder");
      expect(siteIdx)
.toBeLessThan(techIdx);
      expect(techIdx)
.toBeLessThan(woIdx);
    });

    it("throws on circular dependency", () => {
      const features = [
        makeFeature("A", ["bId"]),
        makeFeature("B", ["aId"]),
      ];
      expect(() => resolveOrder(features))
.toThrow("Circular dependency");
    });

    it("handles single feature with no dependencies", () => {
      const features = [makeFeature("User", ["name", "email"])];
      const result = resolveOrder(features);
      expect(result)
.toHaveLength(1);
      expect(result[0].entityName)
.toBe("User");
    });

    it("returns all features in output", () => {
      const features = [
        makeFeature("Alpha"),
        makeFeature("Beta"),
        makeFeature("Gamma"),
        makeFeature("Delta"),
      ];
      const result = resolveOrder(features);
      expect(result)
.toHaveLength(4);
      const names = result.map((f) => f.entityName);
      expect(names)
.toContain("Alpha");
      expect(names)
.toContain("Beta");
      expect(names)
.toContain("Gamma");
      expect(names)
.toContain("Delta");
    });
  });
});
