import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { profiles, letterToggles, LETTER_IDS } from '~/db/schema';
import * as authSchema from '~/db/auth-schema';
import type { DbClient } from '~/db';
import {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getActiveProfile,
} from './profiles';
import { getActiveProfileSchema } from '~/lib/validations/profiles';

// ─── Setup ────────────────────────────────────────────────────────────

let db: DbClient;
let rawClient: ReturnType<typeof createClient>;

/**
 * Apply schema DDL to the in-memory DB so Drizzle queries work.
 * We use raw SQL for tables because running the actual migration
 * files would require a file-system-based DB.
 */
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
    const letterId = LETTER_IDS[i] as string;
    await rawClient.execute({
      sql: `INSERT INTO letters (id, character, display_order, audio_files) VALUES (?, ?, ?, ?)`,
      args: [letterId, String.fromCharCode(0x0627 + i), i + 1, '{}'],
    });
  }
}

beforeAll(async () => {
  rawClient = createClient({ url: ':memory:' });
  db = drizzle(rawClient, {
    schema: { ...authSchema, profiles, letterToggles },
  }) as unknown as DbClient;

  // Manually apply DDL because drizzle-kit push needs a filesystem path
  await applyDdl();

  await seedLetters();
});

afterAll(() => {
  // in-memory DB is discarded automatically
});

// ─── Tests ────────────────────────────────────────────────────────────

const TEST_USER = 'test-user-id-001';
const OTHER_USER = 'other-user-id-002';

describe('listProfiles', () => {
  it('returns an empty array when the user has no profiles', async () => {
    const result = await listProfiles(db, 'non-existent-user');
    expect(result).toEqual([]);
  });

  it('returns profiles for the matching userId only', async () => {
    const [p1] = await db
      .insert(profiles)
      .values({
        userId: TEST_USER,
        name: 'ChildA',
        avatar: 'ba-boat',
      })
      .returning();

    await db
      .insert(profiles)
      .values({
        userId: OTHER_USER,
        name: 'ChildB',
        avatar: 'alif-lamp',
      })
      .returning();

    // Seed one visible toggle for ChildA
    await db.insert(letterToggles).values({
      profileId: p1!.id,
      letterId: 'alif',
      isVisible: true,
    });

    const result = await listProfiles(db, TEST_USER);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('ChildA');
  });
});

describe('createProfile', () => {
  const userId = 'create-test-user';

  // Clean up profiles for this user before each test in this group
  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, userId));
  });

  it('creates a profile and seeds 28 letter_toggles', async () => {
    const profile = await createProfile(db, userId, {
      name: 'Aisyah',
      avatar: 'alif-lamp',
    });

    expect(profile.name).toBe('Aisyah');
    expect(profile.avatar).toBe('alif-lamp');
    expect(profile.vowelMode).toBe('fathah');

    // Count toggles for this profile
    const toggles = await db
      .select()
      .from(letterToggles)
      .where(eq(letterToggles.profileId, profile.id))
      .all();
    expect(toggles).toHaveLength(28);
  });

  it('enforces max 4 profiles per user', async () => {
    // Create 4 profiles
    for (let i = 0; i < 4; i++) {
      await createProfile(db, userId, {
        name: `Child${i}`,
        avatar: 'ba-boat',
      });
    }

    // 5th should fail
    await expect(
      createProfile(db, userId, {
        name: 'TooMany',
        avatar: 'ba-boat',
      }),
    ).rejects.toThrow('Maximum of 4 child profiles reached.');
  });

  it('defaults vowelMode to fathah', async () => {
    const profile = await createProfile(db, userId, {
      name: 'VowelChild',
      avatar: 'dal-book',
    });
    expect(profile.vowelMode).toBe('fathah');
  });
});

describe('updateProfile', () => {
  const userId = 'update-test-user';

  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, userId));
  });

  it('updates the profile name and preserves other fields', async () => {
    const profile = await createProfile(db, userId, {
      name: 'Original',
      avatar: 'ta-table',
    });

    const updated = (await updateProfile(db, userId, {
      profileId: profile.id,
      name: 'UpdatedName',
    }))!;

    expect(updated.name).toBe('UpdatedName');
    expect(updated.avatar).toBe('ta-table');
  });

  it('updates vowelMode', async () => {
    const profile = await createProfile(db, userId, {
      name: 'VowelChange',
      avatar: 'ba-boat',
    });

    const updated = (await updateProfile(db, userId, {
      profileId: profile.id,
      vowelMode: 'kasrah',
    }))!;

    expect(updated.vowelMode).toBe('kasrah');
  });

  it('throws when updating a non-owned profile', async () => {
    const profile = await createProfile(db, userId, {
      name: 'Owned',
      avatar: 'ba-boat',
    });

    await expect(
      updateProfile(db, 'non-owner', {
        profileId: profile.id,
        name: 'Hacked',
      }),
    ).rejects.toThrow('Profile not found or does not belong to you.');
  });
});

