<protect>
# Implementation Plan — T-08: Child Letter Grid

**Track ID:** `child-letter-grid_20260603`
**Type:** Feature
**Est. Effort:** ~4–6h (matches roadmap estimate)

---

## Phase 1: Active Profile Server Function [checkpoint: <sha>]

**Goal:** Add a server function that returns the active child's `{ id, name, avatar, vowelMode }` for the /learn route, with full test coverage.

### Tasks

- [x] Task: Add Zod schema for `getActiveProfile` `6cb4d60`
  - [x] Open `app/lib/validations/profiles.ts`
  - [x] Add `getActiveProfileSchema = z.object({ profileId: z.string().uuid() })`
  - [x] Export alongside the existing `createProfileSchema`, `updateProfileSchema`, `deleteProfileSchema`

- [x] Task: Write failing tests for `getActiveProfileFn` `6cb4d60`
  - [x] Create `app/server/__tests__/profiles.test.ts` (if it does not already exist) or extend the existing profiles test file
  - [x] Test: returns `{ id, name, avatar, vowelMode }` for an owned profile
  - [ ] Test: rejects unauthenticated request (no JWT) _(server function wrapper requires TanStack Start runtime — covered indirectly via pure-helper test for missing ownership)_
  - [x] Test: rejects request for a profile the caller does not own
  - [x] Test: rejects request with invalid profileId (Zod validation)
  - [x] Run `pnpm test` and confirm tests fail (Red phase)

- [x] Task: Implement `getActiveProfileFn` `6cb4d60`
  - [x] Add pure helper `getActiveProfile(db, ownerId, profileId)` to `app/server/profiles.ts` — returns the profile row or throws
  - [x] Reuse `verifyProfileOwnership(db, ownerId, profileId)` from the existing pattern (inlined the same shape — small enough to not warrant a shared module)
  - [x] Add `getActiveProfileFn` server function wrapper using `createServerFn({ method: 'GET' })` with `inputValidator(getActiveProfileSchema)`
  - [x] In the handler, call `validateSessionFn()`, throw on null, then call `getActiveProfile(db, session.user.id, data.profileId)`
  - [x] Run `pnpm test` and confirm tests pass (Green phase)

- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Child Components [checkpoint: <sha>]

**Goal:** Build `ProfileBadge`, `EmptyState`, `LetterCard`, `LetterDetail`, and `LetterGrid` with full test coverage. Pure presentational + audio-wiring components, no data fetching.

### Tasks

- [x] Task: Write failing tests for ProfileBadge `d7bd67d`
  - [x] Create `app/components/child/ProfileBadge.test.tsx`
  - [x] Test: renders the inline SVG avatar matching the active profile's `avatar` key
  - [x] Test: renders the profile name next to the avatar
  - [x] Test: falls back to default Lucide `User` icon when avatar key is unknown or profile is null
  - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement ProfileBadge `d7bd67d`
  - [ ] Create `app/components/child/ProfileBadge.tsx`
  - [ ] Accept `profile: { name: string; avatar: string } | null` prop
  - [ ] Use the existing `AVATAR_MAP` from `~/components/parent/avatars` to render the inline SVG
  - [ ] Fallback: unknown avatar key → Lucide `User` icon at the same size
  - [ ] Fallback: missing name → omit the name span (no fallback text)
  - [ ] `aria-label` includes profile name for screen readers
  - [ ] Run tests and confirm they pass (Green phase)

