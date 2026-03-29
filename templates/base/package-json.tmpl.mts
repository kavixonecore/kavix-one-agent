import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders package.json for a generated Elysia API project.
 */
export function renderPackageJson(context: IGenerationContext): string {
  const { projectName, projectScope } = context;
  const scopedName = `@${projectScope}/${projectName}`;

  return JSON.stringify(
    {
      name: scopedName,
      version: "0.1.0",
      type: "module",
      description: `${projectName} API`,
      scripts: {
        start: "bun run src/index.mts",
        dev: "bun --watch run src/index.mts",
        test: "bun test",
        lint: "eslint .",
        "lint:fix": "eslint . --fix",
      },
      dependencies: {
        "@elysiajs/cors": "^1.3.3",
        "@elysiajs/swagger": "^1.3.2",
        "@sylvesterllc/mongo": "^1.0.0",
        "@sylvesterllc/utils": "^1.0.0",
        elysia: "^1.3.3",
        luxon: "^3.5.0",
        mongodb: "^7.0.0",
        ulidx: "^2.4.0",
        winston: "^3.17.0",
        zod: "^3.24.2",
      },
      devDependencies: {
        "@eslint/js": "^9.39.0",
        "@stylistic/eslint-plugin": "^5.5.0",
        "@types/bun": "latest",
        "@types/luxon": "^3.4.2",
        "eslint": "^9.39.0",
        "eslint-plugin-import": "^2.31.0",
        "eslint-plugin-jsdoc": "^61.1.12",
        "typescript": "^5.8.3",
        "typescript-eslint": "^8.46.3",
      },
    },
    null,
    2
  );
}
