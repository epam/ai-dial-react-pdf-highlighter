# AI agents — ai-dial-react-pdf-highlighter

This file is read by Cursor, Codex, Claude Code, and other agent harnesses alongside project
context. It defines how AI assistants should work in this repository.

## Product

- **What**: `@epam/ai-dial-react-pdf-highlighter` — React component library for PDF viewing and
  highlight annotation, wrapping `@epam/pdf-highlighter-kit` with a higher-level API.
- **Stack**: React 18+, TypeScript strict, Vite library mode, Tailwind CSS, `@epam/ai-dial-ui-kit`
  components, Storybook v10, Vitest.
- **Published to**: npm as `@epam/ai-dial-react-pdf-highlighter`.
- **Tests**: Vitest + React Testing Library (`npm run test:run`); see
  [.github/instructions/testing.instructions.md](.github/instructions/testing.instructions.md).

## Agent principles

1. **Read before edit** — Open related files (component, stories, spec, `src/index.ts`) before
   changing behavior or API.
2. **Minimal diffs** — Solve the task only; no unrelated refactors or reformatting of untouched
   code.
3. **Verify** — After substantive changes run `npm run typecheck`, `npm run lint:check`, and
   `npm run test:run`. Use `get_errors` on modified files to validate TypeScript compilation.
4. **Security** — Do not commit secrets; treat `.env*` files as sensitive.
5. **Delegation mindset** — For large features, split: plan → implement component → stories →
   tests → export; ask the user if scope is unclear.

## Component work checklist

- **Naming**: Exported components use `PascalCase` (e.g. `PdfViewer`, `DocumentPreview`).
- **Files**: Colocate `Component.tsx`, `Component.stories.tsx`, `Component.spec.tsx` under
  `src/components/<Name>/`.
- **API**: Export prop types when consumers need them.
- **Styles**: Use `@epam/ai-dial-ui-kit` components and Tailwind design tokens.
- **Barrel**: Add public exports to `src/index.ts` (and `export type` for types).

## When working with @epam/ai-dial-ui-kit

When implementing or modifying components, forms, or UI built with `@epam/ai-dial-ui-kit`, the `ai-dial-ui-kit` MCP server enables you to discover components, read exact prop signatures, access code examples, and understand design tokens and available utilities.

## Component-First Development

**Always prefer UI kit components over raw HTML elements.** Before reaching for native `<button>`, `<input>`, `<select>`, or other HTML elements:

1. **Look for a UI kit component** — Check if a suitable `Dial*` component exists for your use case
2. **Use raw elements only as last resort** — If and only if no UI kit component meets the requirements, use native HTML (and document why)

## MCP Tools

Use these two tools for all UI kit discovery and documentation needs: `searchEntity(entity, query?)` and `getEntityDetails(entity, name?)`.

Do not use `grep`, `glob`, `find`, or similar file system tools to discover components. The MCP tools provide accurate, structured metadata. File system searches miss examples, miss type information, and are slower.

## Project structure

| Area       | Location                         | Notes                               |
| ---------- | -------------------------------- | ----------------------------------- |
| Components | `src/components/<Name>/`         | Component + stories + spec          |
| Constants  | `src/constants/`                 | `pdf-viewer.constants.ts`           |
| Utilities  | `src/utils/`                     | `isPdfFile`, `pdf-viewer.utils`     |
| Public API | `src/index.ts`                   | All public exports                  |
| Styles     | `src/styles/tailwind-entry.scss` | Tailwind entry; compiled to `dist/` |
| MCP server | `src/mcp/`                       | Built to `dist/mcp-server.cjs`      |

## When to add or update

| Change                         | Also do                                        |
| ------------------------------ | ---------------------------------------------- |
| New public component           | Storybook story, spec, entry in `src/index.ts` |
| New prop on existing component | Update stories and spec                        |
| New environment variable       | Update `README.md`                             |
| New public utility/type        | Export from `src/index.ts`                     |

## Commands reference

| Script                      | Use                                              |
| --------------------------- | ------------------------------------------------ |
| `npm run typecheck`         | Full `tsc` typecheck                             |
| `npm run lint`              | ESLint with auto-fix                             |
| `npm run lint:check`        | ESLint (CI mode, no fixes)                       |
| `npm run test:run`          | Vitest run (no coverage)                         |
| `npm run test`              | Vitest with coverage                             |
| `npm run build`             | Library + CSS + MCP build                        |
| `npm run storybook`         | Local Storybook dev server (port 6006)           |
| `npm run verify:agent-hook` | typecheck + lint + test (used by post-edit hook) |
