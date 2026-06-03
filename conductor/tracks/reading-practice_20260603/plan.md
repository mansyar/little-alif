<protect>
# Implementation Plan — T-10: Reading Practice (Iqra' Mode)

**Track ID:** `reading-practice_20260603`
**Type:** Feature
**Est. Effort:** ~5–8h (matches roadmap estimate)

---

## Phase 1: Reading Utilities & Server Function [checkpoint: <sha>]

**Goal:** Build the pure-function reading utilities (`generateReadingGroups`, `generatePracticeRow`, `generatePracticeGrid`) and the `getReadingDataFn` server function with full TDD coverage. After this phase, the data layer is fully ready — no UI yet.

### Tasks

- [x] Task: Add Zod schema for `getReadingDataFn` [9aadb56]
  - [x] Create `app/lib/validations/reading.ts` (new file)
  - [x] Export `getReadingDataSchema = z.object({ profileId: z.string().uuid() })`
  - [x] Re-export the `VowelMode` enum from `~/lib/validations/letters` (or duplicate the `'none' | 'fathah' | 'kasrah' | 'dammah'` literal — match the style of the existing `letters.ts` schema file)

- [ ] Task: Write failing tests for reading utilities
  - [ ] Create `app/lib/utils/reading.test.ts`
  - [ ] Test: `generateReadingGroups([])` and `generateReadingGroups(['a','b'])` both return `[]` (fewer than 3 letters — caller must not render)
  - [ ] Test: 3 letters → exactly 1 group of 3 letters, `isComplete: true`, label = space-joined Arabic chars
  - [ ] Test: 4 letters → 2 groups, first `isComplete: true`, second `isComplete: false` with 1 letter
  - [ ] Test: 5 letters → 2 groups, first complete (3), second incomplete (2)
  - [ ] Test: 6 letters → 2 groups, both complete
  - [ ] Test: 7 letters → 3 groups (3, 3, 1), last is incomplete
  - [ ] Test: groups are emitted in the same order as the input
  - [ ] Test: `generatePracticeRow(3 letters, 'systematic', ...)` returns 9 cells in `[letter_a_fathah, letter_a_kasrah, letter_a_dammah, letter_b_fathah, ...]` order
  - [ ] Test: `generatePracticeRow(1 letter, 'systematic', ...)` returns 3 cells (still 3 harakat)
  - [ ] Test: `generatePracticeRow(3 letters, 'mixed', ...)` returns 9 cells with the same set of composed strings as systematic (just in shuffled order)
  - [ ] Test: `generatePracticeRow(2 letters, 'mixed', ...)` returns 6 cells (3 harakat × 2 letters)
  - [ ] Test: `generatePracticeRow(1 letter, 'mixed', ...)` returns 3 cells
  - [ ] Test: `generatePracticeGrid(3 letters, ...)` returns 6 rows; row 0 is `{ type: 'systematic', cells: [9 systematic cells] }`; rows 1–5 are each `{ type: 'mixed', cells: [...9 cells] }`
  - [ ] Test: each mixed row contains the same 9 cells as row 0 (set equality)
  - [ ] Test: with a non-connecting letter (e.g., ر) and `kasrah`, the systematic row uses the precomposed glyph `رِ` (verifies `composeLetter` is wired)
  - [ ] Test: missing `getCharById` for a letter ID → that letter's cells are skipped (not `undefined` in the output)
  - [ ] Run `pnpm test` and confirm new tests fail (Red phase)

- [ ] Task: Implement reading utilities
  - [ ] Create `app/lib/utils/reading.ts`
  - [ ] Define `ReadingGroup` and `PracticeRow` types (in-file exports)
  - [ ] Implement `generateReadingGroups(visibleLetterIds)` — slice into chunks of 3, mark each with `isComplete: letters.length === 3`, label = `letters.map(getCharById).join(' ')`
  - [ ] Implement `generatePracticeRow(groupLetters, rowType, composeFn, getCharById)` — builds the systematic sequence in letter-then-harakat order, or the shuffled set for mixed
  - [ ] Implement `generatePracticeGrid(groupLetters, composeFn, getCharById)` — calls `generatePracticeRow` 6 times: 1 systematic + 5 mixed
  - [ ] Run `pnpm test` and confirm new tests pass (Green phase)

