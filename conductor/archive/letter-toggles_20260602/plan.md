<protect>
# Implementation Plan — T-06: Letter Toggle Management

## Phase 1: Server Functions & Zod Schemas [checkpoint: 230a9b8]

**Goal:** Implement the server-side data layer for letter toggle operations.

### Tasks

- [x] Task: Write Zod validation schemas for letter toggle operations
  - [ ] Create `app/lib/validations/letters.ts` with `toggleLetterSchema`, `getVisibleLettersSchema`, and `bulkToggleLettersSchema`
  - [ ] Schema fields: `profileId` (uuid), `letterId` (z.enum of 28 letter IDs), `isVisible` (boolean), `letterIds` (array of enums for bulk)
  - [ ] Match the exact letter ID enum from TDD §4 (alif, ba, ta, tsa, jim, ha, kho, dal, dzal, ra, zai, sin, syin, shad, dhad, tha, dzha, ain, ghain, fa, qaf, kaf, lam, mim, nun, waw, hae, ya)

- [x] Task: Write failing tests for letter server functions
  - [ ] Create `app/server/__tests__/letters.test.ts`
  - [ ] Test `getVisibleLettersFn` returns correct toggle states for owned profile
  - [ ] Test `getVisibleLettersFn` rejects unauthenticated requests
  - [ ] Test `toggleLetterFn` successfully toggles a letter ON/OFF
  - [ ] Test `toggleLetterFn` rejects for non-owned profiles
  - [ ] Test `toggleLetterFn` rejects unauthenticated requests (no JWT)
  - [ ] Test `bulkToggleLettersFn` sets multiple letters ON/OFF in one operation
  - [ ] Test `bulkToggleLettersFn` rejects unauthorized access
  - [ ] Run tests and confirm they fail (Red phase)

- [x] Task: Implement letter server functions `99d0f89`
  - [x] Create `app/server/letters.ts` with `getVisibleLettersFn`, `toggleLetterFn`, `bulkToggleLettersFn`
  - [x] `getVisibleLettersFn`: Query `letter_toggles` joined with `letters` table for the given profileId. Return all 28 letters with their isVisible state
  - [x] `toggleLetterFn`: Upsert into `letter_toggles` for the given profileId + letterId. Return the new state
  - [x] `bulkToggleLettersFn`: Batch upsert into `letter_toggles` for the given profileId + letterIds array. Return updatedCount
  - [x] All functions: validate session (parent JWT for mutations, JWT or child-mode cookie for reads)
  - [x] All functions: validate profile ownership (profile belongs to authenticated user / child-mode profile)
  - [x] Follow the existing pattern from `app/server/profiles.ts` (use pure helper functions + server function wrappers)
  - [x] Run tests and confirm they pass (Green phase)

- [x] Task: Conductor — User Manual Verification 'Phase 1' (Protocol in workflow.md) `230a9b8`

---

## Phase 2: LetterToggleGrid Component [checkpoint: 4607d0a]

**Goal:** Build the parent-facing toggle grid UI with inline expand/collapse on the dashboard.

### Tasks

