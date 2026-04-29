---
description: Review code or plans for architecture fit, use-case design, test strategy, stack conventions, and docs/TODO drift
argument-hint: "[scope]"
---

Review this scope: $@.

Focus on:

- feature and use-case clarity
- clean architecture boundaries
- whether business logic belongs in a core package or app layer
- correct stack usage for the task:
  - TanStack Start / Router / Form / DB for fullstack app work
  - Hono / Zod / Drizzle / OpenAPI for backend service work
- Zod schema quality and boundary discipline
- CSS Modules and minimal global CSS for UI work
- TDD coverage and missing unit tests
- documentation drift
- `TODO.md` drift

Return findings grouped by:

1. Critical
2. Important
3. Nice to improve
4. Docs/TODO updates needed
