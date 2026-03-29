import { describe, it, expect } from "bun:test";

import { awsCdkTemplate } from "../../templates/addons/aws-cdk/index.mjs";
import { TemplateType } from "../../src/core/enums/index.mjs";
import { configurationFixture } from "../fixtures/configuration.fixture.ts";

import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

const context: IGenerationContext = {
  projectName: "my-api",
  projectScope: "my-api",
  outputDir: "/tmp/out",
  features: [configurationFixture],
  dryRun: true,
};

describe("aws-cdk addon", () => {
  describe("template metadata", () => {
    it("has name aws-cdk", () => {
      expect(awsCdkTemplate.name)
.toBe("aws-cdk");
    });

    it("has type ADDON", () => {
      expect(awsCdkTemplate.type)
.toBe(TemplateType.ADDON);
    });

    it("has a non-empty description", () => {
      expect(awsCdkTemplate.description.length)
.toBeGreaterThan(0);
    });
  });

  describe("plan()", () => {
    const planned = awsCdkTemplate.plan(configurationFixture);

    it("returns 5 files", () => {
      expect(planned)
.toHaveLength(5);
    });

    it("includes bin/app.ts", () => {
      expect(planned.some((f) => f.path === "infrastructure/cdk/bin/app.ts"))
.toBe(true);
    });

    it("includes lib/stack.ts", () => {
      expect(planned.some((f) => f.path === "infrastructure/cdk/lib/stack.ts"))
.toBe(true);
    });

    it("includes cdk.json", () => {
      expect(planned.some((f) => f.path === "infrastructure/cdk/cdk.json"))
.toBe(true);
    });

    it("includes package.json", () => {
      expect(planned.some((f) => f.path === "infrastructure/cdk/package.json"))
.toBe(true);
    });

    it("includes tsconfig.json", () => {
      expect(planned.some((f) => f.path === "infrastructure/cdk/tsconfig.json"))
.toBe(true);
    });
  });

  describe("render()", () => {
    const rendered = awsCdkTemplate.render(configurationFixture, context);

    it("returns 5 rendered files", () => {
      expect(rendered)
.toHaveLength(5);
    });

    it("bin/app.ts contains CDK app instantiation", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/bin/app.ts");
      expect(file?.content)
.toContain("new cdk.App()");
    });

    it("bin/app.ts imports the stack", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/bin/app.ts");
      expect(file?.content)
.toContain("MyApiStack");
    });

    it("lib/stack.ts contains VPC", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/lib/stack.ts");
      expect(file?.content)
.toContain("ec2.Vpc");
    });

    it("lib/stack.ts contains ECS Fargate service", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/lib/stack.ts");
      expect(file?.content)
.toContain("ApplicationLoadBalancedFargateService");
    });

    it("lib/stack.ts contains DocumentDB", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/lib/stack.ts");
      expect(file?.content)
.toContain("docdb.DatabaseCluster");
    });

    it("lib/stack.ts contains Secrets Manager", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/lib/stack.ts");
      expect(file?.content)
.toContain("secretsManager.Secret");
    });

    it("lib/stack.ts does NOT include SQS when no queue in description", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/lib/stack.ts");
      expect(file?.content).not.toContain("sqs.Queue");
    });

    it("lib/stack.ts includes SQS when feature description mentions queue", () => {
      const queueFeature = {
        ...configurationFixture,
        description: "Processes items via queue",
      };
      const queueRendered = awsCdkTemplate.render(queueFeature, context);
      const stack = queueRendered.find((f) => f.path === "infrastructure/cdk/lib/stack.ts");
      expect(stack?.content)
.toContain("sqs.Queue");
    });

    it("cdk.json contains app entry point", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/cdk.json");
      expect(file?.content)
.toContain("ts-node");
      expect(file?.content)
.toContain("bin/app.ts");
    });

    it("package.json contains aws-cdk-lib dependency", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/package.json");
      expect(file?.content)
.toContain("aws-cdk-lib");
    });

    it("tsconfig.json has strict mode enabled", () => {
      const file = rendered.find((f) => f.path === "infrastructure/cdk/tsconfig.json");
      expect(file?.content)
.toContain('"strict": true');
    });
  });

  describe("validate()", () => {
    it("returns valid=true for correct set of files", () => {
      const rendered = awsCdkTemplate.render(configurationFixture, context);
      const result = awsCdkTemplate.validate(rendered);
      expect(result.valid)
.toBe(true);
      expect(result.errors)
.toHaveLength(0);
    });

    it("returns valid=false when lib/stack.ts is missing", () => {
      const rendered = awsCdkTemplate.render(configurationFixture, context);
      const withoutStack = rendered.filter((f) => f.path !== "infrastructure/cdk/lib/stack.ts");
      const result = awsCdkTemplate.validate(withoutStack);
      expect(result.valid)
.toBe(false);
      expect(result.errors.some((e) => e.includes("stack.ts")))
.toBe(true);
    });

    it("returns valid=false when a file has empty content", () => {
      const rendered = awsCdkTemplate.render(configurationFixture, context);
      const withEmpty = rendered.map((f) =>
        f.path === "infrastructure/cdk/cdk.json" ? { ...f, content: "" } : f
      );
      const result = awsCdkTemplate.validate(withEmpty);
      expect(result.valid)
.toBe(false);
    });
  });
});
