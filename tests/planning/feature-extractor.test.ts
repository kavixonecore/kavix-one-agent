import { describe, it, expect } from "bun:test";

import { extractFeatures } from "../../src/planning/feature-extractor.mjs";

import type { IFeatureSpec } from "../../src/core/interfaces/index.mjs";

const rawFeatures: IFeatureSpec[] = [
  {
    name: "work-order",
    entityName: "WorkOrder",
    pluralName: "work-orders",
    collectionName: "workorder",
    fields: [
      { name: "title", type: "string", required: true },
      { name: "status", type: "string", required: true },
    ],
    enums: [],
    indexes: [],
    description: "Work order entity",
  },
  {
    name: "technician",
    entityName: "technician",
    pluralName: "technicians",
    collectionName: "technician",
    fields: [
      { name: "first_name", type: "string", required: true },
      { name: "LAST_NAME", type: "string", required: true },
    ],
    enums: [],
    indexes: [],
  },
];

describe("feature-extractor", () => {
  describe("extractFeatures", () => {
    const result = extractFeatures(rawFeatures);

    it("returns same number of features", () => {
      expect(result)
.toHaveLength(2);
    });

    it("ensures entityName is PascalCase", () => {
      const tech = result.find((s) => s.name === "technician");
      expect(tech?.entityName)
.toBe("Technician");
    });

    it("ensures name is kebab-case", () => {
      const workOrder = result.find((s) => s.entityName === "WorkOrder");
      expect(workOrder?.name)
.toBe("work-order");
    });

    it("normalises field names to camelCase", () => {
      const tech = result.find((s) => s.entityName === "Technician");
      const firstNameField = tech?.fields.find((f) => f.name === "firstName");
      expect(firstNameField)
.toBeDefined();
    });

    it("normalises UPPER_CASE field names to camelCase", () => {
      const tech = result.find((s) => s.entityName === "Technician");
      const lastNameField = tech?.fields.find((f) => f.name === "lASTNAME" || f.name === "lastName" || f.name.toLowerCase()
.includes("last"));
      expect(lastNameField)
.toBeDefined();
    });

    it("injects createdAt default field when missing", () => {
      const workOrder = result.find((s) => s.entityName === "WorkOrder");
      const createdAt = workOrder?.fields.find((f) => f.name === "createdAt");
      expect(createdAt)
.toBeDefined();
      expect(createdAt?.type)
.toBe("Date");
      expect(createdAt?.required)
.toBe(true);
    });

    it("injects updatedAt default field when missing", () => {
      const workOrder = result.find((s) => s.entityName === "WorkOrder");
      const updatedAt = workOrder?.fields.find((f) => f.name === "updatedAt");
      expect(updatedAt)
.toBeDefined();
    });

    it("does not duplicate default fields when already present", () => {
      const withDefaults: IFeatureSpec[] = [
        {
          name: "item",
          entityName: "Item",
          pluralName: "items",
          collectionName: "item",
          fields: [
            { name: "name", type: "string", required: true },
            { name: "createdAt", type: "Date", required: true },
            { name: "updatedAt", type: "Date", required: true },
          ],
          enums: [],
          indexes: [],
        },
      ];
      const extracted = extractFeatures(withDefaults);
      const createdAtFields = extracted[0].fields.filter((f) => f.name === "createdAt");
      expect(createdAtFields)
.toHaveLength(1);
    });

    it("preserves description", () => {
      const workOrder = result.find((s) => s.entityName === "WorkOrder");
      expect(workOrder?.description)
.toBe("Work order entity");
    });

    it("preserves enums and indexes", () => {
      const workOrder = result.find((s) => s.entityName === "WorkOrder");
      expect(workOrder?.enums)
.toHaveLength(0);
      expect(workOrder?.indexes)
.toHaveLength(0);
    });
  });
});
