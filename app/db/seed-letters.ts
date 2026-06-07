/**
 * Idempotently inserts the 28 Hijaiyah letters into the database.
 * Accepts a Drizzle DB instance directly — no circular dependency.
 *
 * Reused by:
 *  - `seed.ts` (CLI: `pnpm db:seed`)
 *  - `index.ts` (auto-seed on first getDb() call)
 */
import { type DbClient } from './index';
import { letters } from './schema';
import { SEED_LETTERS } from './seed-data';

export async function seedLetters(db: DbClient): Promise<void> {
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