- [ ] Task: Write failing tests for `getReadingData` pure helper
  - [ ] Create `app/server/__tests__/reading.test.ts`
  - [ ] Use a temporary in-memory SQLite DB (better-sqlite3 or the existing test fixture from `letters.test.ts` / `profiles.test.ts`)
  - [ ] Seed: 1 user, 1 profile, 28 letters (alif..ya), letter_toggles with a known set of visible/invisible flags
  - [ ] Test: returns the toggled-ON letters only, in `displayOrder` (1..28), each with `{ letterId, character }`
  - [ ] Test: returns the profile's persisted `vowelMode` in the result
  - [ ] Test: zero visible letters → returns `{ letters: [], vowelMode }` (does not throw)
  - [ ] Test: throws when the profile does not belong to the calling user (mirrors `verifyProfileOwnership` failure mode)
  - [ ] Test: throws when the profile does not exist
  - [ ] Run `pnpm test` and confirm tests fail (Red phase)

- [ ] Task: Implement `getReadingData` pure helper
  - [ ] Create `app/server/reading.ts` (new file)
  - [ ] Add the `ReadingData` type and the `getReadingData(db, ownerId, profileId)` pure helper
  - [ ] Internally call `verifyProfileOwnership` (inline the same shape as in `letters.ts` — no shared module, matches T-08's choice)
  - [ ] Join `letters` LEFT JOIN `letter_toggles` filtered `profileId = ? AND isVisible = 1`, ordered by `displayOrder`
  - [ ] Read `vowelMode` from the `profiles` row in the same query
  - [ ] Run `pnpm test` and confirm tests pass (Green phase)

- [ ] Task: Implement `getReadingDataFn` server function wrapper
  - [ ] In `app/server/reading.ts`, add `getReadingDataFn` using `createServerFn({ method: 'GET' }).inputValidator(getReadingDataSchema).handler(...)`
  - [ ] In the handler, call `validateSessionFn()` — accept either parent JWT or child-mode cookie (the existing `validateSessionFn` returns `user.id` for either; for child-mode the `user` is a synthetic user; verify by reading `auth-fns.ts` to confirm the existing pattern is sufficient)
  - [ ] Call `getReadingData(db, session.user.id, data.profileId)` and return the result
  - [ ] Add a thin integration test that exercises the wrapper (mock the underlying helper) — confirm the validation, the auth gate, and the result shape

- [ ] Task: Run quality checks for Phase 1
  - [ ] Run `pnpm test` — all reading utility + server function tests pass
  - [ ] Run `pnpm typecheck` — no errors
  - [ ] Run `pnpm lint` — no errors
  - [ ] Verify coverage on the new files (target > 70%): `app/lib/utils/reading.ts` and `app/server/reading.ts`

- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Reading UI Components [checkpoint: <sha>]

**Goal:** Build the five reading-screen components — `GroupPills`, `GroupHeader`, `ReadingCell`, `ReadingGrid`, `ReadingActions` — with full TDD coverage. After this phase, the components exist and render correctly in isolation; the route (Phase 3) wires them together.

### Tasks

- [ ] Task: Write failing tests for `GroupPills`
  - [ ] Create `app/components/child/reading/GroupPills.test.tsx`
  - [ ] Test: renders one button per group in `groups` prop
  - [ ] Test: the active group (matching `activeIndex`) gets the active styling class (e.g., `bg-emerald-500`)
  - [ ] Test: complete inactive groups (`isComplete: true`) are enabled buttons with the outline style
  - [ ] Test: incomplete inactive groups (`isComplete: false`) are disabled, with `title="Needs 3 letters"`, `aria-disabled="true"`, and the muted style
  - [ ] Test: clicking an active group pill does NOT call `onSelect` (or calls with the same index — confirm the implementation choice and assert the no-op case)
  - [ ] Test: clicking a complete inactive group pill calls `onSelect(index)`
  - [ ] Test: clicking an incomplete group pill is a no-op (does not call `onSelect`)
  - [ ] Test: each pill has `aria-label` containing the group label and (for active) `aria-current="true"`
  - [ ] Test: container has `overflow-x-auto` (so many groups stay scrollable)
  - [ ] Run `pnpm test` and confirm tests fail (Red phase)

- [ ] Task: Implement `GroupPills`
  - [ ] Create `app/components/child/reading/GroupPills.tsx`
  - [ ] Render a horizontal `<div role="tablist" className="flex gap-2 overflow-x-auto">` containing one `<button>` per group
  - [ ] Active pill: `bg-emerald-500 text-white`
  - [ ] Complete inactive pill: `border border-emerald-500 text-emerald-700 bg-white`
  - [ ] Incomplete inactive pill: `border border-gray-300 text-gray-400 bg-gray-50`, `disabled`, `aria-disabled="true"`, `title="Needs 3 letters"`, `cursor-not-allowed`
  - [ ] Each pill: `min-h-[44px] px-4 rounded-full text-sm font-medium`
  - [ ] `onClick` of complete pills calls `onSelect(index)`
  - [ ] Run `pnpm test` and confirm tests pass (Green phase)

- [ ] Task: Write failing tests for `GroupHeader`
  - [ ] Create `app/components/child/reading/GroupHeader.test.tsx`
  - [ ] Test: renders 1–3 Arabic glyphs (composed via `composeLetter(char, vowelMode)`) for the group's letters
  - [ ] Test: the rendered glyphs match the `composeLetter` output for the current `vowelMode`
  - [ ] Test: re-renders with new glyphs when `vowelMode` prop changes
  - [ ] Test: incomplete group (length 1 or 2) renders the `(N/3)` hint below the glyphs
  - [ ] Test: complete group (length 3) does NOT render the `(N/3)` hint
  - [ ] Test: container has `aria-label="Current group: {label}"`
  - [ ] Test: each glyph is wrapped in `aria-hidden="true"`
  - [ ] Run `pnpm test` and confirm tests fail (Red phase)

- [ ] Task: Implement `GroupHeader`
  - [ ] Create `app/components/child/reading/GroupHeader.tsx`
  - [ ] Accept `group: ReadingGroup` and `vowelMode: VowelMode` props
  - [ ] Render a centered `<div>` with `gap-6` containing each letter composed via `composeLetter`
  - [ ] If `!group.isComplete`, append a small `<span className="text-sm text-gray-500 mt-2">({group.letters.length}/3)</span>` below the glyphs
  - [ ] Apply `text-5xl` (or `text-6xl`) to the glyphs and `font-arabic` for the correct font
  - [ ] `aria-label` on the container; `aria-hidden="true"` on each glyph
  - [ ] Run `pnpm test` and confirm tests pass (Green phase)

- [ ] Task: Write failing tests for `ReadingCell`
  - [ ] Create `app/components/child/reading/ReadingCell.test.tsx`
  - [ ] Test: renders the `glyph` prop in the cell
  - [ ] Test: tap calls `audioEngine.speak(letterChar, vowelMode)` (mock the engine)
  - [ ] Test: tap sets the local `flashed` state to `true` (verifiable via the `data-flashed` attribute)
  - [ ] Test: when the `speak()` promise resolves, `flashed` returns to `false`
  - [ ] Test: when the `speak()` promise rejects, `flashed` still returns to `false` (uses `.finally()`)
  - [ ] Test: tap on a cell while another is flashing: the new cell flashes, the old cell's `flashed` state is not affected (each cell is local)
  - [ ] Test: cell has `min-h-[56px] min-w-[56px]` and `aspect-square`
  - [ ] Test: `aria-label="{letterId} {vowelMode}"` (e.g., `"alif fathah"`)
  - [ ] Test: glyph span has `aria-hidden="true"`
  - [ ] Run `pnpm test` and confirm tests fail (Red phase)

- [ ] Task: Implement `ReadingCell`
  - [ ] Create `app/components/child/reading/ReadingCell.tsx`
  - [ ] Accept `glyph: string`, `letterId: string`, `vowelMode: VowelMode`, `letterChar: string` props (the `letterChar` is the un-composed character passed in from the route so the cell can call `speak` correctly)
  - [ ] Local `useState(false)` for `flashed`
  - [ ] `<button type="button" data-flashed={flashed}>` with `className="aspect-square min-h-[56px] min-w-[56px] rounded-lg bg-gray-50 data-[flashed=true]:bg-emerald-200 transition-colors duration-200"`
  - [ ] `onClick` handler:
    ```ts
    setFlashed(true);
    audioEngine.speak(letterChar, vowelMode).finally(() => setFlashed(false));
    ```
  - [ ] Glyph in a `<span aria-hidden="true" className="text-3xl font-arabic">{glyph}</span>`
  - [ ] `aria-label` on the button: `` `${letterId} ${vowelMode}` ``
  - [ ] Run `pnpm test` and confirm tests pass (Green phase)

- [ ] Task: Write failing tests for `ReadingGrid`
  - [ ] Create `app/components/child/reading/ReadingGrid.test.tsx`
  - [ ] Test: renders 6 rows (1 systematic + 5 mixed) by default
  - [ ] Test: row 0 has the "Pattern" label above it (text content "Pattern"); rows 1–5 do not
  - [ ] Test: each row contains the expected number of `<ReadingCell>` elements
  - [ ] Test: the container has `role="grid"` with `aria-rowcount={6}`
  - [ ] Test: harakat prop change → all cells re-render with the new composed glyphs (mock `composeLetter` or use real letters with different vowel modes; verify the glyph strings change)
  - [ ] Test: incomplete group (1–2 letters) → all rows render with fewer cells (3 or 6 cells per row, not 9)
  - [ ] Test: the "Pattern" label is `aria-hidden="true"`
  - [ ] Run `pnpm test` and confirm tests fail (Red phase)

- [ ] Task: Implement `ReadingGrid`
  - [ ] Create `app/components/child/reading/ReadingGrid.tsx`
  - [ ] Accept `group: ReadingGroup`, `vowelMode: VowelMode`, `letterChars: Record<LetterId, string>` props (the route supplies the lookup; the cell receives its char)
  - [ ] Read `currentHarakat` from `useUiStore` for re-render reactivity
  - [ ] `useMemo` over `[group, currentHarakat]` that returns `generatePracticeGrid(group.letters, composeLetter, (id) => letterChars[id])`
  - [ ] Render `<div role="grid" aria-rowcount={6} className="flex flex-col gap-2">`
  - [ ] For row 0 only: render the "Pattern" label (`<div aria-hidden="true" className="text-sm text-gray-500">Pattern</div>`) above the row
  - [ ] Each row: `<div role="row" className="flex flex-wrap gap-2" aria-rowindex={i + 1}>` mapping each `cell` (precomposed glyph) and `letterId` (the source letter) to a `<ReadingCell glyph={cell} letterId={letterId} vowelMode={currentHarakat} letterChar={letterChars[letterId]} />`
  - [ ] Run `pnpm test` and confirm tests pass (Green phase)

- [ ] Task: Write failing tests for `ReadingActions`
  - [ ] Create `app/components/child/reading/ReadingActions.test.tsx`
  - [ ] Test: renders 3 buttons — "Shuffle", "Next Group", "Done"
  - [ ] Test: each button has the corresponding `aria-label`
  - [ ] Test: clicking Shuffle calls `onShuffle` exactly once
  - [ ] Test: clicking Next Group calls `onNext` exactly once
  - [ ] Test: clicking Done calls `onDone` exactly once
  - [ ] Test: when `groups.length === 1`, the Next Group button is NOT in the document
  - [ ] Test: each button has `min-h-[56px]`
  - [ ] Test: Lucide icons (`Shuffle`, `ChevronRight`, `Check`) are rendered inside their respective buttons
  - [ ] Run `pnpm test` and confirm tests fail (Red phase)

- [ ] Task: Implement `ReadingActions`
  - [ ] Create `app/components/child/reading/ReadingActions.tsx`
  - [ ] Accept `groups: ReadingGroup[]`, `currentIndex: number`, `onShuffle`, `onNext`, `onDone` props
  - [ ] Render a horizontal `<div className="flex gap-3 justify-center">` of `<button>` elements
  - [ ] Shuffle button: Lucide `Shuffle` icon + "Shuffle" text, `aria-label="Shuffle rows"`, `onClick={onShuffle}`
  - [ ] Next Group button: Lucide `ChevronRight` icon + "Next Group" text, `aria-label="Next group"`, `onClick={onNext}`; only render if `groups.length > 1`
  - [ ] Done button: Lucide `Check` icon + "Done" text, `aria-label="Done reading practice"`, `onClick={onDone}`
  - [ ] All buttons: `min-h-[56px] px-4 rounded-lg bg-white border border-gray-200 active:scale-95 transition-transform`
  - [ ] Run `pnpm test` and confirm tests pass (Green phase)

- [ ] Task: Run quality checks for Phase 2
  - [ ] Run `pnpm test` — all reading component tests pass
  - [ ] Run `pnpm typecheck` — no errors
  - [ ] Run `pnpm lint` — no errors
  - [ ] Verify coverage on the new component files (target > 70%)

- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: /learn/reading Route & Final Integration [checkpoint: <sha>]

**Goal:** Wire up the `/learn/reading` route that composes the new components, replaces the disabled Reading Practice button on `/learn` with a working `<Link>`, and verifies the full end-to-end flow. After this phase, the T-10 track is done.

### Tasks

- [ ] Task: Write failing tests for `/learn/reading` route
  - [ ] Create (or extend) `app/routes/learn/reading.test.tsx`
  - [ ] Test: when `getReadingDataFn` returns ≥ 3 letters, the route renders the `GroupHeader`, `GroupPills`, `ReadingGrid`, and `ReadingActions` (mock the server function)
  - [ ] Test: when `getReadingDataFn` returns < 3 letters, the route redirects to `/learn`
  - [ ] Test: when `getReadingDataFn` is pending, the route renders the `LoadingSpinner`
  - [ ] Test: when `getReadingDataFn` rejects, the route renders the error + retry pattern
  - [ ] Test: clicking a GroupPills button (mock) updates the displayed group
  - [ ] Test: clicking Next Group wraps from the last group to the first
  - [ ] Test: clicking Done navigates to `/learn`
  - [ ] Test: clicking Shuffle re-renders the `ReadingGrid` (the cells' glyphs change — mock the RNG or assert that the order differs after a re-render)
  - [ ] Test: a `<ReadingCell>` tap calls `audioEngine.speak(letterChar, currentHarakat)` (mock the engine)
  - [ ] Test: harakat bar toggle (via `useUiStore.setHarakat`) re-renders all cells with the new composed glyphs
  - [ ] Test: incomplete group (4 letters → second group of 1) → the second pill is disabled, but the first is clickable
  - [ ] Run `pnpm test` and confirm new tests fail (Red phase)

- [ ] Task: Implement `/learn/reading` route
  - [ ] Create `app/routes/learn/reading.tsx`
  - [ ] Register the route in the TanStack Router file-based tree (auto-detected by `app/routes/learn/reading.tsx`)
  - [ ] On mount: read `profileId` from `useAuthStore.childProfileId`; if missing, render a "Select a child" message + back link (defensive — same pattern as `/learn`)
  - [ ] Call `preloadOnIdle(audioEngine)` in a `useEffect(() => {}, [])`
  - [ ] `useQuery(['readingData', profileId], () => getReadingDataFn({ data: { profileId } }))` — adjust the call signature to match the project's existing TanStack Query pattern (check `app/routes/learn.tsx` to confirm the exact shape used in T-08)
  - [ ] When `data.letters.length < 3` → `useEffect` calls `navigate({ to: '/learn' })` (defensive redirect)
  - [ ] Local state:
    - `const [currentGroupIndex, setCurrentGroupIndex] = useState(0);`
    - `const [shuffleSeed, setShuffleSeed] = useState(0);` (incrementing this triggers a re-render of the grid)
  - [ ] `useMemo` over `[data, shuffleSeed, currentHarakat]` that builds:
    - `groups = generateReadingGroups(data.letters.map(l => l.letterId))`
    - `letterChars = data.letters.reduce<Record<string, string>>((acc, l) => { acc[l.letterId] = l.character; return acc; }, {})`
  - [ ] On `useUiStore` mount, set `currentHarakat` to `data.vowelMode` (one-shot effect, so child-side changes don't get clobbered — use a `useRef` to detect first render)
  - [ ] Render order: `ProfileBadge` → `ChildHarakatBar` → `GroupHeader` → `GroupPills` → `ReadingGrid` → `ReadingActions`
  - [ ] Wire callbacks:
    - `onShuffle: () => setShuffleSeed(s => s + 1)`
    - `onNext: () => setCurrentGroupIndex(i => (i + 1) % groups.length)`
    - `onDone: () => navigate({ to: '/learn' })`
  - [ ] Run `pnpm test` and confirm new tests pass (Green phase)

- [ ] Task: Update `/learn` route to enable the Reading Practice button
  - [ ] Open `app/routes/learn.tsx`
  - [ ] Replace the existing `<button disabled={visibleLetters.length < 3}>Reading Practice</button>` with `<Link to="/learn/reading" disabled={visibleLetters.length < 3} className="...">Reading Practice</Link>` (TanStack Router `<Link>` accepts a `disabled` prop; verify by reading the existing `<Link>` usages in the codebase)
  - [ ] Add the same disabled-styling classes (`disabled:opacity-50 disabled:cursor-not-allowed`) so the visual treatment is identical
  - [ ] Do NOT touch any other part of the route

- [ ] Task: Update `/learn` route tests
  - [ ] Open `app/routes/learn.test.tsx`
  - [ ] Update the existing "Reading Practice button is disabled when visible letters < 3" test → rename to "Reading Practice Link is disabled" and assert the `<Link>` has `disabled={true}` (or `aria-disabled="true"` — match the TanStack Router Link API in the codebase)
  - [ ] Update the existing "Reading Practice button is enabled when visible letters >= 3" test → "Reading Practice Link navigates to /learn/reading" and assert the `to="/learn/reading"` prop is present
  - [ ] Add a test: clicking/tapping the enabled link invokes `router.navigate({ to: '/learn/reading' })` (mock the router)

- [ ] Task: Run full test suite and quality checks
  - [ ] Run `pnpm test` — all tests pass (target 290+ tests across the new + existing suites)
  - [ ] Run `pnpm typecheck` — no errors
  - [ ] Run `pnpm lint` — no errors
  - [ ] Run `pnpm format:check` — all files formatted (one round of `pnpm format` if needed)
  - [ ] Run coverage report — verify > 70% for all new files: `reading.ts`, `app/server/reading.ts`, `getReadingDataSchema`, and the 5 reading components
  - [ ] Manually verify in browser (mobile + tablet viewports):
    - Toggle ≥ 3 letters for a child profile, enable child mode, navigate to `/learn`, tap the Reading Practice button
    - Verify: 6-row grid renders, systematic row has the "Pattern" label, cells are tappable and play audio
    - Verify: tapping a cell flashes it green, audio plays within ~150ms
    - Verify: harakat bar toggle re-renders all cells with the new glyphs
    - Verify: GroupPills switch the displayed group; Next Group wraps; Shuffle re-randomizes the mixed rows
    - Verify: Done button navigates back to `/learn`
    - Verify: 4 letters → second pill is disabled, with a "Needs 3 letters" tooltip on hover
    - Verify: 3 letters exactly → Next Group button is hidden
    - Verify: fewer than 3 letters → no Reading Practice link on `/learn` (still disabled)
  - [ ] Manually verify: tap a cell while another is playing → previous utterance cancels, new one plays (T-09 cancel-on-new-speak)

- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase: Review Fixes

- [ ] Task: Apply review suggestions
  - [ ] Address any feedback from the code review at the end of Phase 3

</protect>
