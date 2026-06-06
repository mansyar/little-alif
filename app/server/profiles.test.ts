import { describe, expect, it, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { profiles, letterToggles } from '~/db/schema';
import { LETTER_IDS } from '~/lib/constants/letters';
import * as authSchema from '~/db/auth-schema';
import type { DbClient } from '~/db';
import {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  getActiveProfile,
  listProfilesForSwitch,
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
    ).rejects.toMatchObject({ code: 'LIMIT_EXCEEDED', userMessage: 'ERROR_LIMIT_EXCEEDED' });
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
    ).rejects.toMatchObject({ code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' });
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

    await expect(deleteProfile(db, 'non-owner-del', profile.id)).rejects.toMatchObject(
      { code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' },
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

    await expect(getActiveProfile(db, 'someone-else', profile.id)).rejects.toMatchObject(
      { code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' },
    );
  });

  it('throws when the profile id does not exist', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    await expect(getActiveProfile(db, userId, fakeId)).rejects.toMatchObject(
      { code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' },
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

// ─── listProfilesForSwitch (T-13) ──────────────────────────────────────

describe('listProfilesForSwitch (pure helper)', () => {
  const userId = 'switch-test-user';

  beforeEach(async () => {
    await db.delete(profiles).where(eq(profiles.userId, userId));
  });

  it('returns an empty array when the user has no profiles', async () => {
    const result = await listProfilesForSwitch(db, userId);
    expect(result).toEqual([]);
  });

  it('returns { id, name, avatar } for each profile, no PII', async () => {
    const p1 = await createProfile(db, userId, { name: 'Aisyah', avatar: 'alif-lamp' });
    const p2 = await createProfile(db, userId, { name: 'Bilal', avatar: 'ba-boat' });

    const result = await listProfilesForSwitch(db, userId);

    expect(result).toHaveLength(2);
    for (const r of result) {
      // Public-safe shape: only id, name, avatar
      expect(Object.keys(r).sort()).toEqual(['avatar', 'id', 'name']);
      expect(r).not.toHaveProperty('userId');
      expect(r).not.toHaveProperty('vowelMode');
      expect(r).not.toHaveProperty('createdAt');
      expect(r).not.toHaveProperty('updatedAt');
    }
    expect(result).toEqual(
      expect.arrayContaining([
        { id: p1.id, name: 'Aisyah', avatar: 'alif-lamp' },
        { id: p2.id, name: 'Bilal', avatar: 'ba-boat' },
      ]),
    );
  });

  it("returns only the calling user's profiles", async () => {
    const otherUserId = 'switch-other-user';
    await db.delete(profiles).where(eq(profiles.userId, otherUserId));

    await createProfile(db, userId, { name: 'Mine', avatar: 'alif-lamp' });
    await createProfile(db, otherUserId, { name: 'Theirs', avatar: 'ba-boat' });

    const result = await listProfilesForSwitch(db, userId);
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Mine');
  });
});

// ─── Server Function Wrapper Tests ─────────────────────────────────────

describe('listProfilesFn', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws for child session (parent required)', async () => {
    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: () => Promise<unknown>) => fn),
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
            user: { id: 'parent-1', email: '', isChild: true, childProfileId: 'child-1' },
            session: { token: '' },
          }),
        },
      }),
    }));

    const { listProfilesFn } = await import('./profiles');
    await expect(
      (listProfilesFn as unknown as () => Promise<unknown>)(),
    ).rejects.toMatchObject({ code: 'AUTH', userMessage: 'ERROR_AUTH' });
  });

  it('delegates to listProfiles for valid parent session', async () => {
    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: () => Promise<unknown>) => fn),
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
            user: { id: 'list-profiles-parent', email: 'p@test.com', name: 'Parent' },
            session: { token: 'abc' },
          }),
        },
      }),
    }));
    vi.doMock('~/db', () => ({ getDb: () => db }));

    const { listProfilesFn } = await import('./profiles');
    const result = await (listProfilesFn as unknown as () => Promise<unknown>)();
    expect(result).toEqual([]);
  });
});

describe('createProfileFn', () => {
  const wrapperUserId = 'wrapper-create-profile';

  beforeEach(async () => {
    vi.resetModules();
    await db.delete(profiles).where(eq(profiles.userId, wrapperUserId));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws for unauthenticated session (null)', async () => {
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

    const { createProfileFn } = await import('./profiles');
    await expect(
      (createProfileFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { name: 'Test', avatar: 'ba-boat' },
      }),
    ).rejects.toMatchObject({ code: 'AUTH', userMessage: 'ERROR_AUTH' });
  });

  it('throws for child session (parent required)', async () => {
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
            user: { id: 'parent-1', email: '', isChild: true, childProfileId: 'child-1' },
            session: { token: '' },
          }),
        },
      }),
    }));

    const { createProfileFn } = await import('./profiles');
    await expect(
      (createProfileFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { name: 'Test', avatar: 'ba-boat' },
      }),
    ).rejects.toMatchObject({ code: 'AUTH', userMessage: 'ERROR_AUTH' });
  });
});

