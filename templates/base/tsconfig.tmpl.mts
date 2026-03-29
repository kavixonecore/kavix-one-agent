import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders tsconfig.json for a generated Elysia API project.
 * Strict mode, ESNext, moduleDetection force, path aliases for monorepo readiness.
 */
export function renderTsConfig(context: IGenerationContext): string {
  const { projectScope, projectName } = context;

  return JSON.stringify(
    {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "Bundler",
        moduleDetection: "force",
        strict: true,
        noEmit: true,
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        esModuleInterop: true,
        skipLibCheck: true,
        outDir: "dist",
        baseUrl: ".",
        paths: {
          [`@${projectScope}/${projectName}/shared`]: ["libs/shared/src"],
        },
      },
      include: ["src/**/*.mts", "tests/**/*.ts"],
      exclude: ["node_modules", "dist"],
    },
    null,
    2
  );
}
