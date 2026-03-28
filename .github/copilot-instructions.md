# Webdrops – Copilot Instructions

Monorepo for the **Webdrops** ecosystem — a pluggable visual React page builder and shared UI component library.

## Project Structure

```
packages/
  wd-builder/   → @webdrops/wd-builder — Visual page builder library (core + editor)
  wd-ui/        → @webdrops/wd-ui — Shared UI component library (used across all webdrops apps)
apps/
  playground/   → Development playground app (Vite dev server, port 3000)
```

- `wd-builder` depends on `wd-ui` (external at build time)
- `wd-ui` is standalone — no dependency on builder
- `playground` depends on both via `workspace:*`, resolved to source via Vite aliases

## Commands

```bash
pnpm build          # Build all packages (turbo, respects dependency order)
pnpm dev            # Start playground dev server
pnpm test           # Run all tests (vitest)
pnpm lint           # Biome check (lint + format)
pnpm lint:fix       # Biome check with auto-fix
pnpm typecheck      # TypeScript type checking
```

Package-level commands (run from package dir):
```bash
pnpm test           # vitest run
pnpm build          # vite build (lib mode, CJS + ESM → dist/)
pnpm typecheck      # tsc --noEmit
pnpm lint           # biome check src/
```

## Architecture

### Component Tree Model
The builder uses a **flat tree** (not nested). Each node is a `ComponentData` with `id`, `parentId`, `label`, `droppable`, and `data: { componentCollection, componentName, props }`. Helper functions convert between flat and nested representations.

### Key Data Flow
1. UI components in `wd-ui` define Zod schemas + defaults as static properties
2. `createComponent()` wraps them with builder metadata (droppable, meta)
3. `ComponentRegistry` groups them into named collections
4. `Editor` receives a `CanvasComponentList` and renders the builder UI
5. When editing props, `introspectSchema()` reads the Zod schema → `FormFieldDescriptor[]`
6. `SchemaForm` auto-generates Radix UI form controls from those descriptors
7. Props are validated with `zodSchema.safeParse()` before saving

### Runtime JSX Pipeline
`@babel/standalone` → `acorn` (AST) → `escodegen` (code generation) → `new Function()` — used for live preview rendering in the canvas.

## Conventions

### TypeScript
- **Strict mode** everywhere — no `any` without `// biome-ignore lint/suspicious/noExplicitAny: <reason>`
- Prefix unused params with `_` (e.g., `_label`, `_setTreeData`)
- Use `type` imports: `import type { Foo }` (enforced by Biome)
- Module resolution: `bundler` (not `node`)

### Code Style (Biome)
- **Biome** for formatting AND linting — no ESLint/Prettier
- 2-space indent, double quotes, semicolons always
- Imports auto-organized alphabetically on save
- Pre-commit hook runs `biome check --write` automatically

### File Naming
- `camelCase` for files: `componentTreeItem.tsx`, `editorSidebar.tsx`, `schema-form.ts`
- `PascalCase` for React components: `const EditorSidebar = ...`
- CSS modules: `component.module.css` co-located with component

### Commit Messages
Conventional Commits enforced via commitlint + Husky:
`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`

## Component Authoring (wd-ui)

Every UI component follows this pattern:

```tsx
import { z } from "zod";
import type { WdComponent } from "../types"; // or "../../types"

const MyComponentZodSchema = z.object({
  children: z.custom<React.ReactNode>(),     // Non-editable props
  variant: z.enum(["a", "b"]).optional(),    // Editable enum
  count: z.number().min(0).max(10),          // Editable number with constraints
  onClick: z.function().args().returns(z.void()).optional(), // Skipped in forms
});

type MyComponentProps = z.infer<typeof MyComponentZodSchema>;

export const MyComponent: WdComponent = ({ variant = "a", count, children }: MyComponentProps) => {
  return <div>{children}</div>;
};

MyComponent.defaults = { variant: "a", count: 5 };
MyComponent.zodSchema = MyComponentZodSchema;
```

**Rules:**
- Props type is always `z.infer<typeof Schema>` — never a separate interface
- `WdComponent` type (not `BuilderComponent`) in wd-ui
- `children`, `className`, `style`, `ref`, and event handlers are auto-skipped by the form generator
- Use `z.custom<React.ReactNode>()` for children props
- Attach both `.defaults` and `.zodSchema` as static properties
- Export from the component's `index.ts` and add to `packages/wd-ui/src/index.ts`

## Builder Registration (wd-builder)

```tsx
import { createComponent, createRegistry } from "@webdrops/wd-builder";
import { Button, Section } from "@webdrops/wd-ui";

const BuilderButton = createComponent({
  component: Button,           // WdComponent with .zodSchema and .defaults
  droppable: true,             // Can contain children in the tree
  meta: { category: "Interactive", description: "A clickable button" },
});

const registry = createRegistry()
  .register("UI", "Button", BuilderButton)
  .register("UI", "Section", createComponent({ component: Section, droppable: true }));

// Pass to editor
<Editor components={registry.toCanvasComponentList()} />
```

- `createComponent()` clones the function reference — never mutates the original
- `schema`/`defaults` in definition override `component.zodSchema`/`component.defaults`
- `droppable` defaults to `false`

## Testing

- **Vitest** with jsdom environment, `@testing-library/jest-dom` matchers
- Test files co-located: `foo.ts` → `foo.test.ts`
- Pattern: Arrange-Act-Assert, one concept per test
- Use `_prefix` for unused params in test fixtures (Biome enforces this)
- 70 tests across 5 files currently

## Pitfalls

- **"use client" warnings** during `vite build` are expected — Radix UI modules use this directive, Vite library mode ignores them. Harmless.
- **wd-builder bundles are large** (~4.7MB JS) because `@babel/standalone` is included for runtime JSX compilation. This is intentional.
- When adding Radix UI primitives, mark them as external in `vite.config.ts` only if they're peer deps. Currently they're bundled into wd-builder.
- The `playground` resolves workspace packages from source (not dist) via Vite aliases — changes are reflected instantly without rebuilding.
- `biome.json` only scans `packages/*/src/**` and `apps/*/src/**` — config files at root are not linted.