describe('updateProfileFn', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws for unauthenticated session (null)', async () => {
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

    const { updateProfileFn } = await import('./profiles');
    await expect(
      (updateProfileFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { profileId: '00000000-0000-0000-0000-000000000001', name: 'NewName' },
      }),
    ).rejects.toMatchObject({ code: 'AUTH', userMessage: 'ERROR_AUTH' });
  });

  it('throws for child session (parent required)', async () => {
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
            user: { id: 'parent-1', email: '', isChild: true, childProfileId: 'child-1' },
            session: { token: '' },
          }),
        },
      }),
    }));

    const { updateProfileFn } = await import('./profiles');
    await expect(
      (updateProfileFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { profileId: '00000000-0000-0000-0000-000000000001', name: 'NewName' },
      }),
    ).rejects.toMatchObject({ code: 'AUTH', userMessage: 'ERROR_AUTH' });
  });
});

describe('deleteProfileFn', () => {
  const wrapperUserId = 'wrapper-delete-profile';

  beforeEach(async () => {
    vi.resetModules();
    await db.delete(profiles).where(eq(profiles.userId, wrapperUserId));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws for unauthenticated session (null)', async () => {
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

    const { deleteProfileFn } = await import('./profiles');
    await expect(
      (deleteProfileFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { profileId: '00000000-0000-0000-0000-000000000002' },
      }),
    ).rejects.toMatchObject({ code: 'AUTH', userMessage: 'ERROR_AUTH' });
  });

  it('clears child-mode cookie when deleted profile matches cookie', async () => {
    const [profile] = await db
      .insert(profiles)
      .values({
        userId: wrapperUserId,
        name: 'CookieChild',
        avatar: 'ba-boat',
      })
      .returning();

    const mockSetCookie = vi.fn();

    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: (args: { data: unknown }) => Promise<unknown>) => fn),
      })),
    }));
    vi.doMock('@tanstack/react-start/server', () => ({
      getRequest: () => ({ headers: new Headers() }),
      getCookie: vi.fn((name: string) => {
        if (name === 'better-auth.session_token') return 'test-token';
        if (name === 'child_mode') return 'signed-cookie';
        return undefined;
      }),
      setCookie: mockSetCookie,
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          getSession: vi.fn().mockResolvedValue({
            user: { id: wrapperUserId, email: 'p@test.com', name: 'Parent' },
            session: { token: 'abc' },
          }),
        },
      }),
    }));
    vi.doMock('~/db', () => ({ getDb: () => db }));
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn().mockReturnValue({ profileId: profile!.id }),
    }));

    const { deleteProfileFn } = await import('./profiles');
    const result = await (
      deleteProfileFn as unknown as (input: { data: unknown }) => Promise<unknown>
    )({ data: { profileId: profile!.id } });

    expect(result).toEqual({ success: true });
    expect(mockSetCookie).toHaveBeenCalledWith('child_mode', '', { maxAge: 0, path: '/' });
  });
});

describe('getActiveProfileFn', () => {
  beforeEach(() => {
    vi.resetModules();
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

    const { getActiveProfileFn } = await import('./profiles');
    await expect(
      (getActiveProfileFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { profileId: '00000000-0000-0000-0000-000000000003' },
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
            user: { id: 'active-parent', email: 'p@test.com', name: 'Parent' },
            session: { token: 'abc' },
          }),
        },
      }),
    }));
    vi.doMock('~/db', () => ({ getDb: () => db }));

    const { getActiveProfileFn } = await import('./profiles');
    const profileId = '00000000-0000-0000-0000-000000000003';
    // Parent session allows any profileId via authorizeChildAccess; the DB
    // won't have this profile so it throws "not found" — that's fine, it
    // means we passed the auth guard.
    await expect(
      (getActiveProfileFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { profileId },
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', userMessage: 'ERROR_NOT_FOUND' });
  });
});

describe('listProfilesForSwitchFn', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws for child session (parent required)', async () => {
    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: () => Promise<unknown>) => fn),
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
            user: { id: 'parent-1', email: '', isChild: true, childProfileId: 'child-1' },
            session: { token: '' },
          }),
        },
      }),
    }));

    const { listProfilesForSwitchFn } = await import('./profiles');
    await expect(
      (listProfilesForSwitchFn as unknown as () => Promise<unknown>)(),
    ).rejects.toMatchObject({ code: 'AUTH', userMessage: 'ERROR_AUTH' });
  });
});
