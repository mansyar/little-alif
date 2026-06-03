<protect>
# T-10: Reading Practice (Iqra' Mode) — Specification

## Overview

Implement the Reading Practice screen at `/learn/reading` — a child-facing drill that presents the parent's toggled-on letters in groups of 3, laid out as a 6-row grid (1 systematic row + 5 randomized rows). Each cell is a tappable target that plays the pronunciation for that letter+vowel combination via the existing `audioEngine`. The screen includes group navigation pills, a shuffle action, and a "Done" button to return to the main grid.

This track wires up the "Reading Practice" button on the main `/learn` grid (currently disabled per T-08 / DD-3) and delivers the missing half of the PRD's Module 8.

**Dependencies:** T-06 (Letter Toggles), T-07 (Vowel Mode / Harakat), T-08 (Child Letter Grid), T-09 (Audio Service)
**PRD Ref:** §4 — Module 8 (Reading Practice), §6 — DD-3 (3-letter minimum gate)
**TDD Ref:** §1 (Project Structure — `app/components/child/reading/`), §2 (Route Design — `/learn/reading`), §3 (Server Function — `getReadingDataFn`), §5 (Reading Utilities — `app/lib/utils/reading.ts`), §7 (Reading Practice Flow)

## Functional Requirements

### FR-1: `getReadingDataFn` Server Function

A new server function provides the data the route needs to render the practice screen.

- **File:** `app/server/reading.ts` (new file)
- **Method:** GET
- **Zod Schema:** `getReadingDataSchema` (`profileId: z.string().uuid()`) in `app/lib/validations/reading.ts` (new file — see FR-2)
- **Auth:** Parent JWT (must own the profile) OR child-mode cookie (must match `profileId`) — same pattern as `getVisibleLettersFn` (T-06) and `getActiveProfileFn` (T-08)
- **Returns:** `{ letters: Array<{ letterId: string, character: string }>, vowelMode: VowelMode }`
  - `letters` is the set of toggled-ON letters for the profile, sorted by `displayOrder` (1–28).
  - `vowelMode` is the profile's currently persisted harakat mode ('none' | 'fathah' | 'kasrah' | 'dammah').
- **Implementation pattern:** pure helper `getReadingData(db, ownerId, profileId)` that joins `letter_toggles` (filtered `isVisible = true`) with `letters`, plus a server function wrapper `getReadingDataFn` that reuses `validateSessionFn` and `verifyProfileOwnership` (matching the existing pattern in `app/server/profiles.ts` and `app/server/letters.ts`).
- **Empty case:** if zero letters are toggled on, returns `{ letters: [], vowelMode }` — the route then redirects to `/learn` (the `EmptyState` belongs on the main grid, not here).

### FR-2: `reading.ts` Utility Module

Pure helper functions for generating groups and rows. No React, no DOM, no I/O — easy to unit-test in isolation.

- **File:** `app/lib/utils/reading.ts` (new file)
- **Exports:**
  - `generateReadingGroups(visibleLetterIds: string[]): ReadingGroup[]`
  - `generatePracticeRow(groupLetters: string[], rowType: 'systematic' | 'mixed', composeFn, getCharById): string[]`
  - `generatePracticeGrid(groupLetters: string[], composeFn, getCharById): PracticeRow[]` (6 rows: 1 systematic + 5 mixed)
- **Type definitions (in-file):**
  ```ts
  export interface ReadingGroup {
    id: number;
    letters: string[]; // 1–3 letter IDs
    label: string; // Arabic chars separated by spaces, e.g. 'ا ب ت'
    isComplete: boolean; // true when letters.length === 3
  }
  export interface PracticeRow {
    type: 'systematic' | 'mixed';
    cells: string[]; // precomposed glyphs
  }
  ```
- **`generateReadingGroups` behavior:**
  - If `visibleLetterIds.length < 3` → return `[]` (caller should not render the screen).
  - Otherwise, slice the input into chunks of 3 in order; each chunk becomes a `ReadingGroup`.
  - Trailing 1–2 element groups are kept and marked `isComplete: false` (the route disables their pill — see FR-4).
- **`generatePracticeRow` behavior:**
  - **Systematic row:** for each `groupLetters` in order, append `compose(letter, 'fathah')`, `compose(letter, 'kasrah')`, `compose(letter, 'dammah')`. Result length: `3 × groupLetters.length` (9 cells when group is complete).
  - **Mixed row:** build the same 9 (or 3 / 6) combinations, then Fisher–Yates shuffle. Result length matches the systematic row.
