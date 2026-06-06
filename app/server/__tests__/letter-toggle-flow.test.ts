import { describe, expect, it, beforeAll, beforeEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { profiles, letters, letterToggles } from '~/db/schema';
import { LETTER_IDS } from '~/lib/constants/letters';
import * as authSchema from '~/db/auth-schema';
import type { DbClient } from '~/db';
import { createProfile, listProfiles } from '~/server/profiles';
import { getVisibleLetters, toggleLetter, bulkToggleLetters } from '~/server/letters';

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

  for (const ddlSql of ddl) {
    await rawClient.execute(ddlSql);
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
    schema: { ...authSchema, profiles, letters, letterToggles },
  }) as unknown as DbClient;

  await applyDdl();
  await seedLetters();
});

// ─── Helpers ───────────────────────────────────────────────────────────

async function countToggles(profileId: string, isVisible?: boolean) {
  if (isVisible === undefined) {
    const rows = await db
      .select()
      .from(letterToggles)
      .where(eq(letterToggles.profileId, profileId))
      .all();
    return rows.length;
  }
  // Use raw SQL to query integer is_visible column
  const rows = await rawClient.execute({
    sql: `SELECT COUNT(*) as cnt FROM letter_toggles WHERE profile_id = ? AND is_visible = ?`,
    args: [profileId, isVisible ? 1 : 0],
  });
  return Number(rows.rows[0]!.cnt);
}

// ─── Integration Tests ────────────────────────────────────────────────

const USER_A = 'integration-user-a';
const USER_B = 'integration-user-b';

describe('letter toggle integration flow', () => {
  beforeEach(async () => {
    // Clean up profiles created by our test users
    await db.delete(profiles).where(eq(profiles.userId, USER_A));
    await db.delete(profiles).where(eq(profiles.userId, USER_B));
  });

  it('creates profile with 28 letter_toggles (all OFF) → toggle ON → verify → toggle OFF → verify', async () => {
    // Step 1: Create profile (seeds 28 toggles, all OFF by default)
    const profile = await createProfile(db, USER_A, {
      name: 'IntegrationChild',
      avatar: 'ba-boat',
    });

    // Step 2: Verify all 28 toggles exist and are OFF
    const togglesOff = await countToggles(profile.id, false);
    expect(togglesOff).toBe(28);
    const togglesOn = await countToggles(profile.id, true);
    expect(togglesOn).toBe(0);

    // Step 3: Toggle 'alif' ON
    await toggleLetter(db, USER_A, {
      profileId: profile.id,
      letterId: 'alif',
      isVisible: true,
    });

    // Step 4: Verify 'alif' is now ON
    const visibleLetters = await getVisibleLetters(db, USER_A, profile.id);
    const alif = visibleLetters.find((l) => l.letterId === 'alif');
    expect(alif?.isVisible).toBe(true);

    // Verify only 1 is ON, 27 are OFF
    const togglesOnAfter = await countToggles(profile.id, true);
    expect(togglesOnAfter).toBe(1);

    // Step 5: Toggle 'alif' back OFF
    await toggleLetter(db, USER_A, {
      profileId: profile.id,
      letterId: 'alif',
      isVisible: false,
    });

    // Step 6: Verify 'alif' is back OFF
    const visibleLettersReverted = await getVisibleLetters(db, USER_A, profile.id);
    const alifReverted = visibleLettersReverted.find((l) => l.letterId === 'alif');
    expect(alifReverted?.isVisible).toBe(false);

    const togglesOnFinal = await countToggles(profile.id, true);
    expect(togglesOnFinal).toBe(0);
  });

  it('bulk toggles all 28 letters ON → verify all ON → bulk toggle OFF → verify all OFF', async () => {
    const profile = await createProfile(db, USER_A, {
      name: 'BulkChild',
      avatar: 'ba-boat',
    });

    // Step 1: Bulk toggle all 28 ON
    await bulkToggleLetters(db, USER_A, {
      profileId: profile.id,
      letterIds: [...LETTER_IDS],
      isVisible: true,
    });

    // Step 2: Verify all 28 are ON
    const togglesAllOn = await countToggles(profile.id, true);
    expect(togglesAllOn).toBe(28);
    const togglesAllOff = await countToggles(profile.id, false);
    expect(togglesAllOff).toBe(0);

    // Also verify via getVisibleLetters
    const visibleOn = await getVisibleLetters(db, USER_A, profile.id);
    expect(visibleOn).toHaveLength(28);
    for (const letter of visibleOn) {
      expect(letter.isVisible).toBe(true);
    }

    // Step 3: Bulk toggle all 28 OFF
    await bulkToggleLetters(db, USER_A, {
      profileId: profile.id,
      letterIds: [...LETTER_IDS],
      isVisible: false,
    });

    // Step 4: Verify all 28 are OFF
    const togglesFinalOn = await countToggles(profile.id, true);
    expect(togglesFinalOn).toBe(0);
    const togglesFinalOff = await countToggles(profile.id, false);
    expect(togglesFinalOff).toBe(28);

    const visibleOff = await getVisibleLetters(db, USER_A, profile.id);
    for (const letter of visibleOff) {
      expect(letter.isVisible).toBe(false);
    }
  });

  it('listProfiles returns correct introducedCount after individual and bulk toggles', async () => {
    const profile = await createProfile(db, USER_A, {
      name: 'CountChild',
      avatar: 'ba-boat',
    });

    // Initially 0 introduced
    let profilesList = await listProfiles(db, USER_A);
    const entry = profilesList.find((p) => p.id === profile.id);
    expect(entry?.introducedCount).toBe(0);

    // Toggle one letter ON
    await toggleLetter(db, USER_A, {
      profileId: profile.id,
      letterId: 'alif',
      isVisible: true,
    });

    profilesList = await listProfiles(db, USER_A);
    expect(profilesList.find((p) => p.id === profile.id)?.introducedCount).toBe(1);

    // Bulk toggle all 28 ON
    await bulkToggleLetters(db, USER_A, {
      profileId: profile.id,
      letterIds: [...LETTER_IDS],
      isVisible: true,
    });

    profilesList = await listProfiles(db, USER_A);
    expect(profilesList.find((p) => p.id === profile.id)?.introducedCount).toBe(28);

    // Bulk toggle all 28 OFF
    await bulkToggleLetters(db, USER_A, {
      profileId: profile.id,
      letterIds: [...LETTER_IDS],
      isVisible: false,
    });

    profilesList = await listProfiles(db, USER_A);
    expect(profilesList.find((p) => p.id === profile.id)?.introducedCount).toBe(0);
  });

  it('rejects toggling on another users profile (cross-user isolation)', async () => {
    // User A creates a profile
    const profile = await createProfile(db, USER_A, {
      name: 'UserAChild',
      avatar: 'ba-boat',
    });

    // User B cannot toggle User A's profile
    await expect(
      toggleLetter(db, USER_B, {
        profileId: profile.id,
        letterId: 'ba',
        isVisible: true,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' });

    // User B cannot bulk toggle User A's profile
    await expect(
      bulkToggleLetters(db, USER_B, {
        profileId: profile.id,
        letterIds: ['alif', 'ba'],
        isVisible: true,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' });

    // User B cannot view User A's letters
    await expect(getVisibleLetters(db, USER_B, profile.id)).rejects.toMatchObject(
      { code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' },
    );
  });
});
