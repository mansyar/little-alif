<protect>
# Implementation Plan: Vowel Mode (Harakat)

**Track ID:** `harakat_20260602`

---

## Phase 1: Harakat Utility (`composeLetter`) & Tests [checkpoint: 6c5a30e]

**Goal:** Create the pure core utility and verify it with unit tests.

- [x] Task: Create `app/lib/utils/harakat.ts` with `composeLetter()` and `VowelMode` type (4e0d384)
  - [x] Define `HARAKAT_COMBINING` map (Unicode diacritics: fathah `\u064E`, kasrah `\u0650`, dammah `\u064F`)
  - [x] Define `VOWEL_MODES` constant and `VowelMode` type (`'none' | 'fathah' | 'kasrah' | 'dammah'`)
  - [x] Define `NON_CONNECTING` precomposed fallback map (7 letters: ا, و, ي, ر, ز, د, ذ)
  - [x] Implement `composeLetter(baseChar, harakat)` pure function with combining diacritic + fallback logic
  - [x] Export `composeLetter`, `VowelMode`, `VOWEL_MODES`, `HARAKAT_COMBINING`
- [x] Task: Write unit tests for `harakat.ts` (4e0d384)
  - [x] Test: `composeLetter('ب', 'fathah')` returns `'بَ'` (Unicode combining for connecting letters)
  - [x] Test: `composeLetter('ر', 'kasrah')` returns `'رِ'` (precomposed fallback for non-connecting)
  - [x] Test: All 7 exception letters render correctly with all 3 harakat modes
  - [x] Test: `'none'` returns the base character unchanged
  - [x] Test: `composeLetter('ا', 'fathah')` returns `'اَ'` (DD-1: no special treatment for Alif)
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Parent UI — HarakatSelector [checkpoint: 4e89ce4]

**Goal:** Add vowel mode selector to the parent's LetterToggleGrid header.

- [x] Task: Update `app/stores/ui-store.ts` to track `currentHarakat` (a1c8fe6)
  - [x] Import `VowelMode` type from `~/lib/utils/harakat`
  - [x] Add `currentHarakat: VowelMode` field (default: `'fathah'`)
  - [x] Add `setHarakat(mode: VowelMode)` action
- [x] Task: Create `app/components/parent/HarakatSelector.tsx` (73f8879)
  - [x] Implement radio-style selector with 4 options: Plain, Fathah, Kasrah, Dammah
  - [x] Accept `profileId` and `currentVowelMode` as props
  - [x] On change, call `updateProfileFn({ data: { profileId, vowelMode } })`
  - [x] Show which mode is currently active
  - [x] Handle loading/error states from the mutation
- [x] Task: Integrate HarakatSelector into `LetterToggleGrid.tsx` (6b592fc)
  - [x] Render HarakatSelector above the bulk actions toolbar in the grid header
  - [x] Fetch current vowelMode from the profile data
- [x] Task: Write tests for HarakatSelector (73f8879)
  - [x] Test that all 4 option buttons render
  - [x] Test that changing mode calls `updateProfileFn`
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Child UI — ChildHarakatBar & i18n

**Goal:** Add session-only vowel mode bar for the child grid and add i18n label keys.

- [x] Task: Create `app/components/child/ChildHarakatBar.tsx` (9bfaac8)
  - [x] Create `app/components/child/` directory
  - [x] Implement 4-button bar (Plain, Fathah, Kasrah, Dammah)
  - [x] Read `currentHarakat` from `ui-store` and highlight the active button
  - [x] On click, call `ui-store.setHarakat(mode)` to update session-only state
  - [x] Style with Tailwind: large touch targets (≥44dp), clear active state
- [x] Task: Add i18n keys for harakat labels (ac85df4)
  - [x] Add `HARAKAT_PLAIN`, `HARAKAT_FATHAH`, `HARAKAT_KASRAH`, `HARAKAT_DAMMAH` to English locale
  - [x] Add corresponding Indonesian translations
- [ ] Task: Write tests for ChildHarakatBar
  - [ ] Test that all 4 buttons render
  - [ ] Test that clicking a button updates `ui-store.currentHarakat`
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase 4: Integration & Final Verification

**Goal:** Verify everything works together and ensure no regressions.

- [ ] Task: Run full test suite (`pnpm test`) — confirm all tests pass
- [ ] Task: Run typecheck (`pnpm typecheck`) — confirm clean
- [ ] Task: Run lint (`pnpm lint`) — confirm clean
- [ ] Task: Verify manually that composeLetter output is correct for all 28 letters
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
      </protect>