- **`generatePracticeGrid` behavior:** returns 6 `PracticeRow` entries. Row 0 is `'systematic'`; rows 1–5 are `'mixed'`. Shuffle is invoked per mixed row, so each row is independently randomized.
- **Test coverage:** unit tests cover all edge cases (3 / 4 / 5 / 6 / 7 letters), the empty case (< 3 letters), Fisher–Yates determinism with a seeded RNG, and a non-connecting letter (e.g., ر) to confirm `composeLetter` is wired correctly.

### FR-3: `/learn/reading` Route

- **File:** `app/routes/learn/reading.tsx` (new file)
- **Auth:** Same middleware as `/learn` (T-03) — child-mode cookie or parent JWT.
- **Guard:** On mount, if `getReadingDataFn` returns `letters.length < 3`, redirect to `/learn` (defense-in-depth — the button is already disabled on `/learn`, but the route is directly accessible).
- **On mount:** call `preloadOnIdle(audioEngine)` (T-09b) and `useQuery(['readingData', profileId])` to fetch `getReadingDataFn`.
- **Local state:** `useState(0)` for `currentGroupIndex`. No persistence across navigation — re-entering the screen always starts at group 0.
- **Render order:**
  1. `ProfileBadge` (T-08)
  2. `ChildHarakatBar` (T-07)
  3. `GroupHeader` (FR-5) — current group's 3 letters
  4. `GroupPills` (FR-4) — one pill per group
  5. `ReadingGrid` (FR-6) — 6 rows
  6. `ReadingActions` (FR-8) — Shuffle / Next Group / Done
- **Loading state:** `LoadingSpinner` (T-08).
- **Error state:** inline error message + `refetch()` retry button (T-08 pattern).

### FR-4: `GroupPills` Component

- **File:** `app/components/child/reading/GroupPills.tsx` (new file)
- **Props:** `groups: ReadingGroup[]`, `activeIndex: number`, `onSelect: (index: number) => void`
- **Layout:** horizontal row of pill-shaped buttons, scrollable on overflow (`overflow-x-auto`, `flex-nowrap`).
- **Active pill:** filled background (`bg-emerald-500`, white text).
- **Inactive + complete pill:** outline (`border border-emerald-500`, emerald text), clickable.
- **Inactive + incomplete pill (1–2 letters):** outline (`border border-gray-300`, gray text), `disabled`, `cursor-not-allowed`, with a `title` attribute (native HTML tooltip) reading `"Needs 3 letters"` — and an `aria-disabled="true"` for screen readers.
- **Tap behavior:** complete pills call `onSelect(index)`; incomplete pills are no-ops.
- **Accessibility:** each pill is a `<button>` with `aria-label={group.label}` (e.g., `"Group 1: alif ba ta"`) and `aria-current={index === activeIndex ? 'true' : undefined}`.

### FR-5: `GroupHeader` Component

- **File:** `app/components/child/reading/GroupHeader.tsx` (new file)
- **Props:** `group: ReadingGroup`, `vowelMode: VowelMode`
- **Renders:** the group's 3 Arabic glyphs, composed via `composeLetter(char, vowelMode)`, large (`text-5xl` or `text-6xl`), horizontally centered, with generous spacing (`gap-6`).
- **Incomplete group:** if `!isComplete`, append a small `(N/3)` hint below (parent-only affordance — e.g., `(1/3)`). Children are unlikely to read this; it surfaces to the parent if they co-use the device. If this hint is judged too text-heavy, omit it — only render the glyphs.
- **Accessibility:** `aria-label="Current group: {label}"`, glyphs `aria-hidden`.

### FR-6: `ReadingGrid` Component

- **File:** `app/components/child/reading/ReadingGrid.tsx` (new file)
- **Props:** `group: ReadingGroup`, `vowelMode: VowelMode`, `grid: PracticeRow[]` (6 rows pre-computed by the route via `generatePracticeGrid`)
- **Layout:** `flex flex-col gap-2`, with one "Pattern" label above row 0 (per the answered spec), then 6 rows of `ReadingCell` components.
- **Pattern label:** small text (`text-sm text-gray-500`), left-aligned, "Pattern". `aria-hidden` (decorative). Rendered once above row 0, not repeated.
- **Row layout:** `flex flex-wrap gap-2` per row. Each row is rendered as a horizontal strip; cells within a row share the systematic-or-mixed order.
- **Vowel mode reactivity:** the component reads `useUiStore.currentHarakat` at render time, then re-derives the grid via `useMemo([group, currentHarakat])` calling `generatePracticeGrid`. (Mirrors the `LetterCard` pattern in T-08 — the route supplies data, the grid memoizes derived state.)
- **Empty case:** if `grid.length === 0` (e.g., group with 0 letters — should not happen, but guarded), render nothing.
- **Accessibility:** the wrapper is `role="grid"` with `aria-rowcount={6}` and `aria-colcount` per row; each row has `role="row"`, each cell has `role="gridcell"`.