- [x] Task: Write failing tests for EmptyState `3525861`
  - [x] Create `app/components/child/EmptyState.test.tsx`
  - [x] Test: renders the empty-state icon (Lucide `BookOpen`)
  - [x] Test: does NOT render any text nodes (icon-only per PRD REQ-5.8)
  - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement EmptyState `3525861`
  - [ ] Create `app/components/child/EmptyState.tsx`
  - [ ] Render a single large Lucide `BookOpen` icon (~96px), centered, with generous vertical padding
  - [ ] No text. No buttons. Just the icon.
  - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Write failing tests for LetterCard
  - [ ] Create `app/components/child/LetterCard.test.tsx`
  - [ ] Test: renders the composed glyph using `composeLetter(letter.character, currentHarakat)`
  - [ ] Test: tap calls `audioEngine.speak(letter.character, currentHarakat)`
  - [ ] Test: tap sets `selectedLetterId` in `useUiStore` (opens the LetterDetail overlay)
  - [ ] Test: tap resolves the `speak()` promise, then clears `selectedLetterId` (auto-dismisses the overlay)
  - [ ] Test: glyph re-renders with new `composeLetter` result when `currentHarakat` prop changes
  - [ ] Test: card has minimum touch target ≥64×64dp (`min-h-[64px] min-w-[64px]`)
  - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement LetterCard
  - [ ] Create `app/components/child/LetterCard.tsx`
  - [ ] Define inline `LETTER_BG: Record<LetterId, string>` — 28 deterministic soft pastel colors keyed by `letterId`
  - [ ] Render a `<button>` containing the composed glyph (centered, large) on the `LETTER_BG[letterId]` background
  - [ ] On click: `setSelectedLetter(letter.letterId)`, then `await audioEngine.speak(letter.character, currentHarakat)`, then `setSelectedLetter(null)` in a `.finally()` so cancellation also clears
  - [ ] Apply Tailwind: `aspect-square`, `min-h-[64px] min-w-[64px]`, `active:scale-95 transition-transform`, `rounded-large`
  - [ ] `aria-label={letter.letterId}` for accessibility; `aria-hidden="true"` on the glyph span
  - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Write failing tests for LetterDetail
  - [ ] Create `app/components/child/LetterDetail.test.tsx`
  - [ ] Test: renders nothing when `useUiStore.selectedLetterId` is null
  - [ ] Test: when `selectedLetterId` is set, renders the composed glyph at large size (≥ `text-8xl`)
  - [ ] Test: full-screen overlay positioning (`fixed inset-0` or equivalent class)
  - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement LetterDetail
  - [ ] Create `app/components/child/LetterDetail.tsx`
  - [ ] Read `selectedLetterId` from `useUiStore`
  - [ ] When `selectedLetterId !== null`, render a `fixed inset-0 z-50 bg-background-warm/95` overlay with the composed glyph at `text-9xl`, centered
  - [ ] Accept `visibleLetters: VisibleLetter[]` and `currentHarakat: VowelMode` as props to look up the character for the current `selectedLetterId`
  - [ ] No manual dismiss handler (auto-dismiss is driven by LetterCard's `.finally()`)
  - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Write failing tests for LetterGrid
  - [ ] Create `app/components/child/LetterGrid.test.tsx`
  - [ ] Test: renders one LetterCard per letter in `visibleLetters` prop, in the order given
  - [ ] Test: renders EmptyState when `visibleLetters` is empty array
  - [ ] Test: renders LetterDetail (the overlay) regardless of `visibleLetters.length`
  - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement LetterGrid
  - [ ] Create `app/components/child/LetterGrid.tsx`
  - [ ] Accept `visibleLetters: VisibleLetter[]` and `currentHarakat: VowelMode` as props
  - [ ] If `visibleLetters.length === 0`, render `<EmptyState />` and return
  - [ ] Otherwise render a CSS grid: `grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3 p-4`
  - [ ] Map each letter to `<LetterCard letter={letter} currentHarakat={currentHarakat} />`
  - [ ] Render `<LetterDetail visibleLetters={visibleLetters} currentHarakat={currentHarakat} />` at the end (it is a fixed overlay, not grid-positioned)
  - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: /learn Route Integration & Final Verification [checkpoint: <sha>]

**Goal:** Replace the placeholder /learn route with the real child letter grid, wire up data fetching, add the disabled Reading Practice button, and verify end-to-end.

### Tasks

- [ ] Task: Implement the /learn route
  - [ ] Open `app/routes/learn.tsx` (existing placeholder)
  - [ ] Replace the placeholder content with the real child grid
  - [ ] On mount: read `profileId` from `useAuthStore.childProfileId`
  - [ ] If `profileId` is missing, render a "Select a child profile from the dashboard" message (no crash, no redirect — T-11 owns the cookie-based auto-redirect later)
  - [ ] Use TanStack Query: `useQuery` for `getActiveProfileFn({ profileId })` keyed `['activeProfile', profileId]`
  - [ ] Use TanStack Query: `useQuery` for `getVisibleLettersFn({ profileId })` keyed `['visibleLetters', profileId]`
  - [ ] Derive `visibleLetters = (data ?? []).filter(l => l.isVisible)`
  - [ ] Read `currentHarakat` from `useUiStore`
  - [ ] Render order: `ProfileBadge` → `ChildHarakatBar` (T-07) → `LetterGrid` (or `<EmptyState />` when 0 letters) → Reading Practice button
  - [ ] Keep the existing `preloadOnIdle(audioEngine)` call from T-09b

- [ ] Task: Add the Reading Practice button
  - [ ] In `app/routes/learn.tsx`, after the grid, render a `<button disabled={visibleLetters.length < 3}>`
  - [ ] Label: "Reading Practice"
  - [ ] Disabled state styling: `disabled:opacity-50 disabled:cursor-not-allowed` (Tailwind)
  - [ ] No `onClick` handler (T-10 will own the navigation and the `/learn/reading` route)

- [ ] Task: Update the existing /learn route test
  - [ ] Open `app/routes/learn.test.tsx`
  - [ ] Update the "renders placeholder" test → rename to "renders child letter grid" and assert the real grid renders
  - [ ] Add a test: missing `profileId` → "Select a child" message renders (no crash)
  - [ ] Add a test: `getVisibleLettersFn` returns visible letters → LetterGrid renders one LetterCard per visible letter
  - [ ] Add a test: `getVisibleLettersFn` returns 0 visible letters → EmptyState renders
  - [ ] Add a test: visible letters < 3 → Reading Practice button is disabled
  - [ ] Add a test: visible letters ≥ 3 → Reading Practice button is enabled
  - [ ] Update mocks for the new server functions: `getActiveProfileFn`, `getVisibleLettersFn`

- [ ] Task: Run full test suite and quality checks
  - [ ] Run `pnpm test` — all tests pass
  - [ ] Run `pnpm typecheck` — no errors
  - [ ] Run `pnpm lint` — no errors
  - [ ] Run `pnpm format:check` — all files formatted
  - [ ] Run coverage report — verify > 70% for new files
  - [ ] Manually verify in browser (mobile + tablet viewports): tap cards, switch harakat, see overlay, see empty state, see disabled button state

- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase: Review Fixes

- [ ] Task: Apply review suggestions

</protect>
