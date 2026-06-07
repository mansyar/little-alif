<protect>
# Specification: Drizzle SQL Migration Workflow

## Overview

Replace the current `drizzle-kit push`-based schema management with a proper SQL migration workflow using `drizzle-kit generate` + `drizzle-kit migrate`. This eliminates the risk of data loss or corruption in the production database caused by `--force` schema pushes, and provides version-controlled, auditable migration SQL files.

## Functional Requirements

### FR-1: Migration Output Directory

- Configure `drizzle.config.ts` with `out: './app/db/migrations'` so generated migration SQL files land in `app/db/migrations/`.
- The `app/db/migrations/` directory MUST be tracked in git (version-controlled).
- Migration files use Drizzle's default naming convention (e.g., `0000_nifty_name.sql`).

### FR-2: Package Scripts Update

- **Remove** the `db:push` script from `package.json`.
- **Add** a `db:generate` script: `drizzle-kit generate --config drizzle.config.ts`
- **Add** a `db:migrate` script: `drizzle-kit migrate --config drizzle.config.ts`
- **Keep** existing `db:studio` and `db:seed` scripts unchanged.

### FR-3: Initial Migration Snapshot

- Run `drizzle-kit generate` to produce the initial migration snapshot covering all 7 tables:
  - Application tables: `profiles`, `letters`, `letter_toggles`
  - Better Auth tables: `user`, `session`, `account`, `verification`
- The generated `.sql` file and its `meta/` snapshot directory MUST be committed to git.

### FR-4: Auto-Migration on App Startup

- Integrate programmatic migration (`drizzle-orm/libsql/migrator`) into the app's server initialization so migrations run automatically every time the server starts.
- The migration MUST run BEFORE the server begins accepting requests.
- The migration call MUST be idempotent (Drizzle tracks applied migrations in a `__drizzle_migrations` table).
- Location: Create an `app/db/migrate.ts` helper that exports an `autoMigrate()` function, called during TanStack Start server bootstrap.

### FR-5: Docker Deployment Compatibility

- Since migrations run on app startup, no additional Docker entrypoint changes are needed.
- The existing Docker multi-stage build remains compatible — the running container auto-migrates on start.

## Non-Functional Requirements

- **Safety:** The `--force` flag must never appear in the production migration path.
- **Idempotency:** Running `db:migrate` multiple times must be safe (Drizzle tracks already-applied migrations).
- **Traceability:** Every schema change must be represented by a `.sql` file in `app/db/migrations/` under version control.

## Acceptance Criteria

1. `drizzle.config.ts` has `out: './app/db/migrations'` configured.
2. `package.json` has `db:generate` and `db:migrate` scripts; `db:push` is removed.
3. Initial migration SQL file exists at `app/db/migrations/0000_*.sql` and is committed.
4. `app/db/migrate.ts` exports an `autoMigrate()` function.
5. The server calls `autoMigrate()` at startup before accepting requests.
6. Running `pnpm db:generate` after a schema change produces a new migration file.
7. Running `pnpm db:migrate` applies pending migrations safely.

## Out of Scope

- Changing the database schema itself (adding/removing tables or columns).
- Modifying the Dockerfile or docker-compose configuration.
- Creating rollback/down migration scripts (Drizzle does not natively support down migrations via generate).
  </protect>