### FR-7: `ReadingCell` Component

- **File:** `app/components/child/reading/ReadingCell.tsx` (new file)
- **Props:** `glyph: string` (precomposed), `letterId: string`, `vowelMode: VowelMode`
- **Layout:** square cell (`aspect-ratio: 1 / 1`, `min-h-[56px] min-w-[56px]`), light background (`bg-gray-50`), rounded (`rounded-lg`), centered glyph (`text-3xl font-arabic`).
- **Tap handler:**
  ```ts
  const onTap = () => {
    setFlashed(true);
    audioEngine.speak(letterChar, vowelMode).finally(() => setFlashed(false));
  };
  ```
  Where `letterChar` is looked up via a static `LETTER_MAP: Record<LetterId, string>` in the component (or passed in via a prop from the route) — see implementation note in FR-6.
- **Green flash (REQ-8.10):** `data-[flashed=true]:bg-emerald-200` + 200ms transition. Implementation uses a local `useState(false)` for `flashed`; the `.finally()` from `speak()` resets it. This is the only feedback per the answered spec — no overlay, no scale-bounce.
- **Accessibility:** `<button type="button">` with `aria-label="{letterId} {vowelMode}"` (e.g., `"alif fathah"`) and `aria-hidden` on the glyph.

### FR-8: `ReadingActions` Component

- **File:** `app/components/child/reading/ReadingActions.tsx` (new file)
- **Props:** `groups: ReadingGroup[]`, `currentIndex: number`, `onShuffle: () => void`, `onNext: () => void`, `onDone: () => void`
- **Layout:** horizontal row of 3 buttons (`flex gap-3`), each ≥ 56×56dp touch target.
- **Buttons:**
  - **Shuffle** — Lucide `Shuffle` icon, label "Shuffle". Calls `onShuffle` (route re-runs `generatePracticeGrid`, which re-shuffles the 5 mixed rows; the systematic row stays in place). The grid state is held in the route's `useState` (a `gridVersion` counter that increments on shuffle, or a stored `grid` that is recomputed).
  - **Next Group** — Lucide `ChevronRight` icon, label "Next Group". Calls `onNext` which does `(currentIndex + 1) % groups.length` (wrap-around). Disabled if the next group is incomplete (REQ-8.9: only the disabled _current_ group is unreachable, but per the spec we still allow navigation forward to the next _complete_ group).
  - **Done** — Lucide `Check` icon, label "Done". Calls `onDone` which navigates to `/learn` via `useNavigate()`.
- **Single-group case:** when `groups.length === 1`, the Next Group button is hidden entirely (per roadmap edge case: "Exactly 3 letters → single group, No next group button needed").
- **Accessibility:** all 3 buttons are `<button>` elements with `aria-label`, no icon-only ambiguity.

### FR-9: Vowel Mode Reactivity (no new code beyond usage)

- `useUiStore.currentHarakat` changes via `ChildHarakatBar` (T-07) → `ReadingGrid` re-memoizes its grid → all cells re-render with new harakat.
- The persisted `profile.vowelMode` (returned by `getReadingDataFn`) is used only as the initial value of `currentHarakat` when the route mounts.
- No server round-trip; no data refetch.
- Changing harakat does **not** change `currentGroupIndex` — the child stays on whichever group they were on.

### FR-10: `/learn` Integration (small change to T-08 file)

- **File:** `app/routes/learn.tsx` (existing — minimal edit)
- The disabled "Reading Practice" button (T-08) becomes an enabled `<Link to="/learn/reading">` when `visibleLetters.length >= 3`.
- One-line conditional: `disabled={visibleLetters.length < 3}` becomes the gating `to` prop on the `Link`.
- No new logic in the dashboard, no new server function — the button is wired straight to the route.

## Non-Functional Requirements

| Category       | Requirement                                               | Target                                                                  |
| -------------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Touch target   | Cell minimum size                                         | 56×56dp (cells); 56×56dp action buttons                                 |
| Audio latency  | Tap to audible                                            | < 150ms (T-09, idle preloaded)                                          |
| Performance    | No refetch on vowel change                                | `useMemo` re-derives the grid; no server call                           |
| Performance    | No refetch on shuffle                                     | Client-side `generatePracticeGrid` re-runs                              |
| Performance    | Group switch is instant                                   | All 6 rows pre-computed once; index change just re-renders              |
| Accessibility  | Touch targets, role/aria                                  | `<button>` elements, `role="grid"`, `aria-disabled` on incomplete pills |
| Responsiveness | Portrait + landscape                                      | Horizontal row of pills scrolls if too wide; grid uses flex-wrap        |
| Security       | `/learn/reading` requires child-mode cookie or parent JWT | Existing middleware (T-03)                                              |
| Reliability    | Audio silently no-ops if SpeechSynthesis unavailable      | T-09 graceful degradation                                               |
| Coverage       | New code                                                  | > 70% (workflow target)                                                 |

