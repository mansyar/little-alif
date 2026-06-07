/**
 * Server boot-up module: runs migration + seed once at process startup.
 *
 * Separated from `getDb()` to avoid circular dependencies and keep the
 * database access layer pure.
 */
import { getDb } from './index';
import { seedLetters } from './seed-letters';

let _booted = false;

async function boot(): Promise<void> {
  if (_booted) return;
  _booted = true;
  const db = await getDb();
  await seedLetters(db);
}

// Self-executes on module import (server startup).
// Only runs in the server process (not in browser/client-side SSR).
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  boot().catch((err) => {
    console.error('[boot] Database initialization failed:', err);
    process.exit(1);
  });
}
