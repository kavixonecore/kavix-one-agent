import { describe, it, expect } from "bun:test";

import { createPlan } from "../../src/planning/generation-planner.mjs";

import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

const rawFeatures: IFeatureSpec[] = [
  {
    name: "work-order",
    entityName: "WorkOrder",
    pluralName: "work-orders",
    collectionName: "workorder",
    fields: [
      { name: "title", type: "string", required: true },
      { name: "technicianId", type: "string", required: false },
    ],
    enums: [],
    indexes: [],
    description: "Work order entity",
  },
  {
    name: "technician",
    entityName: "Technician",
    pluralName: "technicians",
    collectionName: "technician",
    fields: [
      { name: "firstName", type: "string", required: true },
    ],
    enums: [],
    indexes: [],
  },
];

const singleFeature: IFeatureSpec[] = [
  {
    name: "product",
    entityName: "Product",
    pluralName: "products",
    collectionName: "product",
    fields: [{ name: "name", type: "string", required: true }],
    enums: [],
    indexes: [],
  },
];

describe("generation-planner", () => {
  describe("createPlan", () => {
    it("returns an IGenerationPlan with the correct projectName", () => {
      const plan = createPlan(rawFeatures, "my-api");
      expect(plan.projectName)
.toBe("my-api");
    });

    it("sets status to pending", () => {
      const plan = createPlan(rawFeatures, "my-api");
      expect(plan.status)
.toBe("pending");
    });

    it("sets createdAt and updatedAt as ISO timestamps", () => {
      const plan = createPlan(rawFeatures, "my-api");
      expect(plan.createdAt)
.toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(plan.updatedAt)
.toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("includes all features in the plan", () => {
      const plan = createPlan(rawFeatures, "my-api");
      expect(plan.features)
.toHaveLength(2);
    });

    it("orders features so dependencies come first", () => {
      const plan = createPlan(rawFeatures, "my-api");
      const techIdx = plan.features.findIndex((f) => f.entityName === "Technician");
      const woIdx = plan.features.findIndex((f) => f.entityName === "WorkOrder");
      expect(techIdx)
.toBeLessThan(woIdx);
    });

    it("normalises feature specs (entityName is PascalCase)", () => {
      const plan = createPlan(rawFeatures, "my-api");
      for (const feature of plan.features) {
        expect(feature.entityName.charAt(0))
.toBe(
          feature.entityName.charAt(0)
.toUpperCase()
        );
      }
    });

    it("injects default fields into features", () => {
      const plan = createPlan(singleFeature, "product-api");
      const product = plan.features[0];
      expect(product.fields.some((f) => f.name === "createdAt"))
.toBe(true);
      expect(product.fields.some((f) => f.name === "updatedAt"))
.toBe(true);
    });

    it("includes a project description", () => {
      const plan = createPlan(rawFeatures, "my-api");
      expect(plan.projectDescription)
.toBeTruthy();
    });
  });
});
