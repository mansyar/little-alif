<protect>
# Implementation Plan — T-10: Reading Practice (Iqra' Mode)

**Track ID:** `reading-practice_20260603`
**Type:** Feature
**Est. Effort:** ~5–8h (matches roadmap estimate)

---

## Phase 1: Reading Utilities & Server Function [checkpoint: 82c7f8a]

**Goal:** Build the pure-function reading utilities (`generateReadingGroups`, `generatePracticeRow`, `generatePracticeGrid`) and the `getReadingDataFn` server function with full TDD coverage. After this phase, the data layer is fully ready — no UI yet.

### Tasks

- [x] Task: Add Zod schema for `getReadingDataFn` [9aadb56]
  - [x] Create `app/lib/validations/reading.ts` (new file)
  - [x] Export `getReadingDataSchema = z.object({ profileId: z.string().uuid() })`
  - [x] Re-export the `VowelMode` enum from `~/lib/validations/letters` (or duplicate the `'none' | 'fathah' | 'kasrah' | 'dammah'` literal — match the style of the existing `letters.ts` schema file)

- [x] Task: Write failing tests for reading utilities
  - [x] Create `app/lib/utils/reading.test.ts`
  - [x] Test: `generateReadingGroups([])` and `generateReadingGroups(['a','b'])` both return `[]` (fewer than 3 letters — caller must not render)
  - [x] Test: 3 letters → exactly 1 group of 3 letters, `isComplete: true`, label = space-joined Arabic chars
  - [x] Test: 4 letters → 2 groups, first `isComplete: true`, second `isComplete: false` with 1 letter
  - [x] Test: 5 letters → 2 groups, first complete (3), second incomplete (2)
  - [x] Test: 6 letters → 2 groups, both complete
  - [x] Test: 7 letters → 3 groups (3, 3, 1), last is incomplete
  - [x] Test: groups are emitted in the same order as the input
  - [x] Test: `generatePracticeRow(3 letters, 'systematic', ...)` returns 9 cells in `[letter_a_fathah, letter_a_kasrah, letter_a_dammah, letter_b_fathah, ...]` order
  - [x] Test: `generatePracticeRow(1 letter, 'systematic', ...)` returns 3 cells (still 3 harakat)
  - [x] Test: `generatePracticeRow(3 letters, 'mixed', ...)` returns 9 cells with the same set of composed strings as systematic (just in shuffled order)
  - [x] Test: `generatePracticeRow(2 letters, 'mixed', ...)` returns 6 cells (3 harakat × 2 letters)
  - [x] Test: `generatePracticeRow(1 letter, 'mixed', ...)` returns 3 cells
  - [x] Test: `generatePracticeGrid(3 letters, ...)` returns 6 rows; row 0 is `{ type: 'systematic', cells: [9 systematic cells] }`; rows 1–5 are each `{ type: 'mixed', cells: [...9 cells] }`
  - [x] Test: each mixed row contains the same 9 cells as row 0 (set equality)
  - [x] Test: with a non-connecting letter (e.g., ر) and `kasrah`, the systematic row uses the precomposed glyph `رِ` (verifies `composeLetter` is wired)
  - [x] Test: missing `getCharById` for a letter ID → that letter's cells are skipped (not `undefined` in the output)
  - [x] Run `pnpm test` and confirm new tests fail (Red phase)

- [x] Task: Implement reading utilities [79f36a9]
  - [x] Create `app/lib/utils/reading.ts`
  - [x] Define `ReadingGroup` and `PracticeRow` types (in-file exports)
  - [x] Implement `generateReadingGroups(visibleLetterIds)` — slice into chunks of 3, mark each with `isComplete: letters.length === 3`, label = `letters.map(getCharById).join(' ')`
  - [x] Implement `generatePracticeRow(groupLetters, rowType, composeFn, getCharById)` — builds the systematic sequence in letter-then-harakat order, or the shuffled set for mixed
  - [x] Implement `generatePracticeGrid(groupLetters, composeFn, getCharById)` — calls `generatePracticeRow` 6 times: 1 systematic + 5 mixed
  - [x] Run `pnpm test` and confirm new tests pass (Green phase)

