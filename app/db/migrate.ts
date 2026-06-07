import { migrate } from 'drizzle-orm/libsql/migrator';
import type { DbClient } from './index';

/**
 * Apply pending Drizzle migrations to the given database client.
 *
 * Reads migration SQL files from `migrationsFolder` (typically
 * `app/db/migrations/`) and applies any that haven't been applied yet.
 * Drizzle tracks applied migrations in a `__drizzle_migrations` journal
 * table, making this function idempotent.
 *
 * @param db - The Drizzle ORM database client.
 * @param migrationsFolder - Absolute path to the directory containing
 *   migration SQL files and the `meta/_journal.json` manifest.
 */
export async function autoMigrate(db: DbClient, migrationsFolder: string): Promise<void> {
  await migrate(db, { migrationsFolder });
}
