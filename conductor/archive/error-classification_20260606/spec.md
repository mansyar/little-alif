# T-18: Error Classification System

## Overview

Server function errors currently surface as generic "Something went wrong" toasts with raw error messages. Create a lightweight error classification system with typed error codes that maps to contextual, bilingual toast messages — so the parent sees useful hints like "Connection lost. Check your internet." instead of a vague failure.

## Functional Requirements

### FR-1: Error Type System

- **FR-1.1:** Define a `ServerFunctionError` class extending `Error` with:
  - `code` property of type `ErrorCode`
  - `userMessage` property (localizable string key)
  - `cause` optional property for original error capture
- **FR-1.2:** Define `ErrorCode` string enum with values:
  - `VALIDATION` — input validation failures
  - `AUTH` — authentication/authorization failures
  - `NOT_FOUND` — resource not found
  - `LIMIT_EXCEEDED` — business rule limits (e.g., max 4 profiles)
  - `NETWORK` — transport-level failures (fetch errors)
  - `UNKNOWN` — fallback for unclassified errors
- **FR-1.3:** File lives at `app/lib/errors/index.ts` for extensibility.

### FR-2: i18n Error Messages

- **FR-2.1:** Define 6 new i18n keys in both EN and ID locales:
  - `ERROR_VALIDATION` → "Check your input and try again." / "Periksa input Anda dan coba lagi."
  - `ERROR_AUTH` → "Please sign in again." / "Silakan masuk lagi."
  - `ERROR_NOT_FOUND` → "Item not found. It may have been deleted." / "Item tidak ditemukan. Mungkin sudah dihapus."
  - `ERROR_LIMIT_EXCEEDED` → "Maximum reached." / "Batas maksimum tercapai."
  - `ERROR_NETWORK` → "Connection lost. Check your internet." / "Koneksi terputus. Periksa internet Anda."
  - `ERROR_UNKNOWN` → "Something went wrong. Please try again." / "Terjadi kesalahan. Silakan coba lagi."
- **FR-2.2:** Error-to-toast-variant mapping:
  - `VALIDATION` → `info`
  - `AUTH` → `error`
  - `NOT_FOUND` → `info`
  - `LIMIT_EXCEEDED` → `error`
  - `NETWORK` → `error`
  - `UNKNOWN` → `error`

### FR-3: `useTypedMutation` Hook

- **FR-3.1:** Create a thin wrapper around `useMutation` from TanStack Query
- **FR-3.2:** On error, if the error is a `ServerFunctionError`, dispatch `pushToast` with:
  - Correct toast variant based on error code mapping
  - `userMessage` resolved from i18n (via passed `LL` or context)
- **FR-3.3:** Non-`ServerFunctionError` errors fall back to `UNKNOWN` variant
- **FR-3.4:** Auth errors should also trigger redirect to `/login` (handled by existing middleware — confirm no double behavior)

### FR-4: Update Server Function Handlers

- **FR-4.1:** Replace all `throw new Error('message')` in server function handlers with `throw new ServerFunctionError(code, messageKey)`:
  - `app/server/auth-fns.ts` — `requireParentSession`, `authorizeChildAccess`, `enableChildMode`, `registerFn`/`loginFn` catch
  - `app/server/profiles.ts` — `createProfile`, `updateProfile`, `deleteProfile`
  - `app/server/letters.ts` — `getVisibleLettersFn`, `toggleLetterFn`, `bulkToggleLettersFn` wrappers
  - `app/server/reading.ts` — `getReadingDataFn` wrapper
- **FR-4.2:** Map error messages to appropriate codes:
  | Current Message | Proposed Code |
  |---|---|
  | "Maximum of 4 child profiles reached." | `LIMIT_EXCEEDED` |
  | "Failed to create profile." | `UNKNOWN` |
  | "Profile not found or does not belong to you." | `NOT_FOUND` |
  | "Unauthenticated." | `AUTH` |
  | "Unauthorized. Parent session required." | `AUTH` |
  | "Unauthorized." | `AUTH` |
  | Better Auth APIError rethrows | `AUTH` |

### FR-5: Update ErrorBoundary

- **FR-5.1:** Update `componentDidCatch` to check if the error is a `ServerFunctionError`
- **FR-5.2:** If it is, display its `userMessage` instead of the generic fallback text
- **FR-5.3:** Keep "Try Again" button behavior unchanged

### FR-6: Update Toast-Wired Components

- **FR-6.1:** Update components that manually call `pushToast({ variant: 'error', message: err.message })` to use `useTypedMutation` or at minimum show mapped messages
- **FR-6.2:** Affected components: `LetterToggleGrid`, `ProfileEditor`, `HarakatSelector`, `ProfileMenu`, `dashboard.tsx`

## Non-Functional Requirements

- **NFR-1:** Backward compatible — old `Error` subclasses still work, uncaught errors fall through to `UNKNOWN`
- **NFR-2:** Error messages are user-facing, concise — debug details go to `console.error`
- **NFR-3:** Each error gets its own toast (existing stacking behavior preserved)
- **NFR-4:** Network errors detected client-side (`TypeError: Failed to fetch`) mapped to `NETWORK` code

## Acceptance Criteria

1. Toggle a letter while offline → "Connection lost" toast (coral variant)
2. Delete a profile that was already deleted → "Item not found" toast
3. Try to create a 5th profile → "Maximum reached" toast
4. Try to toggle a non-owned profile → "Please sign in again" toast
5. ErrorBoundary shows contextual message when catching `ServerFunctionError`
6. Switch locale to ID → all error toasts show Indonesian text
7. All existing tests pass (non-breaking)
8. New tests cover: `ServerFunctionError` class, error code mapping, `useTypedMutation`, ErrorBoundary integration
9. `pnpm test`, `pnpm typecheck`, `pnpm lint` all pass

## Out of Scope

- Full Result/Option type monad — just a lightweight Error subclass
- Retry logic in `useTypedMutation` — deferred to future track
- Error logging service / remote error reporting
- Child-mode error messages (child UI is icon-only, errors are silent)
