# Specification: Setup Code Quality Check on Commit

**Track:** `code-quality_20260601`
**Type:** Chore
**Status:** New

---

## Overview

Establish a Git pre-commit hook pipeline that automatically enforces TypeScript type-checking, ESLint linting, and Prettier formatting on staged files before a commit can be created. The goal is to catch code-quality regressions at the earliest possible point (commit time) rather than in CI or after push.

This is a developer-experience / tooling track. It introduces no user-facing changes. The hook will block commits that fail the configured checks, forcing the developer to fix the issue locally.

## Goals

- Block commits that fail type-check, lint, or formatting on the changed code.
- Keep the pre-commit feedback loop fast (<10 seconds) by running checks on staged files only.
- Document the new policy in `conductor/workflow.md` so future contributors know the rules.
- Maintain the ability to bypass via `git commit --no-verify` for genuine emergencies (documented, not encouraged).

## Functional Requirements

### FR-1: Install and Configure Prettier

- Install `prettier` as a dev dependency.
- Create `.prettierrc` with project-appropriate defaults (printWidth: 100, semi: true, singleQuote: true, tabWidth: 2).
- Create `.prettierignore` excluding `node_modules`, `dist`, `.output`, `coverage`, `pnpm-lock.yaml`, `*.min.*`.
- Add scripts to `package.json`: `format` (`prettier --write .`), `format:check` (`prettier --check .`).
- Run `pnpm format` once to normalize existing tracked code and commit the result as a `style(repo): apply prettier formatting` commit (separate from this track's work).

### FR-2: Install and Configure ESLint (Flat Config)

- Install `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `globals`, `typescript-eslint` as dev dependencies.
- Create `eslint.config.js` (flat config, ESLint v9 default) with:
  - `@typescript-eslint/recommended-type-checked` and `@typescript-eslint/stylistic-type-checked` rules
  - `react-hooks/recommended` and `react/recommended` rules
  - `globals.node` and `globals.browser` defined
  - Ignore patterns: `node_modules`, `dist`, `.output`, `coverage`, `*.config.js`
- Add scripts to `package.json`: `lint` (`eslint .`), `lint:fix` (`eslint . --fix`).
- On initial run, set `lint` rules to **warn** (not error) for any rules that flag pre-existing code, so this track doesn't get blocked by its own tooling. Tighten to error in a follow-up track.

### FR-3: Install and Configure Husky

- Install `husky` (v9+) as a dev dependency.
- Add `prepare: "husky"` script to `package.json` so `pnpm install` re-installs hooks on a fresh clone.
- Initialize the Git hooks directory with `.husky/pre-commit` containing:
  ```sh
  pnpm lint-staged
  ```

### FR-4: Install and Configure lint-staged

- Install `lint-staged` as a dev dependency.
- Add `lint-staged` configuration block to `package.json`:

  ```json
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "tsc --noEmit"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
  ```

  - `tsc --noEmit` runs on the full project (TypeScript limitation); lint-staged still scopes ESLint/Prettier to staged files.
  - All commands chained with `&&` semantics so any failure halts the chain.

### FR-5: Write Meta-Tests for Tooling Configuration

- Create `app/lib/tooling/quality-hooks.test.ts` that validates:
  - `.husky/pre-commit` exists and contains the `pnpm lint-staged` invocation.
  - `package.json` `lint-staged` block matches the expected glob→command map.
  - `package.json` `prepare` script runs `husky`.
  - `package.json` includes the new scripts: `format`, `format:check`, `lint`, `lint:fix`.
  - `.prettierrc` exists and is valid JSON.
  - `eslint.config.js` exists, is loadable, and exports a valid config array.
  - Run `CI=true pnpm test` — these meta-tests must pass alongside the existing test suite.

### FR-6: Update Workflow Documentation

- Update `conductor/workflow.md` — add a "Pre-Commit Quality Gates" subsection under "Quality Gates" describing:
  - The pre-commit pipeline (Husky + lint-staged → ESLint + Prettier + tsc).
  - The `git commit --no-verify` escape hatch.
  - How to run checks manually: `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`, `pnpm typecheck`.
- Update `conductor/tech-stack.md` to record the additions to the development tools section.

## Non-Functional Requirements

### NFR-1: Performance

- Pre-commit execution must complete in <10 seconds for typical commits (1–5 files changed).
- `tsc --noEmit` is the slowest step; its cost is amortized per-commit, not per-file.

### NFR-2: Cross-Platform Compatibility

- Hooks must work on macOS, Linux, and Windows (PowerShell / WSL / Git Bash). Husky v9+ supports this natively.

### NFR-3: Non-Interactive Operation

- All hook commands must run non-interactively. No prompts, no TTY dependencies. Follows the Workflow's "CI-Aware" principle.

## Acceptance Criteria

1. After `pnpm install` on a fresh clone, the `.husky/pre-commit` hook is in place and executable.
2. Attempting to commit a staged `.ts` file with a TypeScript type error is **rejected** with a clear error message.
3. Attempting to commit a staged `.ts` file with an ESLint error is **rejected** with a clear error message (after auto-fix has been attempted).
4. Attempting to commit a staged file with formatting issues results in the file being **auto-formatted by Prettier** and the commit proceeding normally.
5. The full pre-commit pipeline completes in <10 seconds for a typical commit.
6. `git commit --no-verify` still works as the documented escape hatch.
7. The new policy is documented in `conductor/workflow.md` and `conductor/tech-stack.md`.
8. All existing tests still pass; the new meta-tests in `app/lib/tooling/quality-hooks.test.ts` pass.
9. `pnpm typecheck` continues to pass cleanly with the new ESLint config.

## Out of Scope

- **Unit tests on commit** — Running the full Vitest suite on every commit would slow down the loop. Standard pattern is typecheck + lint + format on commit, full tests on push or in CI. A pre-push hook for the full test suite can be a future track.
- **Commit-msg hook / commitlint** — Conventional Commits enforcement is not in scope here.
- **IDE auto-format on save** — IDE configuration is left to the developer.
- **CI integration** — This track is local-only. CI configuration is a separate concern.
- **Tightening the initial "warn" lint rules to "error"** — The first run uses `warn` to avoid blocking this track on pre-existing style debt. A follow-up track can tighten incrementally.

## Dependencies Added

- Dev dependencies: `prettier`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `globals`, `typescript-eslint`, `husky`, `lint-staged`.
