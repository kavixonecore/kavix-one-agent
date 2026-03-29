import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders eslint.config.mjs for a generated project.
 * Canonical flat config: @eslint/js, typescript-eslint, @stylistic, import, jsdoc.
 */
export function renderEslintConfig(_context: IGenerationContext): string {
  return `import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vscode/**",
      ".git/**",
      "iac/**",
      "docs/**",
      "bun.lock",
      "bun.lockb",
      "**/*.mjs",
      "**/*.d.mts",
      ".docs/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@stylistic": stylistic,
      import: importPlugin,
      jsdoc,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@stylistic/max-len": [
        "warn",
        {
          code: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quotes": [
        "error",
        "double",
        { avoidEscape: true, allowTemplateLiterals: "always" },
      ],
      "@stylistic/comma-dangle": [
        "error",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "never",
        },
      ],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: false }],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", ["parent", "sibling", "index"], "object", "type"],
          "newlines-between": "always",
        },
      ],
      "no-duplicate-imports": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-console": "warn",
      "eqeqeq": ["error", "always"],
    },
  },
  {
    files: ["**/*.mts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
`;
}