describe('deleteProfile', () => {
  const userId = 'delete-test-user';

  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, userId));
  });

  it('deletes a profile', async () => {
    const profile = await createProfile(db, userId, {
      name: 'ToDelete',
      avatar: 'ha-jar',
    });

    const result = await deleteProfile(db, userId, profile.id);
    expect(result.success).toBe(true);

    // Verify profile is gone
    const found = await db.select().from(profiles).where(eq(profiles.id, profile.id)).all();
    expect(found).toHaveLength(0);
  });

  it('cascades deletion to letter_toggles', async () => {
    const profile = await createProfile(db, userId, {
      name: 'CascadeTest',
      avatar: 'kho-hat',
    });

    // Confirm toggles exist
    const togglesBefore = await db
      .select()
      .from(letterToggles)
      .where(eq(letterToggles.profileId, profile.id))
      .all();
    expect(togglesBefore).toHaveLength(28);

    await deleteProfile(db, userId, profile.id);

    // Cascade should have removed them
    const togglesAfter = await db
      .select()
      .from(letterToggles)
      .where(eq(letterToggles.profileId, profile.id))
      .all();
    expect(togglesAfter).toHaveLength(0);
  });

  it('throws when deleting a non-owned profile', async () => {
    const profile = await createProfile(db, userId, {
      name: 'OwnedDel',
      avatar: 'ba-boat',
    });

    await expect(deleteProfile(db, 'non-owner-del', profile.id)).rejects.toThrow(
      'Profile not found or does not belong to you.',
    );
  });
});

// ─── getActiveProfile (T-08) ───────────────────────────────────────────

describe('getActiveProfile (pure helper)', () => {
  const userId = 'active-profile-test-user';

  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, userId));
  });

  it('returns { id, name, avatar, vowelMode } for an owned profile', async () => {
    const profile = await createProfile(db, userId, {
      name: 'Aisyah',
      avatar: 'alif-lamp',
    });

    const result = await getActiveProfile(db, userId, profile.id);

    expect(result).toEqual({
      id: profile.id,
      name: 'Aisyah',
      avatar: 'alif-lamp',
      vowelMode: 'fathah',
    });
  });

  it('throws when the profile is owned by a different user', async () => {
    const profile = await createProfile(db, userId, {
      name: 'OwnedByUser',
      avatar: 'ba-boat',
    });

    await expect(getActiveProfile(db, 'someone-else', profile.id)).rejects.toThrow(
      'Profile not found or does not belong to you.',
    );
  });

  it('throws when the profile id does not exist', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    await expect(getActiveProfile(db, userId, fakeId)).rejects.toThrow(
      'Profile not found or does not belong to you.',
    );
  });

  it('returns the updated vowelMode when set via updateProfile', async () => {
    const profile = await createProfile(db, userId, {
      name: 'VowelChange',
      avatar: 'dal-book',
    });
    await updateProfile(db, userId, { profileId: profile.id, vowelMode: 'kasrah' });

    const result = await getActiveProfile(db, userId, profile.id);
    expect(result.vowelMode).toBe('kasrah');
  });
});

describe('getActiveProfileSchema', () => {
  it('accepts a valid uuid', () => {
    const parsed = getActiveProfileSchema.parse({
      profileId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(parsed.profileId).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('rejects a malformed profileId', () => {
    expect(() => getActiveProfileSchema.parse({ profileId: 'not-a-uuid' })).toThrow();
  });

  it('rejects a missing profileId', () => {
    expect(() => getActiveProfileSchema.parse({})).toThrow();
  });
});

// Note: the `getActiveProfileFn` server function wrapper itself is not
// unit-tested here — like the other profile server functions in this file
// (createProfileFn, updateProfileFn, deleteProfileFn), it is a thin
// createServerFn wrapper that delegates to the pure helper and would
// require the TanStack Start server runtime context to invoke directly.
