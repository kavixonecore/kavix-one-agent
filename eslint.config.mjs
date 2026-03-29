import js from "@eslint/js";
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
      "infrastructure/**",
      "docs/**",
      "bun.lock",
      "bun.lockb",
      "**/*.mjs",
      "**/*.mjs.map",
      "**/*.d.mts",
      ".docs/**",
      ".ai/**",
      "tests/__tmp*/**",
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
      // TypeScript — MODIFIED from ct-ai-photo-qc
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
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],

      // Stylistic
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
      "@stylistic/computed-property-spacing": ["error", "never"],
      "@stylistic/space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
      "@stylistic/space-infix-ops": "error",
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
      "@stylistic/comma-spacing": ["error", { before: false, after: true }],
      "@stylistic/comma-style": ["error", "last"],
      "@stylistic/lines-between-class-members": [
        "error",
        "always",
        { exceptAfterSingleLine: false },
      ],
      "@stylistic/no-multiple-empty-lines": [
        "error",
        { max: 2, maxEOF: 0, maxBOF: 0 },
      ],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/newline-per-chained-call": [
        "error",
        { ignoreChainWithDepth: 1 },
      ],
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/arrow-spacing": ["error", { before: true, after: true }],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: false }],

      // Import ordering
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          "newlines-between": "always",
        },
      ],
      "no-duplicate-imports": "error",
      "sort-imports": "off",

      // Code quality
      "no-var": "error",
      "prefer-const": "error",
      "no-console": "warn",
      "eqeqeq": ["error", "always"],
      "no-useless-concat": "error",
      "curly": ["error", "all"],

      // JSDoc
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-indentation": "warn",
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
