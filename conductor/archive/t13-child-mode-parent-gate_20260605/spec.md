# T-13: Child Mode Parent Gate & Flow Polish

**Track ID:** `t13-child-mode-parent-gate_20260605`
**Type:** Feature
**Status:** New
**Created:** 2026-06-05
**Dependencies:** T-11 (Child Mode — complete), T-08 (Child Letter Grid — complete)

## Overview

The child-facing routes (`/learn`, `/learn/reading`) currently expose a small "Back" text link in the header. This link is parent-facing text in a child-facing UI: meaningless to a 3-year-old, easy to find accidentally, and offers no protection against a child ending their own session.

This track replaces the "Back" link with a hidden **Parent Gate**: a low-contrast lock icon in the top-right corner of every child route. The icon is invisible to children in normal use. A parent can unlock it by holding the icon for ≥1.5 seconds (with a subtle progress ring as visual confirmation), or by tapping it three times within 1 second. Unlocking opens a small parent menu with two options:

- **Switch child** — open a profile picker and hand the device between siblings.
- **Exit to parent dashboard** — clear the child-mode cookie and route to the parent dashboard (if a parent JWT is also present) or to `/login` (child cookie only).

## Functional Requirements

### FR-1. ParentGate component

A new `ParentGate` component replaces the "Back" link in the child header. It is the only escape hatch from `/learn` and `/learn/reading` and is designed to be invisible to a child in normal use.

**Triggering the gate (any of):**

