# Plan: Migrate to Oxlint + Oxfmt

## Phase 1: Setup & Configuration

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
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Setup & Configuration' (Protocol in workflow.md)

## Phase 2: Lint Parity Verification

- [ ] Task: Run full-project oxlint and collect results
  - [ ] `oxlint .` — capture all warnings/errors
  - [ ] Compare against current ESLint output to identify regressions
  - [ ] Adjust .oxlintrc.json rules for any false positives
- [ ] Task: Fix or suppress any genuine new findings
  - [ ] Apply `--fix` where auto-fixable
  - [ ] Add inline comments for intentional non-issues
  - [ ] Iterate until `oxlint . --deny-warnings` exits 0
- [ ] Task: Update quality-hooks.test.ts for oxlint
  - [ ] Replace ESLint existence/validation tests with oxlint equivalents
  - [ ] Update expected config file references
- [ ] Task: Verify oxlint with type-aware rules
  - [ ] Run `oxlint-tsgolint` to verify type-aware linting works
  - [ ] Address any tsgo compatibility issues (e.g., paths/baseUrl resolution)
  - [ ] Fall back to type-unaware oxlint if tsgolint has issues, document tradeoff
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Lint Parity Verification' (Protocol in workflow.md)

## Phase 3: Format Parity Verification

- [ ] Task: Run oxfmt on full project
  - [ ] `oxfmt --write .` — apply Oxfmt formatting
  - [ ] `oxfmt --check .` — verify zero diffs
  - [ ] Check `git diff` to review Oxfmt output vs current Prettier output
  - [ ] If differences exist, adjust Oxfmt config or accept formatting changes
- [ ] Task: Update quality-hooks.test.ts for oxfmt
  - [ ] Replace Prettier config validation tests with oxfmt equivalents
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Format Parity Verification' (Protocol in workflow.md)

## Phase 4: Cleanup & Migration

- [ ] Task: Update package.json scripts
  - [ ] `lint` → `oxlint . --deny-warnings`
  - [ ] `lint:fix` → `oxlint --fix . --deny-warnings`
  - [ ] `format` → `oxfmt --write .`
  - [ ] `format:check` → `oxfmt --check .`
- [ ] Task: Update pre-commit hook and lint-staged
  - [ ] Remove `lint-staged` from devDependencies
  - [ ] Remove `lint-staged` config block from package.json
  - [ ] Update `.husky/pre-commit`: replace `pnpm lint-staged && pnpm typecheck` with `oxlint --fix . && oxfmt --write . && pnpm typecheck`
- [ ] Task: Remove old devDependencies
  - [ ] `pnpm remove eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript-eslint eslint-plugin-react eslint-plugin-react-hooks globals prettier`
- [ ] Task: Delete old config files
  - [ ] Delete `eslint.config.js`
  - [ ] Archive or delete `.prettierrc` (if not needed by Oxfmt)
  - [ ] Archive or delete `.prettierignore` (if not needed by Oxfmt)
- [ ] Task: Update conductor/tech-stack.md
  - [ ] Replace ESLint 9 + Prettier 3 references with Oxlint + Oxfmt
  - [ ] Update rule/plugin descriptions
  - [ ] Update pre-commit hook description
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Cleanup & Migration' (Protocol in workflow.md)

## Phase 5: Final Verification

- [ ] Task: Run full verification pipeline
  - [ ] `pnpm lint` — must exit 0
  - [ ] `pnpm format:check` — must exit 0
  - [ ] `pnpm typecheck` — must exit 0
  - [ ] `pnpm test` — must pass
- [ ] Task: Verify pre-commit hook works end-to-end
  - [ ] Stage a small change, run `pnpm exec husky .husky/pre-commit` — verify it runs oxlint, oxfmt, and tsc
- [ ] Task: Run quality-hooks tests
  - [ ] `pnpm test -- --run app/lib/tooling/quality-hooks.test.ts` — must pass
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Verification' (Protocol in workflow.md)
