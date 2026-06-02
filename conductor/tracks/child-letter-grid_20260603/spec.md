<protect>
# T-08: Child Letter Grid — Specification

## Overview

Build the child-facing letter grid at `/learn` showing only the letters the parent has toggled ON for the active child profile. Each card is a large tappable target that triggers Web Speech API pronunciation. The grid is the child's primary exploration surface — no text, no instructions, just glyphs that respond to touch with audio.

**Dependencies:** T-06 (Letter Toggles), T-07 (Vowel Mode / Harakat), T-09 (Audio Service), T-09b (Audio Preloader)
**PRD Ref:** §4 — Module 5 (Child Letter Grid), Module 6 (Audio Engine), REQ-5.1 through REQ-5.8
**TDD Ref:** §1 (Project Structure — `app/components/child/`), §2 (Route Design — `/learn`), §7 (Audio Architecture integration)

## Functional Requirements

### FR-1: Active Profile Server Function (`getActiveProfileFn`)

A new server function provides the active child's `{ name, avatar, vowelMode }` to the `/learn` route. Both child-mode cookie and parent JWT are accepted.

- Method: GET
- Zod Schema: `getActiveProfileSchema` (`profileId: z.string().uuid()`) in `app/lib/validations/profiles.ts`
- Auth: Parent JWT (must own the profile) OR child-mode cookie (must match `profileId`) — both flow through the existing `validateSessionFn`
- Returns: `{ id: string, name: string, avatar: string, vowelMode: VowelMode }`
- Purpose: Lets the `ProfileBadge` show the active child's avatar + name without embedding PII in the child-mode cookie.

Implementation: add pure helper `getActiveProfile(db, ownerId, profileId)` and server function wrapper `getActiveProfileFn` in `app/server/profiles.ts`, next to `listProfilesFn`. Reuses the existing `verifyProfileOwnership` pattern.

### FR-2: LetterGrid Component (`app/components/child/LetterGrid.tsx`)

- Renders only letters where `isVisible === true`, in `displayOrder` (1–28).
- Responsive CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))`, portrait-first, adapts to landscape.
- Empty state: when `visibleLetters.length === 0`, render `EmptyState` instead of the grid.
- Loading state: while `getVisibleLettersFn` is pending, show the existing `LoadingSpinner`.
- Error state: on fetch failure, render an inline error message with a retry button that calls `refetch()` (matches the `ProfileList` pattern from T-05).

### FR-3: LetterCard Component (`app/components/child/LetterCard.tsx`)

- Square card (`aspect-ratio: 1 / 1`, min 64×64dp per PRD REQ-5.3, scales up via grid cell).
- Glyph: uses `composeLetter(letter.character, currentHarakat)` from `~/lib/utils/harakat` (DD-6). Harakat re-renders reactively when the child changes the vowel mode.
- Background: deterministic soft pastel color keyed by `letterId` (28 colors). Palette defined inline as `const LETTER_BG: Record<LetterId, string>` in the component.
- Tap: triggers `audioEngine.speak(letter.character, currentHarakat)`. Uses `currentHarakat` from `useUiStore` (child's session-only override).
- Tap animation: brief scale-bounce on press via Tailwind `active:scale-95 transition-transform` (PRD REQ-5.7).
- During playback: the `LetterDetail` full-screen overlay opens (FR-4). The card itself does not need a separate "active" visual state — the overlay provides the focus cue.

### FR-4: LetterDetail Component (`app/components/child/LetterDetail.tsx`)

- Full-screen overlay (fixed positioning, `inset-0`, `z-50`) shown when a letter is playing.
- Renders the same composed glyph (`composeLetter(letter.character, currentHarakat)`) very large (e.g., `text-9xl`), centered.
- Listens for `audioEngine.speak(...)` to resolve → auto-dismisses back to the grid (PRD REQ-5.6).
- Backdrop tap is disabled — playback always completes before returning (no manual dismiss mid-playback).
- Tapping a different card while overlay is open replaces the current letter (T-09 `cancel-on-new-speak` handles the audio; the overlay shows the new letter).
- Open state: `useUiStore.selectedLetterId !== null`.

### FR-5: EmptyState Component (`app/components/child/EmptyState.tsx`)

- Shown when `visibleLetters.length === 0` (zero letters toggled on).
- Icon-only illustration: large Lucide `BookOpen` (or similar) icon, ~96px, centered.
- No text, per PRD REQ-5.8 and the "no text instructions" core tenet (icon-based for pre-literate children).
- Generous vertical padding (`py-24`) to feel intentional, not empty.

### FR-6: ProfileBadge Component (`app/components/child/ProfileBadge.tsx`)

- Shown at the top of `/learn` route (above the harakat bar).
- Avatar: the inline SVG component from `~/components/parent/avatars` (8 themed avatars, same map as parent dashboard).
- Name: shown next to the avatar (one short line, e.g., "Aisyah").
- If `getActiveProfileFn` fails, fall back to a default avatar (`?` glyph) + no name — the child grid must still render, not crash.
- `aria-label` includes the profile name for screen readers.

### FR-7: Reading Practice Button (disabled state only)

- A button at the bottom of the grid, label: "Reading Practice".
- **Disabled when `visibleLetters.length < 3`** (DD-3 — 1–2 letters produce a sparse unusable grid).
- Visually distinct disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`.
- No `onClick` handler in T-08 — T-10 owns the navigation and the `/learn/reading` route.

