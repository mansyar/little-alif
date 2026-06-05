# T-14: Reading Practice Visual Alignment — Implementation Plan

## Phase 1: ReadingCell.tsx — Token Replacement

**Files:** `app/components/child/reading/ReadingCell.tsx`
**No test changes needed** — ReadingCell.test.tsx does not assert color/radius class names.

- [x] **Task:** Update ReadingCell.tsx class names (6857353)
  - [x] Replace `bg-gray-50` → `bg-sand-light`
  - [x] Replace `rounded-lg` → `rounded-small`
  - [x] Replace `data-[flashed=true]:bg-emerald-200` → `data-[flashed=true]:bg-green-light`
  - [x] Run `pnpm test` to confirm no regressions
- [x] **Task:** Conductor — User Manual Verification 'ReadingCell Token Replacement' (Protocol in workflow.md)

---

## Phase 2: ReadingActions.tsx — Token Replacement

**Files:** `app/components/child/reading/ReadingActions.tsx`
**No test changes needed** — ReadingActions.test.tsx does not assert color/radius class names.

- [x] **Task:** Update ReadingActions.tsx class names (605e837)
  - [x] Replace `border-gray-200` → `border-sand-dark` on all 4 buttons
  - [x] Replace `rounded-lg` → `rounded-small` on all 4 buttons
  - [x] Add `hover:bg-sand-light` hover state on all 4 buttons
  - [x] Add `text-green` class to Lucide icon `<svg>` elements
  - [x] Run `pnpm test` to confirm no regressions
- [x] **Task:** Conductor — User Manual Verification 'ReadingActions Token Replacement' (Protocol in workflow.md)

---

## Phase 3: GroupPills.tsx — Token Replacement

**Files:** `app/components/child/reading/GroupPills.tsx`, `app/components/child/reading/GroupPills.test.tsx`
**Test changes needed** — GroupPills.test.tsx asserts old emerald/gray class names.

- [x] **Task:** Update GroupPills.tsx active/complete/incomplete class names (35eeeb8)
  - [x] **[Red]** Update `GroupPills.test.tsx`:
    - Active: `bg-emerald-500` → `bg-green`, `text-white` unchanged
    - Complete: `border-emerald-500` → `border-green`, `text-emerald-700` → `text-green-dark`
    - Incomplete: `border-gray-300` → `border-sand-dark`, `text-gray-400` → `text-text-muted`
    - Confirmed tests FAIL with old class names ✓
  - [x] **[Green]** Update `GroupPills.tsx`:
    - Active: `bg-emerald-500 text-white` → `bg-green text-white`
    - Complete: `border border-emerald-500 text-emerald-700 bg-white` → `border border-green text-green-dark bg-white`
    - Incomplete: `border border-gray-300 text-gray-400 bg-gray-50` → `border border-sand-dark text-text-muted bg-white`
    - Removed `cursor-not-allowed` from incomplete class string
  - [x] Verify all tests pass
- [x] **Task:** Conductor — User Manual Verification 'GroupPills Token Replacement' (Protocol in workflow.md)

---

## Phase 4: ReadingGrid.tsx — Remove "Pattern" Label

**Files:** `app/components/child/reading/ReadingGrid.tsx`, `app/components/child/reading/ReadingGrid.test.tsx`
**Test changes needed** — ReadingGrid.test.tsx has 2 tests asserting Pattern label exists.

- [ ] **Task:** Remove "Pattern" label text from ReadingGrid
  - [ ] **[Red]** Update `ReadingGrid.test.tsx`:
    - Replace the "row 0 has the Pattern label" test with a "no Pattern label anywhere" test (assert `screen.queryByText('Pattern')` is `null`)
    - Remove the "Pattern label is aria-hidden" test entirely
    - Confirm the new "no Pattern" test FAILS
  - [ ] **[Green]** Remove the Pattern `<div>` from `ReadingGrid.tsx` (lines ~73-77)
  - [ ] Verify all tests pass
- [ ] **Task:** Conductor — User Manual Verification 'Remove Pattern Label' (Protocol in workflow.md)

---

## Phase 5: reading.ts — Label Fallback Fix (H11)

**Files:** `app/lib/utils/reading.ts`, `app/lib/utils/reading.test.ts`
**Test changes needed** — New test for undefined-resolver fallback.

- [ ] **Task:** Fix `generateReadingGroups()` label fallback
  - [ ] **[Red]** Add test to `reading.test.ts`:
    - Call `generateReadingGroups(['alif', 'ba', 'ta'], (id) => id === 'ba' ? undefined : 'ا')`
    - Assert that `group.label` contains Arabic characters (not 'ba' or the raw ID)
    - Confirm the new test FAILS (current code would use `undefined` or the fallback ID)
  - [ ] **[Green]** Update `generateReadingGroups()` in `reading.ts`:
    - When `resolve(id)` returns a falsy value, use the first successfully resolved character in the chunk as the fallback placeholder
    - Ensure all existing label tests still pass
  - [ ] Verify all tests pass
- [ ] **Task:** Conductor — User Manual Verification 'Label Fallback Fix' (Protocol in workflow.md)

---

## Final Verification

- [ ] **Task:** Run full test suite: `pnpm test` — all 365+ tests pass
- [ ] **Task:** Run type checker: `pnpm typecheck` — clean
- [ ] **Task:** Run linter: `pnpm lint` — clean
