# Plan: Migrate to Oxlint + Oxfmt

## Phase 1: Setup & Configuration [checkpoint: cbffdaa]

- [x] Task: Install oxlint, oxfmt, and oxlint-tsgolint (2c3e5e5)
  - [x] `pnpm add -D --save-exact oxlint oxfmt oxlint-tsgolint`
  - Note: oxlint 1.68.0 natively supports `--type-aware` — tsgolint CLI is unsupported, use oxlint's native flag instead.
- [x] Task: Run migration tool to generate initial .oxlintrc.json (2accc35)
  - [x] `npx @oxlint/migrate` to convert eslint.config.js → .oxlintrc.json
  - [x] Review unsupported rules logged by the migration tool
- [x] Task: Finalize .oxlintrc.json (2accc35)
  - [x] Verify plugins: eslint, typescript, react, unicorn, oxc are enabled
  - [x] Configure ignorePatterns matching current ESLint ignores
  - [x] Enable type-aware linting config for oxlint-tsgolint
  - [x] Set rule severities to match current behavior (warn/error parity)
  - [x] Fix tsconfig.json `baseUrl` to avoid tsgolint error
- [x] Task: Finalize .oxlintignore (49d1714)
  - [x] Create .oxlintignore with same patterns as existing ESLint ignores
- [x] Task: Configure Oxfmt (49d1714)
  - [x] Verify Oxfmt reads .prettierrc natively — NO, needs separate config
  - [x] Create Oxfmt-specific config via `oxfmt --migrate prettier` → .oxfmtrc.json
  - [x] Verify .prettierignore is compatible — YES, oxfmt reads it by default
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup & Configuration' (cbffdaa)

## Phase 2: Lint Parity Verification

- [x] Task: Run full-project oxlint and collect results
  - [x] `oxlint .` — 0 errors, 0 warnings on 131 files with 86 rules
  - [x] Compare against ESLint output — identical (0 errors, 0 warnings)
  - [x] No adjustments needed — full lint parity achieved
- [ ] Task: Fix or suppress any genuine new findings
  - [ ] Apply `--fix` where auto-fixable
  - [ ] Add inline comments for intentional non-issues
  - [ ] Iterate until `oxlint . --deny-warnings` exits 0
- [x] Task: Update quality-hooks.test.ts for oxlint (commit a9fdee9)
  - [x] Replace ESLint existence/validation tests with oxlint equivalents
  - [x] Update expected config file references
- [x] Task: Verify oxlint with type-aware rules (verified during Phase 1 & 2)
  - [x] oxlint 1.68.0 natively supports `--type-aware` — works perfectly (0 errors)
  - [x] `tsgolint` CLI warns its entrypoint is unsupported; oxlint native `--type-aware` is the correct path
  - [x] Config-based `typeAware: true` in .oxlintrc.json also works
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Lint Parity Verification' (Protocol in workflow.md)

## Phase 3: Format Parity Verification

- [x] Task: Run oxfmt on full project (verified — 226 files, all correctly formatted)
  - [x] `oxfmt --write .` — applied during Phase 1
  - [x] `oxfmt --check .` — zero diffs confirmed
  - [x] No formatting differences between Prettier and oxfmt output
- [x] Task: Update quality-hooks.test.ts for oxfmt (completed during Phase 2 — commit a9fdee9)
  - [x] Replace Prettier config validation tests with oxfmt equivalents
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Format Parity Verification' (Protocol in workflow.md)

## Phase 4: Cleanup & Migration

- [x] Task: Update package.json scripts (commit 913fa32)
  - [x] `lint` → `oxlint . --deny-warnings`
  - [x] `lint:fix` → `oxlint --fix . --deny-warnings`
  - [x] `format` → `oxfmt --write .`
  - [x] `format:check` → `oxfmt --check .`
- [x] Task: Update pre-commit hook and lint-staged (commit 913fa32)
  - [x] Remove `lint-staged` from devDependencies
  - [x] Remove `lint-staged` config block from package.json
  - [x] Update `.husky/pre-commit`: replace `pnpm lint-staged && pnpm typecheck` with `oxlint --fix . && oxfmt --write . && pnpm typecheck`
- [x] Task: Remove old devDependencies (commit 913fa32)
  - [x] `pnpm remove eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript-eslint eslint-plugin-react eslint-plugin-react-hooks globals prettier`
- [x] Task: Delete old config files (commit 913fa32)
  - [x] Delete `eslint.config.js`
  - [x] Delete `.prettierrc`
  - [x] Delete `.prettierignore`
- [x] Task: Update conductor/tech-stack.md
  - [x] Replace ESLint 9 + Prettier 3 references with Oxlint + Oxfmt
  - [x] Update rule/plugin descriptions
  - [x] Update pre-commit hook description
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Cleanup & Migration' (Protocol in workflow.md)

## Phase 5: Final Verification

- [x] Task: Run full verification pipeline
  - [x] `pnpm lint` — exits 0 (0 errors, 0 warnings)
  - [x] `pnpm format:check` — exits 0 (224 files formatted)
  - [x] `pnpm typecheck` — exits 0
  - [x] `pnpm test` — 484 tests pass
- [x] Task: Verify pre-commit hook works end-to-end
  - [x] Hook content: `oxlint --fix . && oxfmt --write . && pnpm typecheck`
  - [x] All three commands verified individually
- [x] Task: Run quality-hooks tests
  - [x] `pnpm test -- --run app/lib/tooling/quality-hooks.test.ts` — 18 tests pass
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Verification' (Protocol in workflow.md)
