import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { profiles, letterToggles, LETTER_IDS } from '~/db/schema';
import * as authSchema from '~/db/auth-schema';
import type { DbClient } from '~/db';
import { enableChildMode, buildChildSession } from './auth-fns';
import { signChildModeCookie } from '~/lib/utils/child-mode.server';

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
    const letterId = LETTER_IDS[i] as string;
    await rawClient.execute({
      sql: `INSERT INTO letters (id, character, display_order, audio_files) VALUES (?, ?, ?, ?)`,
      args: [letterId, String.fromCharCode(0x0627 + i), i + 1, '{}'],
    });
  }
}

beforeAll(async () => {
  process.env.CHILD_MODE_SECRET = 'test-secret-for-buildchildsession-tests';

  rawClient = createClient({ url: ':memory:' });
  db = drizzle(rawClient, {
    schema: { ...authSchema, profiles, letterToggles },
  }) as unknown as DbClient;

  await applyDdl();
  await seedLetters();
});

afterAll(() => {
  // in-memory DB is discarded automatically
});

// ─── Tests ────────────────────────────────────────────────────────────

const USER_ID = 'child-mode-test-user';
const OTHER_USER = 'other-user';

describe('enableChildMode (pure helper)', () => {
  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, USER_ID));
    await db.delete(profiles).where(eq(profiles.userId, OTHER_USER));
  });

  it('returns profile data for an owned profile', async () => {
    const [profile] = await db
      .insert(profiles)
      .values({
        userId: USER_ID,
        name: 'Aisyah',
        avatar: 'alif-lamp',
      })
      .returning();

    const result = await enableChildMode(db, USER_ID, profile!.id);
    expect(result).toEqual({ name: 'Aisyah', avatar: 'alif-lamp' });
  });

  it('throws when the profile belongs to a different user', async () => {
    const [profile] = await db
      .insert(profiles)
      .values({
        userId: OTHER_USER,
        name: 'Budi',
        avatar: 'ba-boat',
      })
      .returning();

    await expect(enableChildMode(db, USER_ID, profile!.id)).rejects.toThrow(
      'Profile not found or does not belong to you.',
    );
  });

  it('throws when the profile does not exist', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    await expect(enableChildMode(db, USER_ID, fakeId)).rejects.toThrow(
      'Profile not found or does not belong to you.',
    );
  });
});

describe('buildChildSession (pure helper)', () => {
  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, USER_ID));
    await db.delete(profiles).where(eq(profiles.userId, OTHER_USER));
  });

  it('returns a child session for a valid cookie with an existing profile', async () => {
    const [profile] = await db
      .insert(profiles)
      .values({
        userId: USER_ID,
        name: 'Aisyah',
        avatar: 'alif-lamp',
      })
      .returning();

    const cookie = signChildModeCookie(profile!.id, 'Aisyah', 'alif-lamp');
    const session = await buildChildSession(db, cookie);

    expect(session).not.toBeNull();
    expect(session!.user).toEqual({
      id: USER_ID,
      email: '',
      isChild: true,
      childProfileId: profile!.id,
    });
    expect(session!.session.userId).toBe(USER_ID);
    expect(session!.session.token).toBe('');
    expect(session!.session.expiresAt).toBeDefined();
  });

  it('returns null when the cookie profile has been deleted', async () => {
    const [profile] = await db
      .insert(profiles)
      .values({
        userId: USER_ID,
        name: 'Budi',
        avatar: 'ba-boat',
      })
      .returning();

    const cookie = signChildModeCookie(profile!.id, 'Budi', 'ba-boat');

    // Delete the profile
    await db.delete(profiles).where(eq(profiles.id, profile!.id));

    const session = await buildChildSession(db, cookie);
    expect(session).toBeNull();
  });

  it('returns null for an invalid/tampered cookie value', async () => {
    const tampered = 'eyJmb28iOiJiYXJ9.someinvalid';
    const session = await buildChildSession(db, tampered);
    expect(session).toBeNull();
  });

  it('returns null for an empty cookie value', async () => {
    const session = await buildChildSession(db, '');
    expect(session).toBeNull();
  });
});

// Note: disableChildModeFn is a thin server function wrapper that takes no
// input params and delegates cookie deletion to setCookie(). Per the project
// convention, createServerFn wrappers are not unit-tested in isolation as
// they require the TanStack Start server runtime context.
