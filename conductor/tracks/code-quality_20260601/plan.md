# Implementation Plan: Setup Code Quality Check on Commit

**Track:** `code-quality_20260601`
**Status:** New

---

## Phase 1: Prettier Setup + Initial Meta-Tests (Red→Green for Prettier)

**Goal:** Install and configure Prettier for the entire project, and write the first wave of meta-tests that validate the tooling configuration. Prettier-related tests transition from Red to Green in this phase; tests for ESLint/Husky/lint-staged remain Red until later phases.

- [ ] Task: Write failing meta-tests for tooling configuration
    - [ ] Create `app/lib/tooling/quality-hooks.test.ts` with `describe` blocks for: `Prettier`, `ESLint`, `Husky + lint-staged`, `package.json scripts`
    - [ ] Add Prettier tests:
        - [ ] `.prettierrc` exists at project root and is valid JSON
        - [ ] `.prettierignore` exists at project root and excludes `node_modules`, `dist`, `.output`, `coverage`, `pnpm-lock.yaml`
        - [ ] Prettier config has `printWidth: 100`, `semi: true`, `singleQuote: true`, `tabWidth: 2`
    - [ ] Add ESLint tests (will fail until Phase 2):
        - [ ] `eslint.config.js` exists and exports an array
        - [ ] `eslint.config.js` is loadable via dynamic import in Node
    - [ ] Add Husky + lint-staged tests (will fail until Phase 3):
        - [ ] `.husky/pre-commit` exists and contains `pnpm lint-staged`
        - [ ] `package.json` `lint-staged` block maps `*.{ts,tsx}` to `eslint --fix`, `prettier --write`, `tsc --noEmit` (in that order)
        - [ ] `package.json` `lint-staged` block maps `*.{json,md,css}` to `prettier --write`
        - [ ] `package.json` has a `prepare` script that runs `husky`
    - [ ] Add package.json script tests (mixed: Prettier passes after Phase 1, others after their phases):
        - [ ] `format` script exists and invokes `prettier --write`
        - [ ] `format:check` script exists and invokes `prettier --check`
        - [ ] `lint` script exists and invokes `eslint`
        - [ ] `lint:fix` script exists and invokes `eslint --fix`
    - [ ] Run `CI=true pnpm test` and confirm Prettier tests fail (no config yet) and the other tests also fail (missing config)

- [ ] Task: Implement Prettier configuration
    - [ ] Run `pnpm add -D prettier` to install Prettier
    - [ ] Create `.prettierrc` at project root with `printWidth: 100`, `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: "all"`
    - [ ] Create `.prettierignore` at project root listing: `node_modules`, `dist`, `.output`, `coverage`, `pnpm-lock.yaml`, `*.min.*`, `.husky`
    - [ ] Add to `package.json` `scripts`: `format: "prettier --write ."`, `format:check: "prettier --check ."`
    - [ ] Run `CI=true pnpm test` and confirm Prettier tests now pass (Green); other tests still fail as expected
    - [ ] Run `pnpm format` to normalize existing tracked code; review the diff to confirm only formatting changes
    - [ ] Commit the formatting changes separately with message `style(repo): apply prettier formatting`

- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: ESLint Setup (Flat Config)

**Goal:** Install ESLint v9 with TypeScript, React, and React-Hooks plugins. Configure with the flat config format. Set initial rules to `warn` to avoid blocking the track on pre-existing style debt. ESLint-related meta-tests transition from Red to Green in this phase.

