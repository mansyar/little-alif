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

## Phase 2: Profiles Server Function Wrappers (`app/server/profiles.test.ts`)

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
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Letters Server Function Wrappers (`app/server/letters.test.ts`)

- [ ] Task: Write tests for `getVisibleLettersFn` wrapper
    - [ ] Test: throws for null session (unauthenticated)
    - [ ] Test: calls `authorizeChildAccess` with correct profileId
- [ ] Task: Write tests for `toggleLetterFn` wrapper
    - [ ] Test: throws for unauthenticated session
    - [ ] Test: throws for child session (parent required)
- [ ] Task: Write tests for `bulkToggleLettersFn` wrapper
    - [ ] Test: throws for unauthenticated session
    - [ ] Test: throws for child session (parent required)
- [ ] Task: Run `pnpm test:coverage` and verify `letters.ts` ≥80% stmts/branch/funcs/lines
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Reading Server Function Wrapper (`app/server/reading.test.ts`)

- [ ] Task: Write tests for `getReadingDataFn` wrapper
    - [ ] Test: throws for null session (unauthenticated)
    - [ ] Test: calls `authorizeChildAccess` with correct profileId
    - [ ] Test: delegates to `getReadingData` with correct userId and profileId
- [ ] Task: Run `pnpm test:coverage` and verify `reading.ts` ≥80% stmts/branch/funcs/lines
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Final Verification

- [ ] Task: Run full test suite (`pnpm test`) — verify 484+ tests pass, no regressions
- [ ] Task: Run `pnpm test:coverage` — verify all 4 target files ≥80% across all metrics
- [ ] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
