/**
 * Seed runner: idempotently inserts the 28 Hijaiyah letters.
 * If letters already exist (by id), they are skipped.
 *
 * Usage: `pnpm db:seed` (resolves to `tsx app/db/seed.ts`)
 */
import { fileURLToPath } from 'url';
import { getDb } from './index';
import { seedLetters } from './seed-letters';

export async function seed(): Promise<void> {
  const db = await getDb();
  await seedLetters(db);
}

// Self-execute when run directly via `pnpm db:seed` (tsx app/db/seed.ts)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seed().catch((err: unknown) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  });
}