- [ ] Task: Implement ESLint configuration
    - [ ] Run `pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks globals typescript-eslint` to install ESLint and plugins
    - [ ] Create `eslint.config.js` at project root using flat config:
        - [ ] Import `tseslint` from `typescript-eslint`
        - [ ] Export an array of config objects
        - [ ] Apply `tseslint.configs.recommendedTypeChecked` and `tseslint.configs.stylisticTypeChecked` for `.ts` and `.tsx` files
        - [ ] Apply `react-hooks/recommended` and `react/recommended` (with `react: { version: 'detect' }`) for `.tsx` files
        - [ ] Define `languageOptions.globals` with `globals.node` and `globals.browser`
        - [ ] Define `ignores`: `node_modules`, `dist`, `.output`, `coverage`, `*.config.js`, `app/db/migrations/**`
        - [ ] Set `languageOptions.parserOptions.project` to `./tsconfig.json` for type-aware linting
    - [ ] Add to `package.json` `scripts`: `lint: "eslint ."`, `lint:fix: "eslint . --fix"`
    - [ ] Run `CI=true pnpm test` and confirm ESLint-related meta-tests pass (Green)
    - [ ] Run `pnpm lint` to view the baseline of pre-existing warnings; document any patterns in the commit message
    - [ ] Verify `pnpm typecheck` still passes (no new errors introduced by the new lint config)
    - [ ] Verify all existing tests still pass (`CI=true pnpm test`)

- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Husky + lint-staged Setup + End-to-End Smoke

**Goal:** Wire the Git pre-commit hook via Husky, configure lint-staged to run formatters/linters on staged files, and verify the full pipeline end-to-end with intentional failure cases. Husky/lint-staged meta-tests transition from Red to Green in this phase.

- [ ] Task: Implement Husky and lint-staged configuration
    - [ ] Run `pnpm add -D husky lint-staged` to install Husky and lint-staged
    - [ ] Add to `package.json` `scripts`: `prepare: "husky"`
    - [ ] Add to `package.json` a top-level `lint-staged` block:
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
    - [ ] Run `pnpm exec husky init` to create the `.husky/` directory and update the path in `.gitignore` if needed
    - [ ] Replace `.husky/pre-commit` content with: `pnpm lint-staged`
    - [ ] Ensure `.husky/pre-commit` is executable (verify on Windows: Husky v9 handles this internally)
    - [ ] Run `CI=true pnpm test` and confirm all meta-tests pass (Green)

- [ ] Task: End-to-end smoke test of the pre-commit pipeline
    - [ ] Smoke test 1 — Prettier auto-fix: create a temporary file with intentional bad formatting, `git add` it, attempt `git commit`, verify Prettier reformats and the commit succeeds
    - [ ] Smoke test 2 — Type error blocked: stage a `.ts` file containing an obvious type error (e.g., `const x: number = "string"`), attempt `git commit`, verify rejection with tsc error output and the commit is NOT created
    - [ ] Smoke test 3 — Lint error blocked: stage a `.tsx` file with a `react-hooks/exhaustive-deps` violation, attempt `git commit`, verify rejection with ESLint output
    - [ ] Smoke test 4 — Escape hatch: verify `git commit --no-verify` still works and bypasses all hooks
    - [ ] Smoke test 5 — Performance: measure the pre-commit duration with the Sample Commit (5 files, 1 TS / 1 TSX / 1 JSON / 1 MD / 1 CSS), confirm <10s
    - [ ] Clean up all temporary test files used in smoke tests; reset working tree

- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase 4: Documentation Update

**Goal:** Document the new pre-commit pipeline in the project's workflow and tech-stack files so future contributors understand the policy.

- [ ] Task: Update `conductor/workflow.md` and `conductor/tech-stack.md`
    - [ ] In `conductor/workflow.md`, add a "Pre-Commit Quality Gates" subsection under "Quality Gates" with:
        - [ ] The pre-commit pipeline: Husky + lint-staged → ESLint + Prettier + tsc
        - [ ] The `git commit --no-verify` escape hatch (with warning that it bypasses all checks)
        - [ ] Manual commands: `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`
        - [ ] Cross-link to the new dev tools in `tech-stack.md`
    - [ ] In `conductor/tech-stack.md`, update the "Development Tools" section to record:
        - [ ] Added: `prettier`, `eslint` + TypeScript/React plugins, `husky`, `lint-staged`
        - [ ] Initial Prettier settings, initial ESLint config format (flat)
    - [ ] Verify both files render as valid Markdown and links resolve
    - [ ] Re-run `CI=true pnpm test` to confirm the meta-tests still pass after docs changes

- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
