# T-14: Reading Practice Visual Alignment

## Overview

Bring the reading practice screen visual language in line with the rest of the warm-toned app. Replace cold-gray Tailwind defaults with the project's design-system tokens. Unify button radii. Fix the GroupHeader label fallback bug so internal letter IDs are never exposed to the UI.

## Background

The UI/UX review (`docs/ui-ux-review.md`) identified findings **H1** (Cold grays in a warm-toned app), **H2** (`rounded-lg` vs design radii), and **H11** (GroupHeader label built from letter IDs) as high-priority visual inconsistencies targeting the reading practice components.

## Functional Requirements

### FR-1: Replace cold-gray tokens with design-system tokens

All reading-practice components must use only project-defined CSS custom properties instead of Tailwind default grays/emeralds.

**ReadingCell.tsx:**

- `bg-gray-50` → `bg-sand-light` (cell background)
- `rounded-lg` → `rounded-small` (cell border radius)
- `data-[flashed=true]:bg-emerald-200` → `data-[flashed=true]:bg-green-light` (flash state)

**ReadingActions.tsx:**

- `bg-white` + `border-gray-200` → `bg-white` + `border-sand-dark` (all action buttons)
- `rounded-lg` → `rounded-small` (all action buttons)
- `hover:bg-gray-50` → `hover:bg-sand-light` (all action buttons)
- Lucide icon colors → use `text-green` (currently default/black)

**ReadingGrid.tsx:**

- Remove the "Pattern" label entirely (the systematic row's predictable ordering is the visual signal)

**GroupPills.tsx:**

- Active: `bg-emerald-500 text-white` → `bg-green text-white` (matches HarakatSelector)
- Complete: `border-emerald-500 text-emerald-700 bg-white` → `border-green text-green-dark bg-white`
- Incomplete: `border-gray-300 text-gray-400 bg-gray-50` → `border-sand-dark text-text-muted bg-white`
- Remove `cursor-not-allowed` from incomplete state (keep `aria-disabled` for accessibility)

### FR-2: Fix GroupHeader label fallback (H11)

`app/lib/utils/reading.ts` — `generateReadingGroups()` must always produce display labels from Arabic characters. When `getCharById` returns undefined for a letter ID, use the first successfully resolved character in that group as the fallback placeholder. Never expose raw letter IDs in the UI.

### FR-3: Unit test for label fallback

Add a unit test in `reading.test.ts` confirming that `generateReadingGroups()` produces Arabic-character labels even when the resolver returns undefined for some IDs.

## Non-Functional Requirements

- **NFR-1:** All existing tests must continue to pass (class-name assertions updated where needed)
- **NFR-2:** No new Tailwind default color classes (`gray-`, `emerald-`, `amber-`) introduced in reading-practice components
- **NFR-3:** `pnpm typecheck`, `pnpm lint`, `pnpm test` must all pass clean

## Acceptance Criteria

1. All reading-practice components use only design-system tokens (no `bg-gray-50`, `border-gray-200`, `text-gray-500`, `bg-emerald-500`, `rounded-lg`)
2. The "Pattern" label is removed from ReadingGrid entirely
3. GroupPills active state matches HarakatSelector styling (`bg-green text-white`)
4. GroupHeader always shows Arabic glyphs in pills (never Latin IDs)
5. New test covers the `getCharById` fallback case where resolver returns undefined
6. Component tests assert new design-token class names
7. All existing tests pass

## Out of Scope

- Flash animation timing changes (confirmed: keep current timing)
- Any changes to non-reading-practice components or routes
- Any structural refactors to reading practice data flow
