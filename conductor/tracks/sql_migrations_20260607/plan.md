<protect>
# Implementation Plan: Drizzle SQL Migration Workflow

## Phase 1: Configure Migration Output & Scripts

- [x] Task: Update `drizzle.config.ts` with `out: './app/db/migrations'` (fe55d2f)
  - [x] Add `out` property pointing to `./app/db/migrations`
  - [x] Verify the config parses correctly — `drizzle-kit generate` produced the initial migration
- [x] Task: Update `package.json` scripts — remove `db:push`, add `db:generate` and `db:migrate` (93eb6e5)
  - [x] Remove the `db:push` script line
  - [x] Add `"db:generate": "drizzle-kit generate --config drizzle.config.ts"`
  - [x] Add `"db:migrate": "drizzle-kit migrate --config drizzle.config.ts"`
  - [x] Run `pnpm lint` and `pnpm typecheck` to verify no regressions
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Create Auto-Migration Module

- [ ] Task: Create `app/db/migrate.ts` with `autoMigrate()` function
  - [ ] Write failing test in `app/db/migrate.test.ts` — verify autoMigrate runs `migrate()` from `drizzle-orm/libsql/migrator` against an in-memory SQLite database and creates the `__drizzle_migrations` table
  - [ ] Implement `autoMigrate()` — import `migrate` from `drizzle-orm/libsql/migrator`, accept a `DbClient` and `migrationsFolder` path, call `migrate()` with proper error handling
  - [ ] Write test verifying `autoMigrate` is idempotent (calling it twice does not error)
  - [ ] Run tests and confirm they pass
- [ ] Task: Integrate `autoMigrate()` into server startup via `getDb()` in `app/db/index.ts`
  - [ ] Import `autoMigrate` and call it once inside the `getDb()` lazy singleton initializer (before returning the DbClient)
  - [ ] Resolve `migrationsFolder` path relative to the project root (`path.resolve(process.cwd(), 'app/db/migrations')`)
  - [ ] Write integration test — spy on `autoMigrate` to verify it is called exactly once when `getDb()` is invoked for the first time
  - [ ] Write test verifying `getDb()` still returns a valid DbClient after migration runs
  - [ ] Run full test suite to confirm no regressions
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Generate & Verify Initial Migration

- [ ] Task: Generate the initial migration snapshot
  - [ ] Confirm `app/db/migrations/` directory exists (git-tracked)
  - [ ] Run `pnpm db:generate` to produce `0000_*.sql` and `meta/` directory
  - [ ] Verify the generated SQL file covers all 7 tables (profiles, letters, letter_toggles, user, session, account, verification)
  - [ ] Review the generated `0000_*.sql` for correctness (no destructive DROP TABLE, CREATE TABLE IF NOT EXISTS)
- [ ] Task: Verify migration against a fresh database
  - [ ] Create a temporary empty database file
  - [ ] Run `pnpm db:migrate` against it
  - [ ] Verify all tables are created (e.g., via `pnpm db:studio` or by querying sqlite_master)
  - [ ] Verify `__drizzle_migrations` journal table exists
  - [ ] Run `pnpm db:migrate` a second time — confirm it is a no-op (no errors)
  - [ ] Clean up temporary database
- [ ] Task: Update `.gitignore` if needed — ensure `app/db/migrations/` is NOT ignored (it should be tracked)
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
      </protect>
