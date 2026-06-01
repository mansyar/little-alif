import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as authSchema from './auth-schema';
import * as schema from './schema';

/** Combined schema: application tables + Better Auth tables. */
const fullSchema = { ...schema, ...authSchema };

export type DbClient = LibSQLDatabase<typeof fullSchema>;

/**
 * Resolve the database URL. Defaults to a local SQLite file inside
 * `data/` so a fresh checkout can run without an `.env`.
 *
 * Supports both local file URLs (`file:./data/little-alif.db`) and
 * Turso remote URLs (`libsql://...`).
 */
function resolveDatabaseUrl(): string {
  return process.env['DATABASE_URL'] ?? 'file:./data/little-alif.db';
}

let _client: Client | null = null;
let _db: DbClient | null = null;

/**
 * Lazily initialize and return a singleton libSQL client.
 * The client is reused across calls within a single process.
 */
export function getClient(): Client {
  if (_client === null) {
    _client = createClient({ url: resolveDatabaseUrl() });
  }
  return _client;
}

/**
 * Lazily initialize and return a singleton Drizzle DB instance.
 * The DB is bound to the combined schema (application + auth) for
 * typed query building.
 */
export function getDb(): DbClient {
  if (_db === null) {
    _db = drizzle(getClient(), { schema: fullSchema });
  }
  return _db;
}

export { schema, authSchema, fullSchema };
