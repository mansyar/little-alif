# Implementation Plan — T-06: Letter Toggle Management

## Phase 1: Server Functions & Zod Schemas

**Goal:** Implement the server-side data layer for letter toggle operations.

### Tasks

- [ ] Task: Write Zod validation schemas for letter toggle operations
  - [ ] Create `app/lib/validations/letters.ts` with `toggleLetterSchema`, `getVisibleLettersSchema`, and `bulkToggleLettersSchema`
  - [ ] Schema fields: `profileId` (uuid), `letterId` (z.enum of 28 letter IDs), `isVisible` (boolean), `letterIds` (array of enums for bulk)
  - [ ] Match the exact letter ID enum from TDD §4 (alif, ba, ta, tsa, jim, ha, kho, dal, dzal, ra, zai, sin, syin, shad, dhad, tha, dzha, ain, ghain, fa, qaf, kaf, lam, mim, nun, waw, hae, ya)

- [ ] Task: Write failing tests for letter server functions
  - [ ] Create `app/server/__tests__/letters.test.ts`
  - [ ] Test `getVisibleLettersFn` returns correct toggle states for owned profile
  - [ ] Test `getVisibleLettersFn` rejects unauthenticated requests
  - [ ] Test `toggleLetterFn` successfully toggles a letter ON/OFF
  - [ ] Test `toggleLetterFn` rejects for non-owned profiles
  - [ ] Test `toggleLetterFn` rejects unauthenticated requests (no JWT)
  - [ ] Test `bulkToggleLettersFn` sets multiple letters ON/OFF in one operation
  - [ ] Test `bulkToggleLettersFn` rejects unauthorized access
  - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement letter server functions
  - [ ] Create `app/server/letters.ts` with `getVisibleLettersFn`, `toggleLetterFn`, `bulkToggleLettersFn`
  - [ ] `getVisibleLettersFn`: Query `letter_toggles` joined with `letters` table for the given profileId. Return all 28 letters with their isVisible state
  - [ ] `toggleLetterFn`: Upsert into `letter_toggles` for the given profileId + letterId. Return the new state
  - [ ] `bulkToggleLettersFn`: Batch upsert into `letter_toggles` for the given profileId + letterIds array. Return updatedCount
  - [ ] All functions: validate session (parent JWT for mutations, JWT or child-mode cookie for reads)
  - [ ] All functions: validate profile ownership (profile belongs to authenticated user / child-mode profile)
  - [ ] Follow the existing pattern from `app/server/profiles.ts` (use pure helper functions + server function wrappers)
  - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Conductor — User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: LetterToggleGrid Component

**Goal:** Build the parent-facing toggle grid UI with inline expand/collapse on the dashboard.

### Tasks

- [ ] Task: Write failing tests for LetterToggleGrid component
  - [ ] Create `app/components/parent/__tests__/LetterToggleGrid.test.tsx`
  - [ ] Test grid renders all 28 letters in correct order
  - [ ] Test each letter shows Arabic glyph and a Radix Switch
  - [ ] Test toggling a switch triggers the toggleLetterFn server function
  - [ ] Test switch is disabled while server function is in flight
  - [ ] Test network error reverts switch and shows error state
  - [ ] Test "Show All" button calls bulkToggleLettersFn with all letter IDs
  - [ ] Test "Hide All" button calls bulkToggleLettersFn with all letter IDs
  - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement LetterToggleGrid component
  - [ ] Create `app/components/parent/LetterToggleGrid.tsx`
  - [ ] Fetch toggle states via `getVisibleLettersFn(profileId)` on mount/expand
  - [ ] Render 28 letters in display order (1–28), each as a row/card with:
    - Arabic character glyph (large, centered)
    - Radix UI Switch (`@radix-ui/react-switch`)
  - [ ] Wire toggle action: onChange → debounce 300ms → call `toggleLetterFn(profileId, letterId, !currentState)`
  - [ ] Handle loading state: show spinner while initial data loads
  - [ ] Handle in-flight state: disable switch while mutation is pending
  - [ ] Handle error state: revert switch to previous state, show error toast
  - [ ] Implement "Show All" / "Hide All" buttons above the grid
    - "Show All": calls `bulkToggleLettersFn(profileId, allLetterIds, true)`
    - "Hide All": calls `bulkToggleLettersFn(profileId, allLetterIds, false)`
  - [ ] Use existing grid/list styling patterns from the project (Tailwind CSS v4)
  - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Integrate toggle grid inline on the dashboard
  - [ ] Open `app/routes/dashboard.tsx`
  - [ ] Add expand/collapse state management per profile card
  - [ ] Add "Manage Letters" button to each profile card (if not already present from T-05)
  - [ ] On expand: render `LetterToggleGrid` below the profile card
  - [ ] Only one profile's grid should be expanded at a time (accordion behavior)
  - [ ] Run tests and confirm they pass

- [ ] Task: Implement 300ms debounce utility for toggle operations
  - [ ] Create or extend a debounce hook/utility in `app/lib/utils/`
  - [ ] Apply debounce to individual switch toggle events
  - [ ] Verify rapid clicks produce a single server call after 300ms

- [ ] Task: Conductor — User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: End-to-End Integration & Final Verification

**Goal:** Ensure everything works together end-to-end, verify edge cases, and clean up.

### Tasks

- [ ] Task: Write integration tests for letter toggle flow
  - [ ] Create `app/server/__tests__/letter-toggle-flow.test.ts`
  - [ ] Test: Create profile → verify 28 letter_toggles exist (all OFF) → toggle a letter ON → verify state changed → toggle OFF → verify reverted
  - [ ] Test: Bulk toggle all ON → verify all 28 are ON → bulk toggle all OFF → verify all 28 are OFF
  - [ ] Test: Unauthenticated toggle requests are rejected (HTTP 401)
  - [ ] Test: Toggle on another parent's profile is rejected
  - [ ] Run tests and confirm they pass

- [ ] Task: Verify profile card letter count integration
  - [ ] Check T-05 implementation to confirm profile card already shows "X/28 introduced" summary
  - [ ] If not present (despite roadmap claiming it's done), add letter count display to profile cards
  - [ ] The count should update in real-time after toggles

- [ ] Task: Final code quality checks
  - [ ] Run full test suite: `pnpm test` — all tests pass
  - [ ] Run type checker: `pnpm typecheck` — no errors
  - [ ] Run linter: `pnpm lint` — no errors
  - [ ] Run formatter: `pnpm format:check` — no formatting issues
  - [ ] Verify coverage for new code > 70%

- [ ] Task: Conductor — User Manual Verification 'Phase 3' (Protocol in workflow.md)
