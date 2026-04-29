# Webdrops Pi Harness

## Purpose

This repository uses pi-native project guidance. Keep `.github/copilot-instructions.md`, `AGENTS.md`, `.pi/skills/`, `.pi/prompts/`, and `TODO.md` aligned when conventions or workflows change.

## Repo Shape

- `packages/wd-builder` — visual page builder library
- `packages/wd-ui` — shared UI component library
- `apps/playground` — local integration playground
- In future projects, business logic, features, and use cases should live in core packages; apps adapt that core for web, API, mobile, or BFF needs.

## Default Architecture

- Organize work around **features** and **use cases**.
- Follow a **clean architecture** style:
  - core packages own business rules, entities, schemas, and use cases
  - apps own delivery concerns like routes, SSR, client orchestration, API handlers, and platform wiring
  - UI can be shared when valuable, but apps may vary themes and presentation by project
- Prefer explicit boundaries between domain logic, persistence, transport, and UI.

## Preferred Stacks

### Fullstack apps

Default to:

- **TanStack Start** for SSR pages + client-heavy app flows + BFF-style server functions
- **TanStack Router** for routing
- **TanStack Form** for forms
- **TanStack DB** when that fits the app data layer
- **Zod everywhere** for validation, input/output schemas, and shared contracts

### Backend services

Default to:

- **Hono** for HTTP services and APIs
- **Zod** schemas for request/response validation and shared contracts
- **Drizzle** for database access
- **OpenAPI + Swagger docs** for every service or API surface

## Styling

- Follow the existing styling pattern:
  - CSS Modules for component-local styles
  - minimal global CSS, mainly reset/base styles
  - keep appearance adaptable per app or product
- Do not introduce a new styling approach unless the task explicitly requires it.

## Component Conventions

- In `wd-ui`, use Zod schemas as the source of truth for props.
- Props types should come from `z.infer<typeof Schema>`.
- Attach both static properties:
  - `.defaults`
  - `.zodSchema`
- Export components through their local `index.ts` and package root exports.
- If a component is intended for builder editing, keep form introspection compatibility in mind.

## Testing Philosophy

- Prefer **TDD by default**.
- Tests should be driven by **features and use cases**, not incidental implementation details.
- The end of planning must include the important test cases to add.
- Execution should start with failing tests whenever practical, then implementation, then green tests.
- We love unit tests. Add integration tests when crossing package, route, API, or persistence boundaries.

## Required Task Flow

For any non-trivial task, follow this routing:

1. **Research**
   - inspect the code first
   - use **LSP** and **ast-grep** for code navigation/search when possible
   - use **Context7** for current docs on touched libraries/frameworks
   - use the **graphify** skill when the task spans multiple packages, the architecture is unclear, or the repo area is unfamiliar
2. **Plan**
   - define the target feature(s) and use case(s)
   - compare viable solutions in a table before important architectural choices
   - rubber-duck complex implementations
   - document important decisions in `.pi/plans/`
   - finish planning with the most important tests to write
   - create or update `TODO.md`
3. **Execute**
   - write or complete the planned tests
   - implement the smallest coherent slice
   - make tests pass
   - update docs, prompts, skills, and TODOs when behavior or conventions change

If implementation reveals a better path, loop back to planning instead of pushing through a bad design.

## Documentation and Todo Discipline

- Keep `TODO.md` current on multi-step tasks.
- Keep architecture and workflow docs current whenever decisions change.
- If a change affects developer workflow, update the relevant pi resources too.

## Commands

- `pnpm build` — turbo build across packages
- `pnpm dev` — run playground dev workflow
- `pnpm test` — run workspace tests
- `pnpm lint` — Biome check
- `pnpm lint:fix` — Biome autofix
- `pnpm typecheck` — workspace typecheck

## Validation Expectations

Pick validation based on scope, then report what ran and what did not.

- UI/component work: targeted package tests + typecheck + lint
- builder/editor/runtime work: targeted tests + playground smoke if relevant
- service/fullstack work: route/API validation, schema checks, and docs verification when applicable
- cross-package work: finish with workspace-level validation when reasonable

## Known Repo Facts

- `wd-builder` contains the more complex tree, schema form, and runtime JSX logic.
- `wd-ui` follows a consistent Zod + defaults component pattern.
- `apps/playground` is the current integration surface for manual verification.
- Biome is the formatter and linter; use double quotes, semicolons, and type imports.
