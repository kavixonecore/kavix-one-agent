import { describe, it, expect } from "bun:test";

import { parsePrd } from "../../src/input/prd-parser.mjs";

const samplePrdWithFeatureSections = `
# PRD: Work Order Management API

## Features

- [ ] WorkOrder
- [ ] Technician

### Feature: WorkOrder
> Tracks work orders in the system.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | yes | Title of the work order |
| status | string | yes | Current status |
| priority | number | no | Priority level |
| assignedTo | string | no | Assigned technician ID |

### Feature: Technician
> Field technician entity.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | required | First name |
| lastName | string | required | Last name |
| email | string | required | Email address |
| isActive | boolean | yes | Active status |
`;

const samplePrdWithListFields = `
# PRD: Inventory API

### Feature: Product
> A product in the inventory.

- name: string (required)
- sku: string (required)
- price: number (required)
- stock: number (required)
- description: string (optional)
`;

const checkboxOnlyPrd = `
# PRD: Simple API

## Features

- [ ] user-management
- [ ] product-catalog
- [x] already-done
`;

describe("prd-parser", () => {
  describe("parsePrd with Feature sections and table fields", () => {
    const specs = parsePrd(samplePrdWithFeatureSections);

    it("returns one spec per Feature section", () => {
      expect(specs)
.toHaveLength(2);
    });

    it("sets entityName to PascalCase from section heading", () => {
      const workOrder = specs.find((s) => s.entityName === "WorkOrder");
      expect(workOrder)
.toBeDefined();
    });

    it("sets name to kebab-case", () => {
      const workOrder = specs.find((s) => s.entityName === "WorkOrder");
      expect(workOrder?.name)
.toBe("work-order");
    });

    it("derives pluralName from name", () => {
      const workOrder = specs.find((s) => s.entityName === "WorkOrder");
      expect(workOrder?.pluralName)
.toBe("work-orders");
    });

    it("derives collectionName from entityName", () => {
      const workOrder = specs.find((s) => s.entityName === "WorkOrder");
      expect(workOrder?.collectionName)
.toBe("workorder");
    });

    it("parses table fields with required status", () => {
      const workOrder = specs.find((s) => s.entityName === "WorkOrder");
      const titleField = workOrder?.fields.find((f) => f.name === "title");
      expect(titleField)
.toBeDefined();
      expect(titleField?.type)
.toBe("string");
      expect(titleField?.required)
.toBe(true);
    });

    it("parses table fields with optional status", () => {
      const workOrder = specs.find((s) => s.entityName === "WorkOrder");
      const priorityField = workOrder?.fields.find((f) => f.name === "priority");
      expect(priorityField)
.toBeDefined();
      expect(priorityField?.type)
.toBe("number");
      expect(priorityField?.required)
.toBe(false);
    });

    it("parses boolean field type", () => {
      const tech = specs.find((s) => s.entityName === "Technician");
      const activeField = tech?.fields.find((f) => f.name === "isActive");
      expect(activeField?.type)
.toBe("boolean");
    });

    it("includes the description from blockquote", () => {
      const workOrder = specs.find((s) => s.entityName === "WorkOrder");
      expect(workOrder?.description)
.toContain("work orders");
    });

    it("initializes enums and indexes as empty arrays", () => {
      specs.forEach((spec) => {
        expect(spec.enums)
.toHaveLength(0);
        expect(spec.indexes)
.toHaveLength(0);
      });
    });
  });

  describe("parsePrd with list-style fields", () => {
    const specs = parsePrd(samplePrdWithListFields);

    it("parses features from Feature sections", () => {
      expect(specs)
.toHaveLength(1);
      expect(specs[0].entityName)
.toBe("Product");
    });

    it("parses required list fields", () => {
      const name = specs[0].fields.find((f) => f.name === "name");
      expect(name?.required)
.toBe(true);
    });

    it("parses optional list fields", () => {
      const desc = specs[0].fields.find((f) => f.name === "description");
      expect(desc?.required)
.toBe(false);
    });
  });

  describe("parsePrd with checkbox-only format", () => {
    const specs = parsePrd(checkboxOnlyPrd);

    it("only parses unchecked checkboxes", () => {
      expect(specs)
.toHaveLength(2);
    });

    it("converts kebab-case name to PascalCase entityName", () => {
      const userMgmt = specs.find((s) => s.entityName === "UserManagement");
      expect(userMgmt)
.toBeDefined();
    });

    it("does not include already-checked features", () => {
      const alreadyDone = specs.find((s) => s.name === "already-done");
      expect(alreadyDone)
.toBeUndefined();
    });

    it("provides default fields when no field definitions found", () => {
      specs.forEach((spec) => {
        expect(spec.fields.length)
.toBeGreaterThan(0);
      });
    });
  });

  describe("parsePrd with empty content", () => {
    it("returns empty array for empty string", () => {
      const specs = parsePrd("");
      expect(specs)
.toHaveLength(0);
    });

    it("returns empty array for content with no features", () => {
      const specs = parsePrd("# Just a heading\n\nSome text with no features.");
      expect(specs)
.toHaveLength(0);
    });
  });
});