### FR-8: `/learn` Route Integration

- The existing `app/routes/learn.tsx` placeholder is replaced with the real grid.
- Middleware (T-03) already accepts either parent JWT or child-mode cookie. The route reads `profileId` from `useAuthStore.childProfileId` (set by the parent dashboard's profile selection or, in future, by T-11 child-mode cookie).
- On mount (in a `useEffect` or via TanStack Query `enabled`):
  1. Fetch `getActiveProfileFn({ profileId })` → store in `useChildStore.activeProfile` (TanStack Query cache, keyed `['activeProfile', profileId]`).
  2. Fetch `getVisibleLettersFn({ profileId })` → filter to `isVisible === true` → store in `useChildStore.visibleLetters` (TanStack Query cache, keyed `['visibleLetters', profileId]`).
  3. Call `preloadOnIdle(audioEngine)` (already wired in T-09b — keep that line in the route).
- Render order: `ProfileBadge` → `ChildHarakatBar` (from T-07) → `LetterGrid` (or `EmptyState`) → Reading Practice button.

### FR-9: Vowel Mode Re-render (no new code beyond usage)

- `useUiStore.currentHarakat` changes via `ChildHarakatBar` → all `LetterCard` glyphs recompose via `composeLetter()`.
- `currentHarakat` is read at render time, not stored on each card.
- No server round-trip; no data refetch; no animation needed (React re-render is instant).

## Non-Functional Requirements

| Category       | Requirement                                         | Target                                                                |
| -------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| Touch target   | Card minimum size                                   | 64×64dp (PRD REQ-5.3)                                                 |
| Audio latency  | Tap to audible                                      | < 150ms (T-09, idle preloaded)                                        |
| Performance    | No refetch on vowel change                          | Reuse cache, re-render only                                           |
| Accessibility  | Touch targets, role/aria                            | `<button>` elements with `aria-label`; decorative glyph `aria-hidden` |
| Responsiveness | Portrait + landscape                                | CSS Grid `auto-fill, minmax(80px, 1fr)`                               |
| Security       | `/learn` requires child-mode cookie or parent JWT   | Existing middleware (T-03)                                            |
| Reliability    | Audio silently no-op if SpeechSynthesis unavailable | T-09 graceful degradation                                             |
| Coverage       | New code                                            | > 70% (workflow target)                                               |

## Acceptance Criteria

1. `/learn` route shows only letters with `isVisible === true` from `getVisibleLettersFn`.
2. Letters render in `displayOrder` (1–28).
3. Tapping a letter card:
   a. Plays the composed glyph via `audioEngine.speak(letter.character, currentHarakat)`.
   b. Shows the `LetterDetail` full-screen overlay.
   c. Auto-dismisses the overlay when playback ends.
4. Vowel mode toggle on the harakat bar re-renders all card glyphs without a refetch.
5. Zero visible letters → `EmptyState` renders, no card grid.
6. `getActiveProfileFn` returns `{ id, name, avatar, vowelMode }` for the active profile; rejects unauthenticated/wrong-owner requests.
7. The Reading Practice button is disabled when fewer than 3 letters are visible.
8. Touch targets are ≥64×64dp; tested in portrait and landscape viewports.
9. TypeScript strict mode, ESLint, Prettier, and full test suite (`pnpm test`) all pass.
10. Coverage for new code is > 70%.

## Out of Scope

- Reading Practice route (`/learn/reading`), its grid, group navigation, shuffle, and systematic/mixed row generation (T-10).
- Child Mode cookie management (T-11). T-08 only consumes the `profileId` that auth-store already provides.
- Profile CRUD and parent harakat selector (T-05/T-07).
- Touch-drag, gestures, or pinch-zoom.
- Animations beyond the tap bounce and overlay transition.
- Progress reporting, analytics, or session tracking.
- Internationalization on the child UI (per product guideline: child UI is icon/glyph based).
- Pre-recorded audio file fallback (T-09 uses Web Speech API; file fallback is a future upgrade path documented in T-09).

## Key Decisions

- **KD-1**: The Reading Practice button shows the literal label "Reading Practice" — not icon-only — because it's only ever visible when ≥3 letters exist (a parent co-use scenario), and the label helps the parent understand why it's still disabled if the parent is co-using the device.
- **KD-2**: `getActiveProfileFn` lives in `app/server/profiles.ts` next to existing profile server functions, reuses `verifyProfileOwnership` and `validateSessionFn` patterns.
- **KD-3**: The per-letter color palette is defined inline in `LetterCard.tsx` as `const LETTER_BG: Record<LetterId, string>` — 28 entries, no design tokens file, no external config. Pastel enough not to compete with the glyph.
- **KD-4**: `LetterDetail` listens to the `audioEngine.speak()` Promise resolution (not a separate timeout). Auto-dismiss timing is honest — it matches real playback end, including cancellation.
- **KD-5**: Tapping the same letter during playback is allowed and restarts the utterance (T-09 `cancel-on-new-speak` handles audio; the overlay continues to show the same letter).
- **KD-6**: `useUiStore.selectedLetterId` (already exists in the store, previously unused in the child grid) is the open/closed flag for the `LetterDetail` overlay. No new state needed.

</protect>
