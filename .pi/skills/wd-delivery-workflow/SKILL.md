---
name: wd-delivery-workflow
description: Strict Webdrops delivery workflow for non-trivial tasks. Use when work needs repo research, up-to-date library docs from Context7, graphify for broad context, planning with options tables, TDD by feature and use case, todo maintenance, docs updates, and scoped validation.
---

# Webdrops Delivery Workflow

Use this skill for any non-trivial task in this repository.

## Principles

- Work by **feature** and **use case**.
- Keep business logic in core packages when possible.
- Keep apps focused on delivery and platform concerns.
- Prefer **TDD**.
- Keep `TODO.md` and relevant docs updated.
- If the implementation path changes materially, go back to planning.

## Workflow

### 1. Research

Start with verified context.

- Inspect the code before proposing changes.
- Prefer **LSP navigation** and **ast-grep** for code intelligence.
- Use **Context7** for the latest docs when touching external libraries, especially:
  - TanStack Start
  - TanStack Router
  - TanStack Form
  - TanStack DB
  - Hono
  - Drizzle
  - Zod
- Use the **graphify** skill when:
  - the task spans multiple packages
  - the relevant architecture is unclear
  - the repo area is unfamiliar
  - you need a broader map before planning
- Separate verified facts from assumptions.
- Identify affected features, use cases, packages, routes, APIs, schemas, and tests.

### 2. Plan

Do not code before the path is explicit.

- Define the feature and use cases being changed or added.
- Compare meaningful solution options in a **table** before major choices.
- Rubber-duck complex or risky implementations.
- Write a plan file in `.pi/plans/` with:
  - chosen approach
  - affected areas
  - scope and out-of-scope
  - validation plan
- Create or update `TODO.md` for the task.
- End planning with the most important tests to add.
- Prefer a test matrix organized by feature/use case.

### 3. Execute

Implement the planned slice.

- Start by writing the failing tests when practical.
- Keep code aligned with the plan and architecture boundaries.
- Keep `TODO.md` current as work progresses.
- Update docs and pi resources when conventions, architecture, or workflows change.
- Make tests pass before wrapping up.

## Validation

Choose validation based on scope.

- package-level test + typecheck + lint for isolated changes
- playground smoke validation for builder or UI changes
- route/API/schema validation for fullstack or backend changes
- workspace validation for cross-package changes when reasonable

Always report:

- what changed
- what was validated
- what remains uncertain or deferred
