<protect>
# UX Enhancements (v1.1)

## Overview

A pack of v1.1 UX enhancements that turn the app from "functional" to "delightful." All changes are client-side — no new database tables, no new server functions. Each enhancement is small and independently revertible.

Dependencies: T-08 (Child Letter Grid), T-10 (Reading Practice), T-07 (Harakat)

## Functional Requirements

### FR-1: Swipeable Letter Detail Overlay

The `LetterDetail` overlay (shown when a child taps a letter card) shall support horizontal swipe gestures to navigate through the visible letters sequentially.

- **Swipe detection:** Pointer events (`onPointerDown`/`onPointerUp`) tracking X-axis delta. A swipe ≥ 50px in either direction triggers navigation.
- **Navigation:** Swipe left → next letter. Swipe right → previous letter.
- **Boundary behavior:** Wraps around — swiping past the last letter goes to the first, and vice versa.
- **Audio:** Each new letter auto-plays its pronunciation via `audioEngine.speak()`.
- **Overlap handling:** Swiping during audio playback cancels the current utterance and plays the new letter's audio.
- **Zero letters:** No-op (already gated by `visibleLetters.length > 0`).
- **Accessibility:** Swipe region is the full overlay. No new ARIA attributes needed — existing `role="dialog"` and `aria-label` remain.

### FR-2: Reading Row Progress Indicator

The 6-row reading grid shall visually show which rows have been fully explored.

- **Tap tracking:** Each `ReadingCell` reports taps into a local `useRef<Set<string>>` keyed by `"rowIndex-cellIndex"`.
- **Completed row:** When all cells in a row have been tapped at least once, apply a subtle green border (2px `border-green/50`) and a small checkmark icon.
- **Row counter:** Display `"Row 3 of 6"` (visually, no text — use `aria-label` for screen readers: "Row 3 of 6, 2 of 3 cells completed").
- **Systematic row hint:** The first (systematic) row's cells get a gentle pulsing glow animation (3s interval, `opacity-60` → `opacity-100`) when they haven't been tapped yet, suggesting "start here."
- **Ephemeral state:** Progress resets on group switch, shuffle, or page refresh (stored in `useRef`, not persisted).
- **Minimum 3 letters:** The grid only appears when `visibleLetters.length >= 3` (existing gate).

### FR-3: Persist Child's Last Harakat Selection

The child's independently-chosen vowel mode (from `ChildHarakatBar`) shall survive page refreshes within the same browser session.

- **Storage:** A client-side session cookie (`little-alif-harakat`) with `sameSite: 'lax'`. No `maxAge` set — auto-cleared on tab close.
- **On mount:** `ChildHarakatBar` reads the cookie first. If present and valid (one of `'none' | 'fathah' | 'kasrah' | 'dammah'`), it initializes from the cookie. Otherwise falls back to the profile's `vowelMode` from the server (existing behavior).
- **On change:** Every time the child taps a different harakat, the cookie is updated synchronously via `document.cookie`.
- **No server involvement:** Pure client-side. No new server function, no DB column.
- **Graceful degradation:** Missing/corrupt cookie → fall back to profile's `vowelMode`. No error surface.

### FR-4: Page Transitions

Route-level containers on `/learn` and `/learn/reading` shall have subtle entrance animations.

