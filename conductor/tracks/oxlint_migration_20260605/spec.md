# Track: Migrate ESLint + Prettier to Oxlint + Oxfmt

## Overview

Replace the project's current linting and formatting toolchain (ESLint 9 + Prettier 3) with the Rust-based Oxlint linter and Oxfmt formatter from the Oxc project. This eliminates ~8MB of Node.js devDependencies, reduces full-project lint time from ~26s to under 500ms, and removes the Node.js runtime dependency for lint/format in CI.

## Motivation

- **Performance:** 50–130x faster linting, ~30x faster formatting
- **Simpler CI:** Oxlint/Oxfmt are standalone binaries — no `node_modules` needed for lint jobs
- **Smaller footprint:** Remove 6 ESLint ecosystem packages + Prettier (~8MB)
- **Modern tooling:** Backed by VoidZero (Evan You's team), 810+ built-in rules, active development

## Scope

- **Linter:** Replace ESLint 9 (flat config) with Oxlint
- **Formatter:** Replace Prettier 3 with Oxfmt
- **Type-aware linting:** Use `oxlint-tsgolint` (alpha) to preserve the 22 type-aware rules currently from `typescript-eslint/recommendedTypeChecked`
- **Migration style:** Full replacement — remove ESLint and Prettier entirely from `devDependencies` and config files

## Functional Requirements

### FR-1: Oxlint Configuration

- Create `.oxlintrc.json` with equivalent rules to current ESLint flat config
- Enable plugins: `eslint`, `typescript`, `react`, `unicorn`, `oxc`
- Configure `ignorePatterns` matching existing ESLint ignores
- Enable type-aware linting via `oxlint-tsgolint`

### FR-2: Oxfmt Configuration

- Read existing `.prettierrc` settings (printWidth: 100, singleQuote, trailingComma, etc.) — Oxfmt is natively compatible with Prettier config
- Create or reuse `.prettierignore` as Oxfmt ignore list

### FR-3: Script Updates

Update `package.json` scripts:

- `lint` → `oxlint . --deny-warnings`
- `lint:fix` → `oxlint --fix . --deny-warnings`
- `format` → `oxfmt --write .`
- `format:check` → `oxfmt --check .`

### FR-4: Pre-Commit Hook Updates

Update `lint-staged` in `package.json`:

- `*.{ts,tsx}` → `oxlint --fix` then `oxfmt --write`
- `*.{json,md,css}` → `oxfmt --write`

### FR-5: Dependency Removal

Remove these `devDependencies`:

- `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `typescript-eslint`
- `eslint-plugin-react`, `eslint-plugin-react-hooks`
- `globals`, `prettier`, `lint-staged`

### FR-6: Config File Cleanup

Delete or archive:

- `eslint.config.js`
- `.prettierrc` and `.prettierignore` (if Oxfmt can't use them directly)

### FR-7: Meta-Test Updates

Update `app/lib/tooling/quality-hooks.test.ts` to validate Oxlint/Oxfmt config instead of ESLint/Prettier.

### FR-8: Tech Stack Documentation

Update `conductor/tech-stack.md` to reflect the new linting/formatting toolchain.

## Non-Functional Requirements

- **Performance:** Full-project `oxlint` must complete in under 2 seconds (~26s currently)
- **Parity:** Lint output (errors/warnings) must be semantically equivalent — no regressions where clean code becomes flagged
- **Formatting parity:** Oxfmt output should produce no diffs against current Prettier output for the existing codebase

## Acceptance Criteria

- [ ] `pnpm lint` passes with zero errors/warnings on the full codebase
- [ ] `pnpm format` produces zero diffs (`pnpm format:check` exits 0)
- [ ] `pnpm typecheck` still passes
- [ ] `pnpm test` passes (all existing tests)
- [ ] Pre-commit hook (`pnpm lint-staged && pnpm typecheck`) works correctly
- [ ] `quality-hooks.test.ts` passes with updated tooling checks
- [ ] ESLint, Prettier, and all their plugins are removed from `devDependencies`
- [ ] `conductor/tech-stack.md` is updated

## Out of Scope

- Migrating any other JS/TS tooling (e.g., Vitest → other, tsc → other)
- Adding new lint rules beyond the current equivalent set
- Changing code style decisions (trailing commas, quotes, etc.)
