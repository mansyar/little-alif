# Implementation Plan: Address Server Function Test Coverage Gap

## Phase 1: Auth Functions Coverage (`app/server/auth-fns.test.ts`) [checkpoint: 24781d5]

- [x] Task: Write tests for `buildChildSession` helper
    - [x] Test: returns null when cookie verification fails (invalid/tampered cookie)
    - [x] Test: returns null when profile not found in DB
    - [x] Test: returns session-like object with correct shape when valid
    - [x] Test: child session user has `isChild: true` and correct `childProfileId`
- [x] Task: Write tests for `registerFn` error handling
    - [x] Test: APIError is caught and re-thrown as plain Error
    - [x] Test: non-APIError exceptions pass through unchanged
    - [x] Test: delegates to auth.api.signUpEmail with correct parameters
- [x] Task: Write tests for `loginFn` error handling
    - [x] Test: APIError is caught and re-thrown as plain Error
    - [x] Test: non-APIError exceptions pass through unchanged
    - [x] Test: delegates to auth.api.signInEmail with correct parameters
- [x] Task: Write tests for `enableChildMode` helper
    - [x] Test: returns `{ name, avatar }` for an owned profile
    - [x] Test: throws when profile not owned by user
- [x] Task: Run `pnpm test:coverage` and verify `auth-fns.ts` ≥80% stmts/branch/funcs/lines (8c785be)
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md) (24781d5)

## Phase 2: Profiles Server Function Wrappers (`app/server/profiles.test.ts`) [checkpoint: f5e43e7]

- [x] Task: Write tests for `listProfilesFn` wrapper
    - [x] Test: calls `requireParentSession` and throws for child session
    - [x] Test: delegates to `listProfiles` with correct userId
- [x] Task: Write tests for `createProfileFn` wrapper
    - [x] Test: throws for unauthenticated session
    - [x] Test: throws for child session (parent required)
- [x] Task: Write tests for `updateProfileFn` wrapper
    - [x] Test: throws for unauthenticated session
    - [x] Test: throws for child session (parent required)
- [x] Task: Write tests for `deleteProfileFn` wrapper
    - [x] Test: throws for unauthenticated session
    - [x] Test: clears child-mode cookie when deleted profile matches cookie
- [x] Task: Write tests for `getActiveProfileFn` wrapper
    - [x] Test: throws for null session
    - [x] Test: calls `authorizeChildAccess` with correct profileId
- [x] Task: Write tests for `listProfilesForSwitchFn` wrapper
    - [x] Test: throws for child session (parent required)
- [x] Task: Run `pnpm test:coverage` and verify `profiles.ts` ≥80% stmts/branch/funcs/lines (6eeb6ce)
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md) (f5e43e7)

## Phase 3: Letters Server Function Wrappers (`app/server/letters.test.ts`)

- [x] Task: Write tests for `getVisibleLettersFn` wrapper
    - [x] Test: throws for null session (unauthenticated)
    - [x] Test: calls `authorizeChildAccess` with correct profileId
- [x] Task: Write tests for `toggleLetterFn` wrapper
    - [x] Test: throws for unauthenticated session
    - [x] Test: throws for child session (parent required)
- [x] Task: Write tests for `bulkToggleLettersFn` wrapper
    - [x] Test: throws for unauthenticated session
    - [x] Test: throws for child session (parent required)
- [x] Task: Run `pnpm test:coverage` and verify `letters.ts` ≥80% stmts/branch/funcs/lines (100% all metrics) ✅
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md) (ba6d1cc)

## Phase 4: Reading Server Function Wrapper (`app/server/reading.test.ts`)

- [x] Task: Write tests for `getReadingDataFn` wrapper
    - [x] Test: throws for null session (unauthenticated)
    - [x] Test: calls `authorizeChildAccess` with correct profileId
    - [x] Test: delegates to `getReadingData` with correct userId and profileId
- [x] Task: Run `pnpm test:coverage` and verify `reading.ts` ≥80% stmts/branch/funcs/lines (100% stmts, 87.5% branch, 100% funcs, 100% lines) ✅
- [x] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md) (3d698cf)

## Phase 5: Final Verification

- [x] Task: Run full test suite (`pnpm test`) — verify 522 tests pass across 60 files, no regressions ✅
- [x] Task: Run `pnpm test:coverage` — verify all 4 target files ≥80% across all metrics ✅
- [x] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md) (3d698cf)
