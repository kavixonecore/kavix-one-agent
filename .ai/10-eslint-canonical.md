# Canonical ESLint Configuration for Agent-One

> **Date:** 2026-03-28
> **Base:** ct-ai-photo-qc eslint.config.mjs (most complete config)
> **Modifications:** 3 rules changed from base to match CLAUDE.md standards

---

## Audit Summary

### Projects Reviewed

| Project | Has ESLint Config | Config Type | Plugins |
|---------|------------------|-------------|---------|
| cmms | Yes | Flat (eslint.config.mjs) | @eslint/js, typescript-eslint, jsdoc, @stylistic |
| utils | No | N/A | N/A |
| youtube-daily-digest | No (broken script) | N/A | N/A |
| smartsheet-api | Yes | Flat (eslint.config.mjs) | @eslint/js, typescript-eslint, jsdoc |
| ct-ai-photo-qc | Yes | Flat (eslint.config.mjs) | @eslint/js, typescript-eslint, jsdoc, @stylistic, import |

### Conflict Resolution

| Setting | CLAUDE.md (before) | Actual ESLint Configs | Decision | Action |
|---------|-------------------|----------------------|----------|--------|
| Quotes | Single | Double | **Double** | Updated CLAUDE.md line 85 |
| no-explicit-any | Never use any | Off | **error** | New rule for agent-one config |
| explicit-function-return-type | All functions must have return types | Off | **error** | New rule for agent-one config |
| Base config | N/A | ct-ai-photo-qc | **ct-ai-photo-qc** | Most complete, has all plugins |

---

## Canonical Config for Generated Projects

Based on ct-ai-photo-qc with 3 modifications:

### Plugins Required (devDependencies)

```json
{
  "@eslint/js": "^9.39.0",
  "@stylistic/eslint-plugin": "^5.5.0",
  "eslint": "^9.39.0",
  "eslint-plugin-import": "^2.31.0",
  "eslint-plugin-jsdoc": "^61.1.12",
  "typescript-eslint": "^8.46.3"
}
```

### Rules Changed from ct-ai-photo-qc Base

```javascript
// CHANGED: was "off", now "error" per CLAUDE.md "Never use any"
"@typescript-eslint/no-explicit-any": "error",

// CHANGED: was "off", now "error" per CLAUDE.md "All functions must have explicit return types"
"@typescript-eslint/explicit-function-return-type": ["error", {
  allowExpressions: true,           // Allow arrow functions in callbacks
  allowTypedFunctionExpressions: true, // Allow typed const f: Type = () => {}
  allowHigherOrderFunctions: true,  // Allow HOFs
}],

// CHANGED: was "off", now "error" per CLAUDE.md "explicit return types and access modifiers"
"@typescript-eslint/explicit-module-boundary-types": "error",
```

### Full Rule Set (Inherited from ct-ai-photo-qc, with modifications)

**Formatting (@stylistic):**
- max-len: 100 chars (ignores URLs, strings, templates, regex)
- indent: off (custom)
- no-trailing-spaces: error
- object-curly-spacing: always
- array-bracket-spacing: never
- computed-property-spacing: never
- space-before-function-paren: anonymous always, named never, asyncArrow always
- keyword-spacing: before/after true
- space-infix-ops: error
- semi: always
- quotes: double (avoidEscape, allowTemplateLiterals)
- comma-dangle: always-multiline (arrays/objects/imports/exports), never (functions)
- comma-spacing: before false, after true
- comma-style: last
- lines-between-class-members: always (no exceptAfterSingleLine)
- no-multiple-empty-lines: max 2, maxEOF 0, maxBOF 0
- eol-last: always
- padding-line-between-statements: blank line before/after class declarations
- newline-per-chained-call: ignoreChainWithDepth 1 (Elysia router style)
- arrow-parens: always
- arrow-spacing: before/after true
- brace-style: 1tbs, no singleLine

**Imports:**
- import/order: builtin → external → [parent/sibling/index] → object → type (newlines between)
- @typescript-eslint/consistent-type-imports: type-imports, separate-type-imports fixStyle
- no-duplicate-imports: error
- sort-imports: off

**TypeScript (MODIFIED):**
- @typescript-eslint/no-explicit-any: **error** (was off)
- @typescript-eslint/explicit-function-return-type: **error** (was off)
- @typescript-eslint/explicit-module-boundary-types: **error** (was off)
- @typescript-eslint/no-unused-vars: warn (argsIgnorePattern: ^_, varsIgnorePattern: ^_)

**Code Quality:**
- prefer-arrow-callback: off
- curly: all
- camelcase: off
- no-var: error
- prefer-const: error
- no-console: warn
- eqeqeq: always
- prefer-template: off
- no-useless-concat: error

**JSDoc:**
- require-jsdoc: off
- require-description: off
- check-alignment: warn
- check-indentation: warn
- tag-lines: warn (any, startLines 1, endLines 0)

### Ignore Patterns

```javascript
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
  ".docs/**",          // Execution trace output
]
```

### Lint Scripts for Generated Projects

```json
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```

### Agent-One Post-Generation Lint Requirement

Per CLAUDE.md and PRD verification gates:
- `eslint --fix` runs after **every** generation step (per feature)
- Any remaining errors after --fix block the feature from being marked complete
- Lint errors are captured in the trace entry for that step

---

## Future: @sylvesterllc/eslint-config Package

Consider publishing this canonical config as `@sylvesterllc/eslint-config` so all projects (cmms, smartsheet-api, ct-ai-photo-qc, and agent-one generated projects) share the same rules. This would:
- Eliminate config drift across projects
- Make agent-one generated configs a one-liner: `import config from "@sylvesterllc/eslint-config"`
- Allow rule updates to propagate to all projects at once
