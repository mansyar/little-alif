/**
 * Seed runner: idempotently inserts the 28 Hijaiyah letters.
 * If letters already exist (by id), they are skipped.
 *
 * Usage: `pnpm db:seed` (resolves to `tsx app/db/seed.ts`)
 */
import { getDb } from './index';
import { letters } from './schema';
import { SEED_LETTERS } from './seed-data';

async function seed(): Promise<void> {
  const db = getDb();
  const existing = await db.select({ id: letters.id }).from(letters);
  const existingIds = new Set(existing.map((row) => row.id));

  const toInsert = SEED_LETTERS.filter((letter) => !existingIds.has(letter.id));

  if (toInsert.length === 0) {
    console.log(`[seed] All ${SEED_LETTERS.length} letters already present. Nothing to do.`);
    return;
  }

  await db.insert(letters).values(
    toInsert.map((letter) => ({
      id: letter.id,
      character: letter.character,
      displayOrder: letter.displayOrder,
      audioFiles: JSON.stringify(letter.audioFiles),
    })),
  );

  console.log(
    `[seed] Inserted ${toInsert.length} letter(s); ` +
      `total in table: ${existing.length + toInsert.length} / ${SEED_LETTERS.length}.`,
  );
}

seed().catch((err: unknown) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
