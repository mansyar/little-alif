import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { and, eq, sql } from 'drizzle-orm';
import { profiles, letters, letterToggles } from '~/db/schema';
import { LETTER_IDS } from '~/lib/constants/letters';
import * as authSchema from '~/db/auth-schema';
import type { DbClient } from '~/db';
import { getVisibleLetters, toggleLetter, bulkToggleLetters } from './letters';

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
    const letterId = LETTER_IDS[i];
    await rawClient.execute({
      sql: `INSERT INTO letters (id, character, display_order, audio_files) VALUES (?, ?, ?, ?)`,
      args: [letterId!, String.fromCharCode(0x0627 + i), i + 1, '{}'],
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

afterAll(() => {
  // in-memory DB is discarded automatically
});

// ─── Helpers ───────────────────────────────────────────────────────────

async function createTestProfile(
  dbClient: DbClient,
  userId: string,
  name = 'TestChild',
  avatar = 'ba-boat',
) {
  const [profile] = await dbClient
    .insert(profiles)
    .values({ userId, name, avatar: avatar as 'ba-boat' })
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

function getToggle(dbClient: DbClient, profileId: string, letterId: string) {
  return dbClient
    .select()
    .from(letterToggles)
    .where(
      and(
        eq(letterToggles.profileId, profileId),
        // Use sql template to avoid strict LetterId union type mismatch
        eq(letterToggles.letterId, sql`${letterId}`),
      ),
    )
    .then((rows) => rows[0] ?? null);
}

// ─── Tests ────────────────────────────────────────────────────────────

const TEST_USER = 'test-user-id-001';
const OTHER_USER = 'other-user-id-002';

describe('getVisibleLetters', () => {
  it('returns all 28 letters with isVisible state for owned profile', async () => {
    const profile = await createTestProfile(db, TEST_USER);

    // Toggle one letter ON using direct DB update
    await db
      .update(letterToggles)
      .set({ isVisible: true })
      .where(and(eq(letterToggles.profileId, profile.id), eq(letterToggles.letterId, 'alif')));

    const result = await getVisibleLetters(db, TEST_USER, profile.id);
    expect(result).toHaveLength(28);

    const alif = result.find((l: { letterId: string }) => l.letterId === 'alif');
    expect(alif?.isVisible).toBe(true);

    const ba = result.find((l: { letterId: string }) => l.letterId === 'ba');
    expect(ba?.isVisible).toBe(false);
  });

  it('returns letters in display order (1–28)', async () => {
    const profile = await createTestProfile(db, TEST_USER);

    const result = await getVisibleLetters(db, TEST_USER, profile.id);
    expect(result).toHaveLength(28);

    // Verify order matches LETTER_IDS display order
    for (let i = 0; i < result.length; i++) {
      expect(result[i]!.letterId).toBe(LETTER_IDS[i]);
      expect(result[i]!.displayOrder).toBe(i + 1);
    }
  });

  it('rejects access to a profile owned by another user', async () => {
    const profile = await createTestProfile(db, OTHER_USER);

    await expect(getVisibleLetters(db, TEST_USER, profile.id)).rejects.toThrow(
      'Profile not found or does not belong to you.',
    );
  });
});

describe('toggleLetter', () => {
  const userId = 'toggle-test-user';

  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, userId));
  });

  it('successfully toggles a letter from OFF to ON', async () => {
    const profile = await createTestProfile(db, userId);

    const result = await toggleLetter(db, userId, {
      profileId: profile.id,
      letterId: 'ba',
      isVisible: true,
    });

    expect(result.letterId).toBe('ba');
    expect(result.isVisible).toBe(true);

    // Verify persistence
    const toggle = await getToggle(db, profile.id, 'ba');
    expect(toggle?.isVisible).toBe(true);
  });

  it('successfully toggles a letter from ON to OFF', async () => {
    const profile = await createTestProfile(db, userId);

    // First toggle ON
    await toggleLetter(db, userId, {
      profileId: profile.id,
      letterId: 'ba',
      isVisible: true,
    });

    // Then toggle OFF
    const result = await toggleLetter(db, userId, {
      profileId: profile.id,
      letterId: 'ba',
      isVisible: false,
    });

    expect(result.letterId).toBe('ba');
    expect(result.isVisible).toBe(false);
  });

  it('rejects toggling for a non-owned profile', async () => {
    const profile = await createTestProfile(db, OTHER_USER);

    await expect(
      toggleLetter(db, userId, {
        profileId: profile.id,
        letterId: 'ba',
        isVisible: true,
      }),
    ).rejects.toThrow('Profile not found or does not belong to you.');
  });
});

describe('bulkToggleLetters', () => {
  const userId = 'bulk-test-user';

  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, userId));
  });

  it('sets multiple letters ON in a single operation', async () => {
    const profile = await createTestProfile(db, userId);

    const result = await bulkToggleLetters(db, userId, {
      profileId: profile.id,
      letterIds: ['alif', 'ba', 'ta'],
      isVisible: true,
    });

    expect(result.updatedCount).toBe(3);

    // Verify all three are ON
    for (const letterId of ['alif', 'ba', 'ta']) {
      const toggle = await getToggle(db, profile.id, letterId);
      expect(toggle?.isVisible).toBe(true);
    }
  });

  it('sets multiple letters OFF in a single operation', async () => {
    const profile = await createTestProfile(db, userId);

    // First toggle some ON
    await bulkToggleLetters(db, userId, {
      profileId: profile.id,
      letterIds: ['alif', 'ba', 'ta'],
      isVisible: true,
    });

    // Then toggle them all OFF
    const result = await bulkToggleLetters(db, userId, {
      profileId: profile.id,
      letterIds: ['alif', 'ba', 'ta'],
      isVisible: false,
    });

    expect(result.updatedCount).toBe(3);

    // Verify all three are OFF
    for (const letterId of ['alif', 'ba', 'ta']) {
      const toggle = await getToggle(db, profile.id, letterId);
      expect(toggle?.isVisible).toBe(false);
    }
  });

  it('rejects bulk toggle for a non-owned profile', async () => {
    const profile = await createTestProfile(db, OTHER_USER);

    await expect(
      bulkToggleLetters(db, userId, {
        profileId: profile.id,
        letterIds: ['alif', 'ba'],
        isVisible: true,
      }),
    ).rejects.toThrow('Profile not found or does not belong to you.');
  });
});
