#!/usr/bin/env node
/**
 * Startup migration + seed script.
 * Runs before the Nitro server starts.
 * Uses drizzle-orm's programmatic migrate() — no drizzle-kit or tsx needed.
 */
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./data/little-alif.db';
  console.log(`[startup] Connecting to database: ${dbUrl}`);

  const client = createClient({ url: dbUrl });
  const db = drizzle(client);

  // ── Step 1: Run pending migrations ──
  const migrationsFolder = resolve(rootDir, 'app/db/migrations');
  if (existsSync(migrationsFolder)) {
    console.log('[startup] Running database migrations...');
    await migrate(db, { migrationsFolder });
    console.log('[startup] Migrations complete.');
  } else {
    console.log('[startup] No migrations folder found — skipping migration step.');
  }

  // ── Step 2: Seed letters (idempotent) ──
  const seedDataPath = resolve(rootDir, 'app/db/seed-data.json');
  if (existsSync(seedDataPath)) {
    const seedLetters = JSON.parse(readFileSync(seedDataPath, 'utf-8'));
    const result = await client.execute({
      sql: 'SELECT id FROM letters',
      args: [],
    });
    const existingIds = new Set(result.rows.map((r) => String(r.id)));

    const toInsert = seedLetters.filter((l) => !existingIds.has(l.id));
    if (toInsert.length > 0) {
      for (const letter of toInsert) {
        await client.execute({
          sql: 'INSERT INTO letters (id, character, display_order, audio_files) VALUES (?, ?, ?, ?)',
          args: [
            letter.id,
            letter.character,
            letter.displayOrder,
            JSON.stringify(letter.audioFiles),
          ],
        });
      }
      console.log(`[startup] Inserted ${toInsert.length} letter(s).`);
    } else {
      console.log(`[startup] All ${seedLetters.length} letters already present.`);
    }
  } else {
    console.log('[startup] No seed-data.json found — skipping seed step.');
  }

  console.log('[startup] Startup complete. Handing off to Nitro...');
  client.close();
}

main().catch((err) => {
  console.error('[startup] Fatal:', err);
  process.exit(1);
});
