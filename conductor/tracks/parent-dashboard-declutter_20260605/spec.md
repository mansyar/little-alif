# Specification: T-15 Parent Dashboard De-clutter

## Overview

Restructure the parent dashboard for mobile-first use by replacing the desktop sidebar layout with a top app bar, moving letter management from an inline accordion into a dedicated route, and moving the sign-out action into a profile dropdown menu with confirmation. This eliminates the ~1200px profile card expansion, the 256px sidebar that conflicts with 360px mobile targets, and the low-contrast sign-out button.

## Functional Requirements

### FR1 — Dashboard Header (replaces sidebar)

- A `DashboardHeader` component renders at the top of `/dashboard`
- Left side: app name / "Profiles" title
- Right side: language toggle + profile menu (avatar dropdown via Radix DropdownMenu)
- No sidebar (`<aside>`) in the dashboard layout

### FR2 — ProfileMenu (dropdown)

- Radix DropdownMenu triggered by an avatar icon
- Two items:
  - **Manage Letters** — navigates to `/dashboard/profiles/:id/letters` for the selected profile
  - **Sign out** — triggers a `ConfirmDialog` (danger variant) for confirmation
- Cancel returns to dashboard; confirm clears session and redirects to `/login`

### FR3 — Dedicated Letter Management Route (`/dashboard/profiles/:id/letters`)

- New route renders `LetterToggleGrid` for the given profile ID
- Page header includes "← Back to Profiles" link navigating to `/dashboard`
- Route loads directly from URL params (deep-linkable)

### FR4 — ProfileList Simplification

- Remove inline accordion (`LetterToggleGrid`) from profile cards
- Replace "Manage Letters" button with a `<Link>` to the dedicated route
- Add skeleton loaders (3-card placeholder with `animate-pulse`)
- Ensure `min-h-[140px]` on profile cards to prevent height jitter

### FR5 — Empty State Polish

- Replace "👤" emoji in empty parent state with a low-opacity SVG illustration (reuse existing avatar at `opacity-30`)

## Non-Functional Requirements

- **Mobile-first:** Dashboard must render without horizontal scroll at 360px width
- **Touch targets:** All interactive elements ≥ 44×44dp (WCAG 2.5.5)
- **No regressions:** All existing tests must pass
- **Performance:** Letter management route loads in ≤500ms (route change only, no extra server functions)

## Acceptance Criteria

1. Dashboard at 360px: no horizontal scroll, header is single row, profile cards stack vertically
2. Dashboard at 1280px: header still single row, profile cards in 2-column grid
3. Clicking "Manage Letters" navigates to `/dashboard/profiles/:id/letters` with the full toggle grid
4. "← Back to Profiles" returns to `/dashboard`
5. Sign out: opens danger variant `ConfirmDialog`, cancel returns, confirm redirects to `/login`
6. Empty state shows SVG illustration (not emoji)
7. Skeleton loaders render on initial load
8. All existing tests pass + new tests for `DashboardHeader`, `ProfileMenu`, letter management route
9. `pnpm typecheck`, `pnpm lint`, `pnpm test` clean

## Out of Scope

- Settings page (placeholder skipped — dropdown only has Manage Letters + Sign out)
- Multiple parent accounts
- Profile editing from dropdown (editing remains on the card action row)
