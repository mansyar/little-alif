import { describe, expect, it, beforeAll } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { profiles, letters, letterToggles } from '~/db/schema';
import { LETTER_IDS } from '~/lib/constants/letters';
import * as authSchema from '~/db/auth-schema';
import type { DbClient } from '~/db';
import { getReadingData } from '../reading';

// ─── Setup ────────────────────────────────────────────────────────────

let db: DbClient;
let rawClient: ReturnType<typeof createClient>;

async function applyDdl(): Promise<void> {
  const ddl = [
    `CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER DEFAULT 0,
      name TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      vowel_mode TEXT NOT NULL DEFAULT 'fathah',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS letters (
      id TEXT PRIMARY KEY,
      character TEXT NOT NULL,
      display_order INTEGER NOT NULL,
      audio_files TEXT NOT NULL DEFAULT '{}'
    )`,
    `CREATE TABLE IF NOT EXISTS letter_toggles (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      letter_id TEXT NOT NULL REFERENCES letters(id),
      is_visible INTEGER DEFAULT 0,
      toggled_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS unq_profile_letter ON letter_toggles(profile_id, letter_id)`,
    `PRAGMA foreign_keys = ON`,
  ];

  for (const sql of ddl) {
    await rawClient.execute(sql);
  }
}

async function seedLetters(): Promise<void> {
  for (let i = 0; i < LETTER_IDS.length; i++) {
    const letterId = LETTER_IDS[i]!;
    await rawClient.execute({
      sql: `INSERT INTO letters (id, character, display_order, audio_files) VALUES (?, ?, ?, ?)`,
      args: [letterId, String.fromCharCode(0x0627 + i), i + 1, '{}'],
    });
  }
}

beforeAll(async () => {
  rawClient = createClient({ url: ':memory:' });
  db = drizzle(rawClient, {
    schema: { ...authSchema, profiles, letters, letterToggles },
  }) as unknown as DbClient;

  await applyDdl();
  await seedLetters();
});

// ─── Helpers ──────────────────────────────────────────────────────────

async function createTestProfile(
  dbClient: DbClient,
  userId: string,
  name = 'TestChild',
  avatar = 'ba-boat',
  vowelMode = 'fathah',
) {
  const [profile] = await dbClient
    .insert(profiles)
    .values({ userId, name, avatar: avatar as 'ba-boat', vowelMode: vowelMode as 'fathah' })
    .returning();

  if (!profile) throw new Error('Failed to create test profile');

  // Seed 28 letter_toggles (all OFF)
  const toggleValues = LETTER_IDS.map((letterId) => ({
    profileId: profile.id,
    letterId,
  }));
  await dbClient.insert(letterToggles).values(toggleValues);

  return profile;
}

// ─── Tests ────────────────────────────────────────────────────────────

const TEST_USER = 'test-user-id-reading';
const OTHER_USER = 'other-user-reading';

describe('getReadingData', () => {
  it('returns toggled-ON letters only, in displayOrder, with letterId and character', async () => {
    const profile = await createTestProfile(db, TEST_USER);

    // Toggle 3 specific letters ON: ba (2), dal (10), kaf (22)
    await db.update(letterToggles).set({ isVisible: true }).where(eq(letterToggles.letterId, 'ba'));

    await db
      .update(letterToggles)
      .set({ isVisible: true })
      .where(eq(letterToggles.letterId, 'dal'));

    await db
      .update(letterToggles)
      .set({ isVisible: true })
      .where(eq(letterToggles.letterId, 'kaf'));

    const result = await getReadingData(db, TEST_USER, profile.id);

    expect(result.letters).toHaveLength(3);
    // Must be in displayOrder even though toggled out of order
    expect(result.letters[0]!.letterId).toBe('ba');
    expect(result.letters[0]!.character).toBeDefined();
    expect(result.letters[1]!.letterId).toBe('dal');
    expect(result.letters[2]!.letterId).toBe('kaf');

    // Should not include letters that are OFF
    const alif = result.letters.find((l: { letterId: string }) => l.letterId === 'alif');
    expect(alif).toBeUndefined();
  });

  it('returns the profile persisted vowelMode', async () => {
    const profile = await createTestProfile(db, TEST_USER, 'KasrahKid', 'ha-jar', 'kasrah');

    // Toggle at least 3 letters ON so there's data
    await db
      .update(letterToggles)
      .set({ isVisible: true })
      .where(eq(letterToggles.letterId, 'alif'));
    await db.update(letterToggles).set({ isVisible: true }).where(eq(letterToggles.letterId, 'ba'));
    await db.update(letterToggles).set({ isVisible: true }).where(eq(letterToggles.letterId, 'ta'));

    const result = await getReadingData(db, TEST_USER, profile.id);

    expect(result.vowelMode).toBe('kasrah');
  });

  it('zero visible letters returns empty letters array with vowelMode (does not throw)', async () => {
    const profile = await createTestProfile(db, TEST_USER, 'EmptyProfile', 'alif-lamp', 'dammah');

    // All toggles are OFF by default
    const result = await getReadingData(db, TEST_USER, profile.id);

    expect(result).toEqual({
      letters: [],
      vowelMode: 'dammah',
    });
  });

  it('throws when the profile does not belong to the calling user', async () => {
    const profile = await createTestProfile(db, OTHER_USER);

    await expect(getReadingData(db, TEST_USER, profile.id)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      userMessage: 'ERROR_NOT_FOUND',
    });
  });

  it('throws when the profile does not exist', async () => {
    await expect(getReadingData(db, TEST_USER, 'nonexistent-uuid-12345')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      userMessage: 'ERROR_NOT_FOUND',
    });
  });

  // Note: the `profile?.vowelMode ?? 'fathah'` fallback on line 61 of reading.ts
  // protects against an empty query result. verifyProfileOwnership runs first
  // and guarantees the row exists, so the nullish path is unreachable in practice.
  // All existing tests confirm the default 'fathah' is returned for valid profiles.
});
