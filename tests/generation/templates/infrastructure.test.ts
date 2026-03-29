import { describe, it, expect } from "bun:test";

import { renderPackageJson } from "../../../templates/base/package-json.tmpl.mts";
import { renderTsConfig } from "../../../templates/base/tsconfig.tmpl.mts";
import { renderEslintConfig } from "../../../templates/base/eslint-config.tmpl.mts";
import { renderGitignore } from "../../../templates/base/gitignore.tmpl.mts";
import { renderEnvExample } from "../../../templates/base/env-example.tmpl.mts";
import { renderDockerCompose } from "../../../templates/base/docker-compose.tmpl.mts";

import type { IGenerationContext } from "../../../src/core/interfaces/index.mjs";

const testContext: IGenerationContext = {
  projectName: "my-api",
  projectScope: "myorg",
  outputDir: "/tmp/test-output",
  features: [],
  dryRun: false,
};

describe("package-json.tmpl.mts", () => {
  const output = renderPackageJson(testContext);
  const parsed = JSON.parse(output) as Record<string, unknown>;

  it("produces valid JSON", () => {
    expect(parsed)
.toBeDefined();
  });

  it("has scoped name @myorg/my-api", () => {
    expect(parsed["name"])
.toBe("@myorg/my-api");
  });

  it("has type: module", () => {
    expect(parsed["type"])
.toBe("module");
  });

  it("has required scripts", () => {
    const scripts = parsed["scripts"] as Record<string, string>;
    expect(scripts["start"])
.toBeDefined();
    expect(scripts["test"])
.toBeDefined();
    expect(scripts["lint"])
.toBeDefined();
    expect(scripts["lint:fix"])
.toBeDefined();
  });

  it("has elysia in dependencies", () => {
    const deps = parsed["dependencies"] as Record<string, string>;
    expect(deps["elysia"])
.toBeDefined();
  });

  it("has @sylvesterllc/mongo in dependencies", () => {
    const deps = parsed["dependencies"] as Record<string, string>;
    expect(deps["@sylvesterllc/mongo"])
.toBeDefined();
  });

  it("has eslint devDependencies", () => {
    const devDeps = parsed["devDependencies"] as Record<string, string>;
    expect(devDeps["eslint"])
.toBeDefined();
    expect(devDeps["typescript-eslint"])
.toBeDefined();
  });
});

describe("tsconfig.tmpl.mts", () => {
  const output = renderTsConfig(testContext);
  const parsed = JSON.parse(output) as { compilerOptions: Record<string, unknown> };

  it("produces valid JSON", () => {
    expect(parsed)
.toBeDefined();
  });

  it("has strict: true", () => {
    expect(parsed.compilerOptions["strict"])
.toBe(true);
  });

  it("has target ESNext", () => {
    expect(parsed.compilerOptions["target"])
.toBe("ESNext");
  });

  it("has moduleDetection: force", () => {
    expect(parsed.compilerOptions["moduleDetection"])
.toBe("force");
  });

  it("has path alias for shared lib", () => {
    const paths = parsed.compilerOptions["paths"] as Record<string, string[]>;
    expect(paths["@myorg/my-api/shared"])
.toBeDefined();
  });
});

describe("eslint-config.tmpl.mts", () => {
  const output = renderEslintConfig(testContext);

  it("uses flat config format", () => {
    expect(output)
.toContain("export default tseslint.config(");
  });

  it("imports all 5 required plugins", () => {
    expect(output)
.toContain("@eslint/js");
    expect(output)
.toContain("@stylistic/eslint-plugin");
    expect(output)
.toContain("eslint-plugin-import");
    expect(output)
.toContain("eslint-plugin-jsdoc");
    expect(output)
.toContain("typescript-eslint");
  });

  it("sets no-explicit-any to error", () => {
    expect(output)
.toContain('"@typescript-eslint/no-explicit-any": "error"');
  });

  it("sets explicit-function-return-type to error", () => {
    expect(output)
.toContain('"@typescript-eslint/explicit-function-return-type"');
  });

  it("sets explicit-module-boundary-types to error", () => {
    expect(output)
.toContain('"@typescript-eslint/explicit-module-boundary-types": "error"');
  });

  it("uses double quotes rule", () => {
    expect(output)
.toContain('"double"');
  });

  it("has semi: always rule", () => {
    expect(output)
.toContain('"@stylistic/semi"');
  });
});

describe("gitignore.tmpl.mts", () => {
  const output = renderGitignore(testContext);

  it("includes node_modules", () => {
    expect(output)
.toContain("node_modules");
  });

  it("includes dist", () => {
    expect(output)
.toContain("dist/");
  });

  it("includes .env", () => {
    expect(output)
.toContain(".env");
  });

  it("includes .docs", () => {
    expect(output)
.toContain(".docs/");
  });

  it("includes bun.lock", () => {
    expect(output)
.toContain("bun.lock");
  });
});

describe("env-example.tmpl.mts", () => {
  const output = renderEnvExample(testContext);

  it("has NODE_ENV variable", () => {
    expect(output)
.toContain("NODE_ENV");
  });

  it("has MONGO_ variables", () => {
    expect(output)
.toContain("MONGO_HOSTNAME");
    expect(output)
.toContain("MONGO_USERNAME");
    expect(output)
.toContain("MONGO_PASSWORD");
  });
});

describe("docker-compose.tmpl.mts", () => {
  const output = renderDockerCompose(testContext);

  it("has MongoDB service", () => {
    expect(output)
.toContain("mongodb");
  });

  it("has port mapping for 27017", () => {
    expect(output)
.toContain("27017:27017");
  });

  it("has volume for data persistence", () => {
    expect(output)
.toContain("volumes:");
  });

  it("has root user environment variables", () => {
    expect(output)
.toContain("MONGO_INITDB_ROOT_USERNAME");
    expect(output)
.toContain("MONGO_INITDB_ROOT_PASSWORD");
  });
});