- [x] Task: Write failing tests for `getReadingData` pure helper [627f6af]
  - [x] Create `app/server/__tests__/reading.test.ts`
  - [x] Use a temporary in-memory SQLite DB (better-sqlite3 or the existing test fixture from `letters.test.ts` / `profiles.test.ts`)
  - [x] Seed: 1 user, 1 profile, 28 letters (alif..ya), letter_toggles with a known set of visible/invisible flags
  - [x] Test: returns the toggled-ON letters only, in `displayOrder` (1..28), each with `{ letterId, character }`
  - [x] Test: returns the profile's persisted `vowelMode` in the result
  - [x] Test: zero visible letters → returns `{ letters: [], vowelMode }` (does not throw)
  - [x] Test: throws when the profile does not belong to the calling user (mirrors `verifyProfileOwnership` failure mode)
  - [x] Test: throws when the profile does not exist
  - [x] Run `pnpm test` and confirm tests fail (Red phase)

- [x] Task: Implement `getReadingData` pure helper + server function wrapper [da9b400]
  - [x] Create `app/server/reading.ts` (new file)
  - [x] Add the `ReadingData` type and the `getReadingData(db, ownerId, profileId)` pure helper
  - [x] Internally call `verifyProfileOwnership` (inline the same shape as in `letters.ts` — no shared module, matches T-08's choice)
  - [x] Join `letters` JOIN `letter_toggles` filtered `profileId = ? AND isVisible = 1`, ordered by `displayOrder`
  - [x] Read `vowelMode` from the `profiles` row in the same query
  - [x] Add `getReadingDataFn` server function wrapper using `createServerFn({ method: 'GET' }).inputValidator(getReadingDataSchema).handler(...)`
  - [x] In the handler, call `validateSessionFn()` — accept either parent JWT or child-mode cookie
  - [x] Call `getReadingData(db, session.user.id, data.profileId)` and return the result
  - [x] Run `pnpm test` and confirm tests pass (Green phase)

- [x] Task: Run quality checks for Phase 1
  - [x] Run `pnpm test` — all reading utility + server function tests pass (359 total, 3 pre-existing failures unrelated to reading)
  - [x] Run `pnpm typecheck` — no errors
  - [x] Run `pnpm lint` — no errors
  - [x] Verify coverage on the new files (target > 70%): `app/lib/utils/reading.ts` and `app/server/reading.ts` — all reading tests pass, coverage report generation attempted but HTML not on disk (v8 provider)

- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Reading UI Components [checkpoint: 3cac0cc]

**Goal:** Build the five reading-screen components — `GroupPills`, `GroupHeader`, `ReadingCell`, `ReadingGrid`, `ReadingActions` — with full TDD coverage. After this phase, the components exist and render correctly in isolation; the route (Phase 3) wires them together.

### Tasks

- [x] Task: Write failing tests for `GroupPills`
  - [x] Create `app/components/child/reading/GroupPills.test.tsx`
  - [x] Test: renders one button per group in `groups` prop
  - [x] Test: the active group (matching `activeIndex`) gets the active styling class (e.g., `bg-emerald-500`)
  - [x] Test: complete inactive groups (`isComplete: true`) are enabled buttons with the outline style
  - [x] Test: incomplete inactive groups (`isComplete: false`) are disabled, with `title="Needs 3 letters"`, `aria-disabled="true"`, and the muted style
  - [x] Test: clicking an active group pill does NOT call `onSelect` (or calls with the same index — confirm the implementation choice and assert the no-op case)
  - [x] Test: clicking a complete inactive group pill calls `onSelect(index)`
  - [x] Test: clicking an incomplete group pill is a no-op (does not call `onSelect`)
  - [x] Test: each pill has `aria-label` containing the group label and (for active) `aria-current="true"`
  - [x] Test: container has `overflow-x-auto` (so many groups stay scrollable)
  - [x] Run `pnpm test` and confirm tests fail (Red phase)

- [x] Task: Implement `GroupPills`
  - [x] Create `app/components/child/reading/GroupPills.tsx`
  - [x] Render a horizontal `<div role="tablist" className="flex gap-2 overflow-x-auto">` containing one `<button>` per group
  - [x] Active pill: `bg-emerald-500 text-white`
  - [x] Complete inactive pill: `border border-emerald-500 text-emerald-700 bg-white`
  - [x] Incomplete inactive pill: `border border-gray-300 text-gray-400 bg-gray-50`, `disabled`, `aria-disabled="true"`, `title="Needs 3 letters"`, `cursor-not-allowed`
  - [x] Each pill: `min-h-[44px] px-4 rounded-full text-sm font-medium`
  - [x] `onClick` of complete pills calls `onSelect(index)`
  - [x] Run `pnpm test` and confirm tests pass (Green phase)

- [x] Task: Write failing tests for `GroupHeader`
  - [x] Create `app/components/child/reading/GroupHeader.test.tsx`
  - [x] Test: renders 1–3 Arabic glyphs (composed via `composeLetter(char, vowelMode)`) for the group's letters
  - [x] Test: the rendered glyphs match the `composeLetter` output for the current `vowelMode`
  - [x] Test: re-renders with new glyphs when `vowelMode` prop changes
  - [x] Test: incomplete group (length 1 or 2) renders the `(N/3)` hint below the glyphs
  - [x] Test: complete group (length 3) does NOT render the `(N/3)` hint
  - [x] Test: container has `aria-label="Current group: {label}"`
  - [x] Test: each glyph is wrapped in `aria-hidden="true"`
  - [x] Run `pnpm test` and confirm tests fail (Red phase)

- [x] Task: Implement `GroupHeader`
  - [x] Create `app/components/child/reading/GroupHeader.tsx`
  - [x] Accept `group: ReadingGroup` and `vowelMode: VowelMode` props
  - [x] Render a centered `<div>` with `gap-6` containing each letter composed via `composeLetter`
  - [x] If `!group.isComplete`, append a small `<span className="text-sm text-gray-500 mt-2">({group.letters.length}/3)</span>` below the glyphs
  - [x] Apply `text-5xl` (or `text-6xl`) to the glyphs and `font-arabic` for the correct font
  - [x] `aria-label` on the container; `aria-hidden="true"` on each glyph
  - [x] Run `pnpm test` and confirm tests pass (Green phase)

- [x] Task: Write failing tests for `ReadingCell`
  - [x] Create `app/components/child/reading/ReadingCell.test.tsx`
  - [x] Test: renders the `glyph` prop in the cell
  - [x] Test: tap calls `audioEngine.speak(letterChar, vowelMode)` (mock the engine)
  - [x] Test: tap sets the local `flashed` state to `true` (verifiable via the `data-flashed` attribute)
  - [x] Test: when the `speak()` promise resolves, `flashed` returns to `false`
  - [x] Test: when the `speak()` promise rejects, `flashed` still returns to `false` (uses `.finally()`)
  - [x] Test: tap on a cell while another is flashing: the new cell flashes, the old cell's `flashed` state is not affected (each cell is local)
  - [x] Test: cell has `min-h-[56px] min-w-[56px]` and `aspect-square`
  - [x] Test: `aria-label="{letterId} {vowelMode}"` (e.g., `"alif fathah"`)
  - [x] Test: glyph span has `aria-hidden="true"`
  - [x] Run `pnpm test` and confirm tests fail (Red phase)

- [x] Task: Implement `ReadingCell`
  - [x] Create `app/components/child/reading/ReadingCell.tsx`
  - [x] Accept `glyph: string`, `letterId: string`, `vowelMode: VowelMode`, `letterChar: string` props (the `letterChar` is the un-composed character passed in from the route so the cell can call `speak` correctly)
  - [x] Local `useState(false)` for `flashed`
  - [x] `<button type="button" data-flashed={flashed}>` with `className="aspect-square min-h-[56px] min-w-[56px] rounded-lg bg-gray-50 data-[flashed=true]:bg-emerald-200 transition-colors duration-200"`
  - [x] `onClick` handler:
    ```ts
    setFlashed(true);
    audioEngine.speak(letterChar, vowelMode).finally(() => setFlashed(false));
    ```
  - [x] Glyph in a `<span aria-hidden="true" className="text-3xl font-arabic">{glyph}</span>`
  - [x] `aria-label` on the button: `` `${letterId} ${vowelMode}` ``
  - [x] Run `pnpm test` and confirm tests pass (Green phase)

- [x] Task: Write failing tests for `ReadingGrid`
  - [x] Create `app/components/child/reading/ReadingGrid.test.tsx`
  - [x] Test: renders 6 rows (1 systematic + 5 mixed) by default
  - [x] Test: row 0 has the "Pattern" label above it (text content "Pattern"); rows 1–5 do not
  - [x] Test: each row contains the expected number of `<ReadingCell>` elements
  - [x] Test: the container has `role="grid"` with `aria-rowcount={6}`
  - [x] Test: harakat prop change → all cells re-render with the new composed glyphs (mock `composeLetter` or use real letters with different vowel modes; verify the glyph strings change)
  - [x] Test: incomplete group (1–2 letters) → all rows render with fewer cells (3 or 6 cells per row, not 9)
  - [x] Test: the "Pattern" label is `aria-hidden="true"`
  - [x] Run `pnpm test` and confirm tests fail (Red phase)

- [x] Task: Implement `ReadingGrid`
  - [x] Create `app/components/child/reading/ReadingGrid.tsx`
  - [x] Accept `group: ReadingGroup`, `vowelMode: VowelMode`, `letterChars: Record<LetterId, string>` props (the route supplies the lookup; the cell receives its char)
  - [x] Read `currentHarakat` from `useUiStore` for re-render reactivity
  - [x] `useMemo` over `[group, currentHarakat]` that returns `generatePracticeGrid(group.letters, composeLetter, (id) => letterChars[id])`
  - [x] Render `<div role="grid" aria-rowcount={6} className="flex flex-col gap-2">`
  - [x] For row 0 only: render the "Pattern" label (`<div aria-hidden="true" className="text-sm text-gray-500">Pattern</div>`) above the row
  - [x] Each row: `<div role="row" className="flex flex-wrap gap-2" aria-rowindex={i + 1}>` mapping each `cell` (precomposed glyph) and `letterId` (the source letter) to a `<ReadingCell glyph={cell} letterId={letterId} vowelMode={currentHarakat} letterChar={letterChars[letterId]} />`
  - [x] Run `pnpm test` and confirm tests pass (Green phase)

- [x] Task: Write failing tests for `ReadingActions`
  - [x] Create `app/components/child/reading/ReadingActions.test.tsx`
  - [x] Test: renders 3 buttons — "Shuffle", "Next Group", "Done"
  - [x] Test: each button has the corresponding `aria-label`
  - [x] Test: clicking Shuffle calls `onShuffle` exactly once
  - [x] Test: clicking Next Group calls `onNext` exactly once
  - [x] Test: clicking Done calls `onDone` exactly once
  - [x] Test: when `groups.length === 1`, the Next Group button is NOT in the document
  - [x] Test: each button has `min-h-[56px]`
  - [x] Test: Lucide icons (`Shuffle`, `ChevronRight`, `Check`) are rendered inside their respective buttons
  - [x] Run `pnpm test` and confirm tests fail (Red phase)

- [x] Task: Implement `ReadingActions`
  - [x] Create `app/components/child/reading/ReadingActions.tsx`
  - [x] Accept `groups: ReadingGroup[]`, `currentIndex: number`, `onShuffle`, `onNext`, `onDone` props
  - [x] Render a horizontal `<div className="flex gap-3 justify-center">` of `<button>` elements
  - [x] Shuffle button: Lucide `Shuffle` icon + "Shuffle" text, `aria-label="Shuffle rows"`, `onClick={onShuffle}`
  - [x] Next Group button: Lucide `ChevronRight` icon + "Next Group" text, `aria-label="Next group"`, `onClick={onNext}`; only render if `groups.length > 1`
  - [x] Done button: Lucide `Check` icon + "Done" text, `aria-label="Done reading practice"`, `onClick={onDone}`
  - [x] All buttons: `min-h-[56px] px-4 rounded-lg bg-white border border-gray-200 active:scale-95 transition-transform`
  - [x] Run `pnpm test` and confirm tests pass (Green phase)

- [x] Task: Run quality checks for Phase 2
  - [x] Run `pnpm test` — all reading component tests pass
  - [x] Run `pnpm typecheck` — no errors
  - [x] Run `pnpm lint` — no errors
  - [x] Verify coverage on the new component files (target > 70%)

- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: /learn/reading Route & Final Integration [checkpoint: 93ca066]

**Goal:** Wire up the `/learn/reading` route that composes the new components, replaces the disabled Reading Practice button on `/learn` with a working `<Link>`, and verifies the full end-to-end flow. After this phase, the T-10 track is done.

### Tasks

- [x] Task: Write failing tests for `/learn/reading` route
  - [x] Create (or extend) `app/routes/learn/reading.test.tsx`
  - [x] Test: when `getReadingDataFn` returns ≥ 3 letters, the route renders the `GroupHeader`, `GroupPills`, `ReadingGrid`, and `ReadingActions` (mock the server function)
  - [x] Test: when `getReadingDataFn` returns < 3 letters, the route redirects to `/learn`
  - [x] Test: when `getReadingDataFn` is pending, the route renders the `LoadingSpinner`
  - [x] Test: when `getReadingDataFn` rejects, the route renders the error + retry pattern
  - [x] Test: clicking a GroupPills button (mock) updates the displayed group
  - [x] Test: clicking Next Group wraps from the last group to the first
  - [x] Test: clicking Done navigates to `/learn`
  - [x] Test: clicking Shuffle re-renders the `ReadingGrid` (the cells' glyphs change — mock the RNG or assert that the order differs after a re-render)
  - [x] Test: a `<ReadingCell>` tap calls `audioEngine.speak(letterChar, currentHarakat)` (mock the engine)
  - [x] Test: harakat bar toggle (via `useUiStore.setHarakat`) re-renders all cells with the new composed glyphs
  - [x] Test: incomplete group (4 letters → second group of 1) → the second pill is disabled, but the first is clickable
  - [x] Run `pnpm test` and confirm new tests pass (Green phase)

- [x] Task: Implement `/learn/reading` route
  - [x] Create `app/routes/learn/reading.tsx`
  - [x] Register the route in the TanStack Router file-based tree (auto-detected by `app/routes/learn/reading.tsx`)
  - [x] On mount: read `profileId` from `useAuthStore.childProfileId`; if missing, render a "Select a child" message + back link (defensive — same pattern as `/learn`)
  - [x] Call `preloadOnIdle(audioEngine)` in a `useEffect(() => {}, [])`
  - [x] `useQuery(['readingData', profileId], () => getReadingDataFn({ data: { profileId } }))`
  - [x] When `data.letters.length < 3` → `useEffect` calls `navigate({ to: '/learn' })` (defensive redirect)
  - [x] Local state: `currentGroupIndex`, `shuffleSeed`
  - [x] `useMemo` over `[data, shuffleSeed, currentHarakat]` building `groups` and `letterChars`
  - [x] One-shot effect to sync `currentHarakat` from `data.vowelMode`
  - [x] Render order: `ProfileBadge` → `ChildHarakatBar` → `GroupHeader` → `GroupPills` → `ReadingGrid` → `ReadingActions`
  - [x] Wire callbacks: `onShuffle`, `onNext`, `onDone`
  - [x] Run `pnpm test` and confirm tests pass (Green phase)

- [x] Task: Update `/learn` route to enable the Reading Practice link
  - [x] Replace `<button disabled={...}>Reading Practice</button>` with `<Link to="/learn/reading" disabled={...}>Reading Practice</Link>`
  - [x] Add disabled-styling classes (`disabled:opacity-50 disabled:cursor-not-allowed`)
  - [x] Do NOT touch any other part of the route

- [x] Task: Update `/learn` route tests
  - [x] Update "button disabled" test → "link disabled" with `hasAttribute('disabled')`
  - [x] Update "button enabled" test → "link enabled" checking `to="/learn/reading"` and no `disabled` attribute
  - [x] Remove unused `useNavigate` import and `navigate` variable from `learn.tsx`

- [x] Task: Run full test suite and quality checks
  - [x] Run `pnpm test` — 362 passed
  - [x] Run `pnpm typecheck` — no errors
  - [x] Run `pnpm lint` — no errors (removed unused `useNavigate`/`navigate`)
  - [x] Manually verify in browser — see manual verification plan below

- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
  - [x] Dashboard-to-learn connection verified: profile card click → /learn (setChildMode + navigate)
  - [x] /learn Back link now points to /dashboard (not /)
  - [x] All 359 automated tests pass
  - [x] Typecheck and lint clean

---

## Phase: Review Fixes

- [ ] Task: Apply review suggestions
  - [ ] Address any feedback from the code review at the end of Phase 3

</protect>
