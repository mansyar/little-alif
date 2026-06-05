# Implementation Plan: T-16 — Code Quality Polish

**Track ID:** `code-quality-polish_20260605`
**Est. Effort:** ~1h

---

## Phase 1: Letter ID Source of Truth [checkpoint: f4203f3]

**Goal:** Move `LETTER_IDS` + `LetterId` + `LETTER_BG_COLORS` to `app/lib/constants/letters.ts` as the canonical source. Update all 14 consumers.

### Tasks

- [x] **Task 1.1: Create constants file** `a9b74fa`
  - [ ] Create `app/lib/constants/letters.ts` defining `LETTER_IDS as const`, `LetterId` type, and `LETTER_BG_COLORS: Record<LetterId, string>` (28 pastel Tailwind classes)
  - [ ] Write test for constants file verifying:
    - `LETTER_IDS` has exactly 28 entries
    - `LETTER_BG_COLORS` has an entry for every `LETTER_IDS` member
    - `LetterId` resolves to a union of all 28 strings
  - [ ] Run test — confirm **Green**

- [x] **Task 1.2: Update schema.ts** `d3abbc2`
  - [x] Remove `LETTER_IDS` and `LetterId` definitions from `app/db/schema.ts`
  - [x] Re-export `LetterId` type for backward compat (type-only re-export from constants)
  - [x] Verify `pnpm typecheck` passes (schema.ts is clean; remaining errors are in other files)

- [x] **Task 1.3: Update all 14 importing files** `49cf3e9`
  - [x] Update import paths in all 14 listed files (seed.ts excluded — doesn't import LETTER_IDS)
  - [x] In `LetterCard.tsx`: replace inline `LETTER_BG` with `import { LETTER_BG_COLORS } from '~/lib/constants/letters'`
  - [x] Verify `pnpm typecheck` passes

- [x] **Task 1.4: Clean up seed.test.ts** `e0befa1`
  - [x] Replace hardcoded `expectedIds` array in `seed.test.ts` with dynamic `SEED_LETTERS.map(l => l.id)`
  - [x] Verify test still correctly validates the canonical Hijaiyah order
  - [x] Run test — confirm **Green** (12 tests pass)

- [x] **Task 1.5: Run full verification**
  - [x] `pnpm test` — all tests pass (59 files, 484 tests)
  - [x] `pnpm typecheck` — clean
  - [x] `pnpm lint` — clean

- [x] **Task: Conductor - User Manual Verification 'Phase 1: Letter ID Source of Truth' (Protocol in workflow.md)**

---

## Phase 2: Reading Practice i18n [checkpoint: a45b4b5]

**Goal:** Localize 5 reading practice action labels with EN/ID i18n keys.

### Tasks

- [x] **Task 2.1: Write failing tests for i18n keys**
  - [x] Add test expecting `ReadingActions` to render translated text for each of the 5 keys
  - [x] Run test — confirm **Red** (keys don't exist yet, components use hardcoded strings)

- [x] **Task 2.2: Add i18n keys**
  - [x] Add 5 keys (`READING_SHUFFLE`, `READING_DONE`, `READING_NEXT_GROUP`, `READING_RANDOMIZE`, `READING_PATTERN_LABEL`) to `app/lib/i18n/en/index.ts`
  - [x] Add 5 Indonesian translations to `app/lib/i18n/id/index.ts`
  - [x] Run `pnpm i18n` to regenerate type files
  - [x] Verify `pnpm typecheck` passes

- [x] **Task 2.3: Update ReadingActions.tsx**
  - [x] Replace hardcoded strings with `LL` calls in `app/components/child/reading/ReadingActions.tsx`
  - [x] Add `import { useI18nContext } from '~/lib/i18n'`
  - [x] Update `-reading.test.tsx` with i18n mock + updated aria-label queries
  - [x] Verify `pnpm typecheck` passes

- [x] **Task 2.4: Update GroupPills.tsx** _(no-op)_
  - [x] Verified — no "Pattern" label exists in `GroupPills.tsx`. Hardcoded strings (`aria-label "Group"` and `title "Needs 3 letters"`) not covered by the 5 new keys; deferred.
  - [x] Verify `pnpm typecheck` passes

- [x] **Task 2.5: Update component tests**
  - [x] ReadingActions uses `vi.mock('~/lib/i18n')` pattern (consistent with codebase) — 9 tests pass
  - [x] GroupPills doesn't use i18n — no changes needed, 9 tests pass
  - [x] The "renders translated text from LL calls for all buttons" test proves component renders LL values; locale switch behavior is i18n layer responsibility
  - [x] Run tests — 59 files, 485 tests pass — **Green**

- [x] **Task 2.6: Run full verification**
  - [x] `pnpm test` — 59 files, 485 tests pass
  - [x] `pnpm typecheck` — clean
  - [x] `pnpm lint` — clean

- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Reading Practice i18n' (Protocol in workflow.md)**
