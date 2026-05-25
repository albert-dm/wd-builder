# Tarot Dead Code Cleanup — Fallow Analysis

**Date:** 2026-05-24
**Tool:** Fallow v2.80.0
**Health Score Improvement:** 53.3 (D) → 58.0 (C)

## Summary

Analyzed all tarot-related packages and app using Fallow's dead code detection. Cleaned up unused files, dependencies, and imports.

## Changes Made

### Deleted Files (3)

| File | Reason |
|------|--------|
| `apps/tarot-web/src/lib/db.ts` | Deprecated re-export, nothing imports it |
| `apps/tarot-web/src/lib/time.ts` | Utility functions, nothing imports them |
| `apps/tarot-web/src/styles/home.module.css` | CSS module, nothing imports it |

### Removed Dependencies (4)

| Package | Dependency | Reason |
|---------|------------|--------|
| `@webdrops/tarot-db` | `@webdrops/auth-core` | Never imported in source |
| `@webdrops/tarot-db` | `@webdrops/payments-core` | Never imported in source |
| `@webdrops/tarot-db` | `zod` | Never imported in source |
| `@webdrops/tarot-ai` | `@webdrops/tarot-core` | Never imported in source |

### Code Cleanup (6)

| File | Change |
|------|--------|
| `apps/tarot-web/src/lib/tarot-helpers.server.ts` | Removed dead import of `runChatTurn` |
| `apps/tarot-web/src/components/Navigation.tsx` | Removed unused `AppTab` type, `BottomNavProps` interface, and `tabClass` function |
| `apps/tarot-web/src/components/index.ts` | Removed unused `AppTab` re-export |
| `apps/tarot-web/src/routes/market.tsx` | Removed unused `BottomNav` import |
| `apps/tarot-web/src/routes/wallet.tsx` | Removed unused `BottomNav` import |
| `apps/tarot-web/src/routes/profile.tsx` | Removed unused `BottomNav` import |
| `apps/tarot-web/src/routes/reading.tsx` | Removed unused `BottomNav` import |

### Removed Empty Directories (1)

| Directory | Reason |
|-----------|--------|
| `apps/tarot-web/src/routes/api/tarot` | Empty directory, leftover from previous implementation |

## False Positives (Kept)

| File | Reason |
|------|--------|
| `apps/tarot-web/src/routes/api/webhooks/-abacatepay.ts` | TanStack Router file-based route (the `-` prefix is a route convention) |

## Intentional Type Exports (Kept)

These type exports are unused but serve as API documentation:

- `DrawCardResult` in `tarot-helpers.server.ts` — documents card draw response
- `AbacateWebhookEvent` in `webhooks.server.ts` — documents webhook payload

## Remaining Issues (Not Tarot-Specific)

The following issues are in wd-builder/wd-ui packages, not tarot:

- 8 unused files in `packages/wd-builder/src/editor/`
- 2 unused files in `packages/wd-ui/`
- 12 unused exports in wd-builder/wd-ui
- 5 unused dependencies in wd-builder

## Bug Fixed: Missing BottomNav Component

Multiple routes imported `BottomNav` from `../components`, but the component was not defined or exported. Fixed by:

1. Removing unused `BottomNav` imports from 4 route files:
   - `apps/tarot-web/src/routes/market.tsx`
   - `apps/tarot-web/src/routes/wallet.tsx`
   - `apps/tarot-web/src/routes/profile.tsx`
   - `apps/tarot-web/src/routes/reading.tsx`

2. Removing unused `AppTab` type from `Navigation.tsx` and `index.ts`

3. Removing unused `BottomNavProps` interface and `tabClass` function from `Navigation.tsx`

## Health Score Breakdown

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Overall Score | 53.3 | 58.0 | +4.7 |
| Grade | D | C | ↑ |
| Dead Files Penalty | 1.9 | 1.5 | -0.4 |
| Dead Exports Penalty | 1.1 | 1.0 | -0.1 |
| Unused Deps Penalty | 25.0 | 20.7 | -4.3 |
| Duplication Penalty | 4.6 | 4.7 | +0.1 |

## Duplication hotspots (Future Refactor)

The following files have significant code duplication:

- `apps/tarot-web/src/lib/payments.ts` — 6 clone groups with `tarot-helpers.server.ts`
- `apps/tarot-web/src/routes/market.tsx` and `wallet.tsx` — shared patterns
- `apps/tarot-web/src/routes/auth.callback.tsx` and `index.tsx` — shared patterns
