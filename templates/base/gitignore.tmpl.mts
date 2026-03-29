import type { IGenerationContext } from "../../src/core/interfaces/index.mjs";

/**
 * Renders .gitignore for a generated Elysia API project.
 */
export function renderGitignore(_context: IGenerationContext): string {
  return `# Dependencies
node_modules/

# Build output
dist/
build/

# Compiled JS from .mts sources
**/*.mjs
**/*.mjs.map
**/*.d.mts

# Environment
.env
.env.local
.env.*.local

# Execution trace output
.docs/

# Bun
bun.lock
bun.lockb

# Editor
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
`;
}