- **Transition:** `fadeIn + slideUp` — `opacity 0→1` and `translateY(8px)→0` over 200ms, easing `ease-out`.
- **Letter detail overlay:** Entrance animation: `scale(0.9→1.0)` + `opacity(0→1)` over 250ms with an elastic ease (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Implementation:** Tailwind v4 `@keyframes` in `app.css`. Applied via a CSS `animation` class on the root `<main>` element of each route.
- **Reduced motion:** Respect `@media (prefers-reduced-motion: reduce)` — disable animations, render instantly.
- **No library dependency:** Pure CSS. No Framer Motion or similar.

### FR-5: Group Header Speaks

The `GroupHeader` component (showing 3 Arabic characters at the top of the reading practice screen) shall be tappable and play the letter names aloud.

- **Interaction:** The header becomes a `<button>` with the existing visual appearance.
- **Audio sequence:** On tap, play the three letter names sequentially via `audioEngine.speak(letterId, 'none', letterChar)` with a 300ms gap between each.
- **Overlap handling:** Rapid taps cancel the previous sequence and start a new one.
- **Incomplete groups:** Groups with < 3 letters still speak whatever letters are present.
- **Accessibility:** `aria-label="Tap to hear letter names"` on the button.

### FR-6: Subtle Reading Completion Acknowledgement

When the child presses "Done" on the last reading group, instead of a silent redirect, show a brief visual acknowledgement.

- **Trigger:** `onDone` is called from the last group (all groups navigated through, user presses "Done").
- **Animation:** A 1-second green pulse on the grid container (`bg-green/10` fades in over 300ms, holds for 400ms, fades out over 300ms) concurrent with a checkmark icon (`Check` from Lucide) scaling up from 0→1 over 400ms at the center of the grid.
- **Navigation:** After the animation completes (total ~1s), navigate to `/learn`.
- **Non-blocking:** If the animation is interrupted (browser tab hidden, component unmounts), immediately navigate.
- **No gamification:** No points, stars, streaks, or achievements.

### FR-7: Tap-Replay Hint on Reading Cells

The reading grid's systematic row cells shall subtly animate to indicate they can be tapped again.

- **Target:** Cells in the first (systematic) row only.
- **Condition:** Only active when the cell has been tapped at least once AND is no longer in its green-flash state.
- **Animation:** Gentle `opacity-60` → `opacity-100` pulsing, 3s interval, CSS `@keyframes` driven.
- **Visual:** Uses `data-replay="true"` attribute on `ReadingCell`. Not applied during the initial green-flash (first 400ms after tap).
- **Stops on interaction:** As soon as the cell is tapped again, the pulsing stops (cell re-enters flash state).

## Key Decisions

| #    | Decision                                       | Rationale                                                         |
| ---- | ---------------------------------------------- | ----------------------------------------------------------------- |
| KD-1 | Swipe wraps around at boundaries               | More playful for kids — infinite-loop feel                        |
| KD-2 | Session cookie (no maxAge) for harakat         | Survives refresh, dies on tab close. Simple, no expiry management |
| KD-3 | Independent-first implementation order         | Lowest-risk changes build momentum                                |
| KD-4 | Pointer events for swipe (no gesture library)  | Avoids adding a dependency. Well-supported on mobile              |
| KD-5 | Pure CSS for all animations                    | No Framer Motion or similar. Tailwind v4 keyframes                |
| KD-6 | `useRef<Set<string>>` for reading row progress | Ephemeral per-session state, no persistence needed                |

## Non-Functional Requirements

- NFR-1: All animations respect `prefers-reduced-motion`
- NFR-2: No new dependencies (npm packages)
- NFR-3: No new database tables or server functions
- NFR-4: All 564+ existing tests must continue to pass
- NFR-5: Touch targets for swipe must cover the full overlay area

## Out of Scope

- Gamification (points, stars, streaks, achievements)
- Confetti or particle effects for completion
- Server-side harakat persistence for child's independent selection
- Audio recording / speech recognition

## Acceptance Criteria

1. Swipe left/right on letter detail overlay cycles through visible letters with wrap-around
2. Audio auto-plays on swipe to the new letter; previous utterance is cancelled
3. Reading grid shows "Row 3 of 6" indicator and completed-row checkmarks
4. Systematic row cells pulse when re-tappable, stop on tap
5. Child harakat selection survives page refresh within session
6. Route-level pages animate in with fade+slide
7. Letter detail overlay bounces in with elastic ease
8. GroupHeader plays 3 sequential audio clips on tap
9. "Done" on last reading group shows green pulse + checkmark before redirect
10. All existing tests pass, `pnpm typecheck` clean
    </protect>