- [x] Task: Write failing tests for LetterToggleGrid component
  - [x] Create `app/components/parent/LetterToggleGrid.test.tsx`
  - [x] Test grid renders all 28 letters in correct order
  - [x] Test each letter shows Arabic glyph and a Radix Switch
  - [x] Test toggling a switch triggers the toggleLetterFn server function
  - [x] Test switch is disabled while server function is in flight
  - [x] Test network error reverts switch and shows error state
  - [x] Test "Show All" button calls bulkToggleLettersFn with all letter IDs
  - [x] Test "Hide All" button calls bulkToggleLettersFn with all letter IDs
  - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement LetterToggleGrid component `e5995e7`
  - [x] Create `app/components/parent/LetterToggleGrid.tsx`
  - [x] Fetch toggle states via `getVisibleLettersFn(profileId)` on mount/expand (via useQuery)
  - [x] Render 28 letters in display order (1–28), each as a row/card with:
    - Arabic character glyph (large, centered)
    - Radix UI Switch (`@radix-ui/react-switch`)
  - [x] Wire toggle action: onChange → debounce 300ms → call `toggleLetterFn(profileId, letterId, !currentState)` (debounce deferred to Task 4)
  - [x] Handle loading state: show spinner while initial data loads
  - [x] Handle in-flight state: disable switch while mutation is pending
  - [x] Handle error state: show mutation error banner with 5s auto-dismiss
  - [x] Implement "Show All" / "Hide All" buttons above the grid
    - "Show All": calls `bulkToggleLettersFn(profileId, allLetterIds, true)`
    - "Hide All": calls `bulkToggleLettersFn(profileId, allLetterIds, false)`
  - [x] Use existing grid/list styling patterns from the project (Tailwind CSS v4)
  - [x] After every toggle/bulk mutation, invalidate the TanStack Query `['profiles']` cache so the `introducedCount` on profile cards refreshes automatically
  - [x] Run tests and confirm they pass (Green phase)

- [x] Task: Integrate toggle grid inline on the dashboard `ef53a7a`
  - [x] Open `app/routes/dashboard.tsx` — added expandedProfileId state and onToggleLetters handler
  - [x] Add expand/collapse state management per profile card (useState in DashboardPage)
  - [x] "Manage Letters" button already present from T-05 — wired onClick handler
  - [x] On expand: render `LetterToggleGrid` below the profile card
  - [x] Only one profile's grid should be expanded at a time (accordion behavior — toggle logic toggles off if same profile clicked)
  - [x] Run tests and confirm they pass

- [x] Task: Implement 300ms debounce utility for toggle operations `1c8efb0`
  - [x] Create `app/lib/utils/useDebouncedCallback.ts` — generic debounce hook with stable identity
  - [x] Apply debounce to individual switch toggle events (wrapped `toggleMutation.mutate` with 300ms debounce)
  - [x] Verify rapid clicks produce a single server call after 300ms (test: 3 rapid clicks → 1 call)

- [x] Task: Conductor — User Manual Verification 'Phase 2' (Protocol in workflow.md) `4607d0a`

---

## Phase 3: End-to-End Integration & Final Verification [checkpoint: ef582ed]

**Goal:** Ensure everything works together end-to-end, verify edge cases, and clean up.

### Tasks

- [x] Task: Write integration tests for letter toggle flow
  - [x] Create `app/server/__tests__/letter-toggle-flow.test.ts`
  - [x] Test: Create profile → verify 28 letter_toggles exist (all OFF) → toggle a letter ON → verify state changed → toggle OFF → verify reverted
  - [x] Test: Bulk toggle all ON → verify all 28 are ON → bulk toggle all OFF → verify all 28 are OFF
  - [x] Test: Cross-user isolation — User B cannot toggle/read User A's profile
  - [x] Run tests and confirm they pass (177/177, 26 files)

- [x] Task: Verify profile card letter count stays in sync
  - [x] Integration test confirms `listProfiles` returns correct `introducedCount` after individual toggle (0→1), bulk all ON (1→28), and bulk all OFF (28→0)
  - [x] Cache invalidation tested via component tests (LetterToggleGrid invalidates `['profiles']` on completed mutations)

- [x] Task: Final code quality checks
  - [x] Run full test suite: `pnpm test` — all tests pass (178/178)
  - [x] Run type checker: `pnpm typecheck` — no errors
  - [x] Run linter: `pnpm lint` — no errors
  - [x] Run formatter: `pnpm format:check` — all files use Prettier style
  - [x] Verify coverage for new code > 70% (overall 89.2% lines; all new files > 84%)

- [x] Task: Conductor — User Manual Verification 'Phase 3' (Protocol in workflow.md) `ef582ed`

---

## Phase: Review Fixes

- [x] Task: Apply review suggestions `1a5f775`
