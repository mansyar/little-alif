import { describe, expect, it, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { profiles, letters, letterToggles } from '~/db/schema';
import { LETTER_IDS } from '~/lib/constants/letters';
import * as authSchema from '~/db/auth-schema';
import type { DbClient } from '~/db';

// ─── In-memory DB Setup ───────────────────────────────────────────────

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

async function createTestProfile(
  dbClient: DbClient,
  userId: string,
  name = 'ReadingChild',
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

// ─── Tests ────────────────────────────────────────────────────────────

const WRAPPER_USER = 'reading-wrapper-user';

describe('getReadingDataFn', () => {
  beforeEach(async () => {
    vi.resetModules();
    await db.delete(profiles).where(eq(profiles.userId, WRAPPER_USER));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws for null session (unauthenticated)', async () => {
    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: (args: { data: unknown }) => Promise<unknown>) => fn),
      })),
    }));
    vi.doMock('@tanstack/react-start/server', () => ({
      getRequest: () => ({ headers: new Headers() }),
      getCookie: vi.fn(),
      setCookie: vi.fn(),
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: { getSession: vi.fn().mockResolvedValue(null) },
      }),
    }));

    const { getReadingDataFn } = await import('./reading');
    await expect(
      (getReadingDataFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { profileId: '00000000-0000-0000-0000-000000000001' },
      }),
    ).rejects.toMatchObject({ code: 'AUTH', userMessage: 'ERROR_AUTH' });
  });

  it('calls authorizeChildAccess with correct profileId for parent session', async () => {
    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: (args: { data: unknown }) => Promise<unknown>) => fn),
      })),
    }));
    vi.doMock('@tanstack/react-start/server', () => ({
      getRequest: () => ({ headers: new Headers() }),
      getCookie: vi.fn((name: string) =>
        name === 'better-auth.session_token' ? 'test-token' : undefined,
      ),
      setCookie: vi.fn(),
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          getSession: vi.fn().mockResolvedValue({
            user: { id: 'reading-parent', email: 'p@test.com', name: 'Parent' },
            session: { token: 'abc' },
          }),
        },
      }),
    }));
    vi.doMock('~/db', () => ({ getDb: () => db }));

    const { getReadingDataFn } = await import('./reading');
    const profileId = '00000000-0000-0000-0000-000000000001';
    // Parent session passes authorizeChildAccess; the DB won't have
    // this profile so it throws "not found" — confirms auth guard passed.
    await expect(
      (getReadingDataFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { profileId },
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' });
  });

  it('delegates to getReadingData with correct userId and profileId', async () => {
    const profile = await createTestProfile(db, WRAPPER_USER);

    // Toggle 2 letters ON
    await db
      .update(letterToggles)
      .set({ isVisible: true })
      .where(eq(letterToggles.letterId, 'alif'));
    await db
      .update(letterToggles)
      .set({ isVisible: true })
      .where(eq(letterToggles.letterId, 'ba'));

    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: (args: { data: unknown }) => Promise<unknown>) => fn),
      })),
    }));
    vi.doMock('@tanstack/react-start/server', () => ({
      getRequest: () => ({ headers: new Headers() }),
      getCookie: vi.fn((name: string) =>
        name === 'better-auth.session_token' ? 'test-token' : undefined,
      ),
      setCookie: vi.fn(),
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          getSession: vi.fn().mockResolvedValue({
            user: { id: WRAPPER_USER, email: 'p@test.com', name: 'Parent' },
            session: { token: 'abc' },
          }),
        },
      }),
    }));
    vi.doMock('~/db', () => ({ getDb: () => db }));

    const { getReadingDataFn } = await import('./reading');
    const result = await (
      getReadingDataFn as unknown as (input: { data: unknown }) => Promise<unknown>
    )({ data: { profileId: profile.id } });

    // Verify result shape from getReadingData
    expect(result).toHaveProperty('letters');
    expect(result).toHaveProperty('vowelMode');
    expect((result as { letters: unknown[] }).letters).toHaveLength(2);
    expect(result).toEqual({
      letters: [
        // eslint-disable-next-line typescript/no-unsafe-assignment
        { letterId: 'alif', character: expect.any(String) },
        // eslint-disable-next-line typescript/no-unsafe-assignment
        { letterId: 'ba', character: expect.any(String) },
      ],
      vowelMode: 'fathah',
    });
  });
});
