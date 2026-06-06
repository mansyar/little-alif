# Specification: Address Server Function Test Coverage Gap

## Overview

The `app/server/` directory has the lowest test coverage in the project. The pure helper functions (e.g., `getVisibleLetters`, `toggleLetter`, `createProfile`) are tested, but the `createServerFn` wrappers that handle session validation, authorization checks, and error mapping are not. This track adds tests for those uncovered code paths to bring each server file above 80% across all coverage metrics.

## Target Files

| File                     | Current Stmt% | Current Branch% | Current Funcs% |
| ------------------------ | ------------- | --------------- | -------------- |
| `app/server/auth-fns.ts` | 37.5          | 56.7            | 53.8           |
| `app/server/letters.ts`  | 56.3          | 75              | 70             |
| `app/server/profiles.ts` | 54.4          | 68.8            | 64.7           |
| `app/server/reading.ts`  | 64.7          | 62.5            | 80             |

## Functional Requirements

1. **FR-1:** Each target file must have test coverage ≥80% for statements, branches, functions, and lines.
2. **FR-2:** Tests must cover the `createServerFn` wrapper paths including:
   - Session validation (missing session, valid session)
   - Authorization checks (wrong user, profile ownership)
   - Input validation (Zod schema rejection)
   - Error mapping (APIError, generic errors)
3. **FR-3:** Tests must use the existing in-memory SQLite pattern (`@libsql/client` with `:memory:`) established in `app/server/letters.test.ts` and `app/server/profiles.test.ts`.
4. **FR-4:** All new tests must pass with `pnpm test`.
5. **FR-5:** Coverage must pass with `pnpm test:coverage` (v8 provider, 80% thresholds).

## Non-Functional Requirements

1. **NFR-1:** Tests must follow existing patterns — colocated test files, `describe`/`it` structure, `beforeAll` for DB setup.
2. **NFR-2:** No changes to production code — only test files are added or modified.
3. **NFR-3:** Mock external dependencies (Better Auth, DB module) using `vi.mock` where needed.

## Acceptance Criteria

- [ ] `pnpm test:coverage` shows ≥80% stmts, branch, funcs, lines for each of the 4 target files.
- [ ] All 484+ tests pass (no regressions).
- [ ] No production code modified.

## Out of Scope

- Component test coverage improvements (ParentGate, ProfileMenu, etc.)
- Changes to vitest configuration
- Refactoring server functions for testability
