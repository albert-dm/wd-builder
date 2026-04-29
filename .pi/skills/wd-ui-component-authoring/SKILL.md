---
name: wd-ui-component-authoring
description: Author or refactor UI components in this monorepo using Zod-based props, CSS Modules, minimal global CSS, current export conventions, and builder-friendly component metadata when needed.
---

# Webdrops UI Component Authoring

Use this skill when working on shared UI components or builder-exposed components.

## Component Rules

- Use **Zod** as the source of truth for props.
- Define props as `type Props = z.infer<typeof Schema>`.
- Attach both static properties:
  - `.defaults`
  - `.zodSchema`
- Export through the component's local `index.ts` and the package root exports.

## Styling Rules

- Use **CSS Modules** for local styling.
- Keep global CSS minimal and limited to base/reset concerns.
- Follow existing component patterns before introducing new abstractions.

## Builder Compatibility

If the component is used by the builder:

- think about editable vs non-editable props
- keep schema introspection compatibility in mind
- use Zod types that the form generator can reason about where appropriate
- attach sensible defaults

## Research Checklist

- Inspect similar components first.
- Confirm export wiring and package boundaries.
- Check whether the component is builder-facing, app-only, or both.

## Planning Checklist

Document:

- component purpose
- props/schema
- defaults
- styling approach
- builder implications
- tests to add first

## Implementation Checklist

- Define schema and defaults first.
- Add tests for the important behavior and use cases.
- Wire exports before finishing.
- Keep styling local.

## Validation

Validate with:

- targeted tests when present or newly added
- package typecheck
- package lint
- package build when the public component surface changes
