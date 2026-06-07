import { describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import type { Client } from '@libsql/client';
import path from 'path';
import { autoMigrate } from './migrate';
import type { DbClient } from './index';

const migrationsFolder = path.resolve(process.cwd(), 'app/db/migrations');

/** Create a fresh in-memory SQLite DB and return both the raw client and Drizzle wrapper. */
function createFreshDb(): { rawClient: Client; db: DbClient } {
  const rawClient = createClient({ url: ':memory:' });
  const db = drizzle(rawClient) as unknown as DbClient;
  return { rawClient, db };
}

describe('autoMigrate', () => {
  it('creates the __drizzle_migrations journal table after first run', async () => {
    const { rawClient, db } = createFreshDb();

    await autoMigrate(db, migrationsFolder);

    const result = await rawClient.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'",
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({ name: '__drizzle_migrations' });
  });

  it('creates all 7 application and auth tables', async () => {
    const { rawClient, db } = createFreshDb();

    await autoMigrate(db, migrationsFolder);

    const expectedTables = [
      'user',
      'session',
      'account',
      'verification',
      'profiles',
      'letters',
      'letter_toggles',
    ];

    const result = await rawClient.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
    );
    const tableNames = result.rows.map((row) => row.name);
    for (const table of expectedTables) {
      expect(tableNames).toContain(table);
    }
  });

  it('is idempotent — calling it twice does not error', async () => {
    const { db } = createFreshDb();

    // First call — should succeed
    await autoMigrate(db, migrationsFolder);

    // Second call — should also succeed without error
    await expect(autoMigrate(db, migrationsFolder)).resolves.toBeUndefined();
  });
});