## Acceptance Criteria

1. `/learn/reading` renders for any authenticated child profile (parent JWT or child-mode cookie) with ≥ 3 visible letters.
2. Letters are grouped into chunks of 3, in display order, with `isComplete: false` on trailing 1–2 element groups.
3. The systematic Row 1 shows: for each group letter in order, `composeLetter(char, 'fathah')`, then `'kasrah'`, then `'dammah'`. For a 3-letter group, the row has 9 cells.
4. Rows 2–6 are each a Fisher–Yates shuffle of the same 9 (or fewer) combinations. Cell order is row-independent.
5. Tapping a cell flashes it green (~200ms) and calls `audioEngine.speak(letterChar, currentHarakat)`. The previous utterance is cancelled if a new cell is tapped before the old one finishes (T-09 cancel-on-new-speak).
6. Toggling the harakat bar re-renders all cells with the new vowel mode; group index and shuffle state are preserved.
7. Group pills: complete pills are clickable and switch the displayed group; incomplete pills are visibly disabled with a native tooltip "Needs 3 letters" and `aria-disabled="true"`.
8. The "Next Group" button advances `currentGroupIndex` and wraps from the last group to the first. Hidden entirely when only one group exists.
9. The "Shuffle" button re-runs `generatePracticeGrid` for the current group — only the 5 mixed rows are re-randomized; the systematic row stays in place.
10. The "Done" button navigates to `/learn`.
11. If `getReadingDataFn` returns `< 3` letters, the route redirects to `/learn` (defensive guard).
12. The "Reading Practice" button on `/learn` is now an enabled `<Link>` when `visibleLetters.length >= 3`.
13. All new code has unit tests: `generateReadingGroups`, `generatePracticeRow`, `generatePracticeGrid`, `getReadingDataFn`, and component tests for each child component.
14. TypeScript strict mode, ESLint, Prettier, and the full test suite all pass.
15. Coverage for new code is > 70%.

## Out of Scope

- Progress tracking, session history, or "last group" persistence (re-entering starts at group 0).
- Auto-play (tapping a cell is the only trigger).
- Cross-group / cross-row patterns (no "show me all 3 harakat for letter X" button).
- Custom shuffle seed (Fisher–Yates uses `Math.random`; seedable RNG is not needed for Phase 1).
- Animations beyond the 200ms green flash on tap.
- Audio file fallback (T-09 Web Speech API is the only path).
- Parent-side analytics ("which cells did Aisyah tap this week?") — Phase 2.
- i18n on the reading screen (per product guideline: child UI is icon/glyph based; the `Shuffle` / `Next Group` / `Done` labels here are parent-co-use affordances, not for the child to read).
- Multi-row row groups (e.g., systematic row shown twice in a row). The systematic row appears exactly once.

## Key Decisions

- **KD-1:** Trailing 1–2 letter groups are **disabled with a native `title` tooltip** reading "Needs 3 letters". Matches the roadmap's explicit edge-case spec. Native `title` keeps the component dependency-free (no Radix Tooltip needed for a one-off hint).
- **KD-2:** Cell tap feedback is **green flash only** (no overlay, no scale-bounce). The reading-practice pace is faster than the main grid — the user is drilling, not exploring — so a full-screen overlay would interrupt the flow. Audio plays in the background.
- **KD-3:** The systematic Row 1 has a **subtle "Pattern" label above it**, but the row itself uses the same cell styling as the randomized rows. Keeps the visual uniform for the child while still surfacing the structure for parents and older children.
- **KD-4:** `getReadingDataFn` lives in a new `app/server/reading.ts` (not in `app/server/letters.ts`) — reading data is a derived view, not a CRUD operation on the toggle table. One server function per concern.
- **KD-5:** `generatePracticeGrid` runs **once on mount and once on shuffle**, then is held in component state. Harakat changes re-memoize but do **not** increment the shuffle counter. (Shuffle and harakat are independent axes.)
- **KD-6:** Group index is held in the **route's** `useState`, not in a Zustand store. The reading screen is a single-purpose view — the state is not shared with the main grid.
- **KD-7:** The "Next Group" wrap-around is **implemented in the route's `onNext` callback** (`(i + 1) % groups.length`), not inside the `GroupPills` component. The component is presentational.

</protect>
