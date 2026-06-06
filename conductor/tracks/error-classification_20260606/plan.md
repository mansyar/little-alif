# T-18: Error Classification System — Implementation Plan

**Track ID:** `error-classification_20260606`
**Type:** Feature
**Depends on:** T-12 (Toast system + ErrorBoundary)

---

## Phase 1: Error Type System & i18n Keys [checkpoint: d6f1349]

- [x] Task: Create Error Type System (`app/lib/errors/index.ts`)
    - [ ] Define `ErrorCode` string enum: VALIDATION, AUTH, NOT_FOUND, LIMIT_EXCEEDED, NETWORK, UNKNOWN
    - [ ] Define `ServerFunctionError` class extending `Error` with `code`, `userMessage`, and optional `cause`
    - [ ] Define `ERROR_TOAST_VARIANT` mapping object (ErrorCode → 'error' | 'info')
    - [ ] Write unit tests: class instantiation, instanceof check, code property, cause propagation, UNKNOWN fallback
    - [ ] Verify: `pnpm test` passes for new error tests
- [x] Task: Add 6 i18n error keys (EN + ID)
    - [ ] Add keys to `app/lib/i18n/en/index.ts`: ERROR_VALIDATION, ERROR_AUTH, ERROR_NOT_FOUND, ERROR_LIMIT_EXCEEDED, ERROR_NETWORK, ERROR_UNKNOWN
    - [ ] Add keys to `app/lib/i18n/id/index.ts`: Indonesian translations for all 6
    - [ ] Run `pnpm i18n` to regenerate type files
    - [ ] Verify: `pnpm typecheck` passes with new keys
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Server Function Error Classification [checkpoint: ed6a7f0]

- [x] Task: Update `app/server/auth-fns.ts`
    - [x] Replace `throw new Error('Unauthenticated.')` → `ServerFunctionError('AUTH', 'ERROR_AUTH')`
    - [x] Replace `throw new Error('Unauthorized. Parent session required.')` → `ServerFunctionError('AUTH', 'ERROR_AUTH')`
    - [x] Replace `throw new Error('Unauthorized.')` → `ServerFunctionError('AUTH', 'ERROR_AUTH')`
    - [x] Replace `throw new Error('Profile not found...')` → `ServerFunctionError('NOT_FOUND', 'ERROR_NOT_FOUND')`
    - [x] Update Better Auth `APIError` catch to throw `ServerFunctionError('AUTH', 'ERROR_AUTH', err)`
    - [x] Write/update unit tests verifying ServerFunctionError is thrown with correct codes
    - [x] Verify: `pnpm test` passes
- [x] Task: Update `app/server/profiles.ts`
    - [x] Replace `throw new Error('Maximum of 4 child profiles reached.')` → `ServerFunctionError('LIMIT_EXCEEDED', 'ERROR_LIMIT_EXCEEDED')`
    - [x] Replace `throw new Error('Failed to create profile.')` → `ServerFunctionError('UNKNOWN', 'ERROR_UNKNOWN')`
    - [x] Replace `throw new Error('Profile not found...')` → `ServerFunctionError('NOT_FOUND', 'ERROR_NOT_FOUND')`
    - [x] Write/update unit tests verifying ServerFunctionError is thrown
    - [x] Verify: `pnpm test` passes
- [x] Task: Update `app/server/letters.ts`
    - [x] Server function wrappers: replace `throw new Error('Unauthenticated.')` → `ServerFunctionError('AUTH', 'ERROR_AUTH')`
    - [x] Write/update unit tests
    - [x] Verify: `pnpm test` passes
- [x] Task: Update `app/server/reading.ts`
    - [x] Server function wrapper: replace `throw new Error('Unauthenticated.')` → `ServerFunctionError('AUTH', 'ERROR_AUTH')`
    - [x] Write/update unit tests
    - [x] Verify: `pnpm test` passes
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Client-Side Integration

- [x] Task: Create `useTypedMutation` hook (`app/lib/hooks/useTypedMutation.ts`)
    - [x] Thin wrapper around TanStack Query `useMutation`
    - [x] On error: detect `ServerFunctionError`, resolve variant from `ERROR_TOAST_VARIANT`, resolve message via passed `LL`, dispatch `pushToast`
    - [x] Non-`ServerFunctionError` falls back to `UNKNOWN` → `ERROR_UNKNOWN` toast
    - [x] Write unit tests: ServerFunctionError handling, non-classified Error fallback, UNKNOWN default, multiple consecutive errors
    - [x] Verify: `pnpm test` passes
- [x] Task: Update ErrorBoundary (`app/components/ui/ErrorBoundary.tsx`)
    - [x] In `componentDidCatch`: check `error instanceof ServerFunctionError`, store `userMessage` in state
    - [x] Render `userMessage` instead of generic text when available
    - [x] Update tests to verify contextual message display
    - [x] Verify: `pnpm test` passes
- [x] Task: Update toast-wired components to use `useTypedMutation` [072c74c]
    - [x] `app/components/parent/LetterToggleGrid.tsx` — replace manual `pushToast` in toggle + bulk mutations
    - [x] `app/components/parent/ProfileEditor.tsx` — replace manual `pushToast` in create/update mutations
    - [x] `app/components/parent/HarakatSelector.tsx` — replace manual `pushToast`
    - [x] `app/components/parent/ProfileMenu.tsx` — replace manual `pushToast` in sign-out error
    - [x] `app/routes/dashboard.tsx` — replace manual `pushToast` in delete mutation
    - [x] Write integration tests for at least 2 components verifying toast variant + message correctness
    - [x] Verify: `pnpm test`, `pnpm typecheck`, `pnpm lint` all pass
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md) [072c74c]
