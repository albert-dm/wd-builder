---
description: Build or refine a feature using clean architecture, core packages, app adapters, Zod contracts, and TDD
argument-hint: "<feature-name> [notes]"
---

Work on the feature `$1`.

Additional notes: ${@:2}

Follow:

- `wd-delivery-workflow`
- `wd-fullstack-feature` when app/web work is involved
- `wd-ui-component-authoring` when shared UI changes are involved

Expectations:

- organize by feature and use case
- keep business logic in core packages when appropriate
- use Zod at boundaries
- prefer TanStack stack defaults for fullstack app work
- create or update `TODO.md`
- update docs and pi resources if conventions change
- use TDD and start execution with failing tests when practical

At the end, report changed files, tests added, validation run, and docs/TODO updates.
