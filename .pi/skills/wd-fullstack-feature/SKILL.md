---
name: wd-fullstack-feature
description: Build or refactor fullstack app features using TanStack Start, TanStack Router, TanStack Form, TanStack DB, Zod contracts, CSS Modules, and clean architecture organized by features and use cases.
---

# Webdrops Fullstack Feature

Use this skill when building or changing web app features.

## Default Stack

- **TanStack Start** for SSR pages and app/server orchestration
- **TanStack Router** for routes and route boundaries
- **TanStack Form** for forms and mutations
- **TanStack DB** when it is the right fit for app data access
- **Zod** for input/output validation and shared contracts
- **CSS Modules** for component-local styling

## Architecture Rules

- Organize by **feature** and **use case**.
- Keep business logic in a core package when it should be shared or tested independently.
- Keep app code focused on:
  - routes
  - SSR loaders/actions or BFF adapters
  - composition of UI and use cases
  - platform concerns
- Do not bury business rules inside route handlers or components when they belong in a shared core layer.

## Research Checklist

- Inspect the relevant app, package boundaries, and existing route patterns.
- Use **Context7** for current TanStack docs before changing framework-level behavior.
- Identify:
  - feature entry points
  - use cases
  - schema boundaries
  - server/client split
  - reusable vs app-specific UI

## Planning Checklist

Document:

- feature name
- use cases
- package/app split
- route or loader/action changes
- form and validation flow
- data and schema flow
- tests to add first

Compare options in a table when deciding between:

- core-package vs app-local implementation
- server-side vs client-side orchestration
- shared vs app-specific UI

## Implementation Checklist

- Define or refine Zod schemas first.
- Write failing tests for the core use cases.
- Add route/form/app wiring after the core behavior is clear.
- Use CSS Modules and minimal global CSS.
- Keep SSR/client boundaries explicit.

## Validation

Depending on scope, validate with:

- targeted tests
- package typecheck
- app build or route-level checks
- workspace validation for cross-package changes

## Coding Good practices and patterns

- We separate well the layers. Service (API calls and integrations), State Management (tanstack db configurations and queries), Presentation (Markup and presentation logic only. We use simple hooks to integrate to the state management). Make sure to have them in different files.


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