- `mousedown` / `touchstart` on the icon held for ≥1.5 seconds (with up to 100ms movement tolerance).
- Three `click` / `touchend` events on the icon within 1 second of each other (rapid-tap fallback for parents who can't long-press).

**Activation outcome:** opens the parent menu (see FR-3).

**Visual states:**

| State               | Appearance                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| Idle                | 24×24px `Lock` icon, `text-text-muted/40` — nearly invisible              |
| Holding (1.5s hold) | Subtle 1px progress ring around the icon, fills from 0% to 100% over 1.5s |
| Tap feedback (idle) | None — children should not learn that taps do anything                    |
| Menu open           | Icon stays visible; menu overlay appears                                  |

**Props:**

```ts
interface ParentGateProps {
  /** Called when the gate is unlocked and "Exit" is chosen. */
  onExit: () => void | Promise<void>;
  /** Called when the gate is unlocked and "Switch child" is chosen. */
  onSwitchChild: () => void;
  /** Disables all interactions (e.g., while a request is in flight). */
  disabled?: boolean;
}
```

The `ParentGate` itself is the lock icon, the progress ring, and the parent menu trigger. The parent menu is rendered conditionally inside `ParentGate` (not always present).

### FR-2. Lock icon placement

- Top-right corner of the child header in `/learn` and `/learn/reading`.
- 24×24px, `text-text-muted/40` at rest, `text-text-muted/70` on focus.
- `aria-label="Parent menu"` for screen readers (the icon itself is decorative — the actual interaction is mouse/touch, not keyboard).
- `pointer-events: auto` on the icon, `pointer-events: none` on its hit-area decoration.

### FR-3. Parent menu

A small overlay that appears when the gate is unlocked. Two options:

- **Switch child** — opens the `ChildSwitcher` (see FR-4).
- **Exit to parent dashboard** — closes the menu, calls the `onExit` callback.

**Menu UI:**

- Radix `Dialog` (or `AlertDialog` content styled as a non-modal popover) at z-index 60 (above the existing `LetterDetail` z-50 overlay).
- Two large tappable buttons (≥48px tall), warm palette.
- A small "Close" affordance in the corner to dismiss the menu without taking action.

### FR-4. ChildSwitcher component

A new `ChildSwitcher` component that lists all child profiles (up to 4 per PRD REQ-2.2) as avatar + name tiles.

- Loads the parent's profiles via a new server function (see FR-5).
- Tapping a profile calls `enableChildModeFn({ data: { profileId } })` and on success routes to `/learn`.
- Renders inside a Radix `Dialog` overlay at z-index 70 (above the parent menu).
- Empty state: "No other children" if the parent has only one profile.

### FR-5. listProfilesForSwitchFn server function

A new `getActiveProfileFn`-style server function for use by `ChildSwitcher`:

- Reuses the existing `listProfiles` pure helper from `app/server/profiles.ts`.
- Validates parent session (`requireParentSession`).
- Returns `Array<{ id, name, avatar }>` (public-safe shape).

### FR-6. Route integration

**`app/routes/learn.tsx`:**

- Remove the `<Link to="/dashboard" className="text-sm text-text-muted ...">Back</Link>` at line 135–137.
- Add `<ParentGate onExit={...} onSwitchChild={...} />` to the right side of the header (where the Back link was).
- Wire `onExit` to: call `disableChildModeFn()`, clear the auth store child state via `useAuthStore.getState().setChildMode(null)`, and route to `/dashboard` (if `useAuthStore.getState().user` is truthy) or `/login` (otherwise).
- Wire `onSwitchChild` to open the `ChildSwitcher` overlay.

**`app/routes/learn/reading.tsx`:**

- Same pattern: remove the "Back" link at line 172–174, add `<ParentGate />`.
- Use the same `onExit` / `onSwitchChild` handlers (extracted to a small hook `useParentGateHandlers()` to avoid duplication).

### FR-7. Test updates

- `app/routes/learn.test.tsx`: remove the existing "Back" text assertions and add a "lock icon present" assertion.
- `app/routes/learn/reading.test.tsx`: same.
- New: `app/components/child/ParentGate.test.tsx` — covers long-press timing, 3-tap detection, disabled state, parent menu open/close, switch-child and exit callbacks.
- New: `app/components/parent/ChildSwitcher.test.tsx` — covers empty state, single profile, multiple profile selection, switch callback.

## Non-Functional Requirements

### NFR-1. Performance

- Lock icon must add zero perceptible delay to the child route initial render.
- Long-press timer must not block the main thread (use `setTimeout`, not a synchronous loop).
- The progress ring must animate at 60fps (CSS transition, not JS-driven `requestAnimationFrame`).

### NFR-2. Accessibility

- Lock icon has an `aria-label` (even though it's not keyboard-reachable — the gesture is the affordance).
- Parent menu is keyboard-reachable: focus is trapped inside the dialog, `Esc` closes it, focus returns to the lock icon on close.
- ChildSwitcher dialog follows the same pattern.
- All buttons have a visible focus ring (`focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2`).

### NFR-3. Mobile & touch

- 44×44px hit area on the lock icon (the visible 24×24 is centered inside an invisible 44×44 area, matching the Radix Switch pattern).
- Touch events handled alongside mouse events (use pointer events, not click events alone).
- Long-press cancels cleanly on `mouseleave` / `touchend` / `touchcancel` (no "stuck" progress if the user drags off).

### NFR-4. Testability

- The 1.5s threshold and 1-second tap window are exposed as named constants (`PARENT_GATE_LONG_PRESS_MS = 1500`, `PARENT_GATE_TAP_WINDOW_MS = 1000`) for easy test override.
- `useFakeTimers()` from Vitest is used for timing-based tests.

## Acceptance Criteria

1. **AC-1 — Hidden at rest:** On `/learn` and `/learn/reading`, the lock icon is visible to a careful parent (intentionally hovering the corner) but the contrast is low enough that a 3-year-old is unlikely to notice it in normal use.
2. **AC-2 — Long-press unlock:** Holding the lock icon for ≥1.5s triggers the parent menu. The progress ring fills smoothly from 0% to 100% over the hold.
3. **AC-3 — Tap unlock:** Tapping the lock icon 3 times within 1 second triggers the parent menu. Tap 1 → no visible feedback. Tap 2 → no visible feedback. Tap 3 → menu opens.
4. **AC-4 — Slow tap does not unlock:** Tapping the lock icon 3 times with >1 second between each tap does NOT trigger the menu.
5. **AC-5 — Menu options:** The parent menu shows "Switch child" and "Exit to parent dashboard" plus a Close affordance.
6. **AC-6 — Switch child:** Choosing "Switch child" opens the ChildSwitcher with all parent profiles. Tapping a profile calls `enableChildModeFn` and routes to `/learn` with the new profile.
7. **AC-7 — Exit (parent JWT present):** Choosing "Exit to parent dashboard" with a parent JWT present clears the child cookie and routes to `/dashboard`.
8. **AC-8 — Exit (no parent JWT):** Choosing "Exit to parent dashboard" with no parent JWT clears the child cookie and routes to `/login`.
9. **AC-9 — Back link removed:** The "Back" text link is no longer present in `/learn` or `/learn/reading`.
10. **AC-10 — Manual verification:** A 3-year-old cannot accidentally exit child mode. A parent can exit in ≤3 seconds.

## Out of Scope

- Long-press detection on the child avatar (intentionally not done — children will tap it). Switcher is gated behind the Parent Gate unlock only.
- Any change to the parent dashboard layout (covered by T-15).
- Any change to the "Back to Dashboard" link in the `SelectChildMessage` component — that link is parent-facing and only shown when no child is selected, so it stays.
- Visual changes to the reading-practice components (covered by T-14).
- New icons beyond the Lucide `Lock` icon (already in the dependency tree).
- A "lockout" mechanism if the parent enters the wrong code (no code is required — only the gesture, by design).
- A second parent gate for the LetterDetail overlay (the gate covers the route header; LetterDetail is a per-letter sub-view, not a route).
