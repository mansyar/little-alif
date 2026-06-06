import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { APIError } from 'better-auth';
import { deriveNameFromEmail, buildCookieHeader } from './auth-fns';

const authMocks = vi.hoisted(() => ({
  fakeDb: { __fakeDb: true },
  betterAuthResult: { __mockAuth: true, handler: vi.fn() },
}));

vi.mock('~/db', () => ({
  getDb: () => authMocks.fakeDb,
  schema: {},
  authSchema: {},
  fullSchema: {},
}));

vi.mock('better-auth', async () => {
  const actual = await vi.importActual<typeof import('better-auth')>('better-auth');
  return {
    betterAuth: vi.fn(() => authMocks.betterAuthResult),
    APIError: actual.APIError,
  };
});

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: vi.fn(() => ({ __adapter: true })),
}));

vi.mock('better-auth/tanstack-start', () => ({
  tanstackStartCookies: vi.fn(() => ({ __plugin: true })),
}));

describe('deriveNameFromEmail', () => {
  it('returns the local-part of a standard email', () => {
    expect(deriveNameFromEmail('parent@example.com')).toBe('parent');
  });

  it('returns the local-part when it contains dots', () => {
    expect(deriveNameFromEmail('first.last@example.com')).toBe('first.last');
  });

  it('returns the local-part when it contains plus tags', () => {
    expect(deriveNameFromEmail('parent+school@example.com')).toBe('parent+school');
  });

  it('falls back to "Parent" when the email has no local-part', () => {
    expect(deriveNameFromEmail('@example.com')).toBe('Parent');
  });
});

describe('buildCookieHeader', () => {
  it('formats a single cookie header value', () => {
    expect(buildCookieHeader('abc.def')).toBe('better-auth.session_token=abc.def');
  });

  it('preserves tokens containing dots, dashes, and underscores', () => {
    expect(buildCookieHeader('a.b-c_d')).toBe('better-auth.session_token=a.b-c_d');
  });
});

describe('APIError → Error transformation (mirrors registerFn/loginFn catch)', () => {
  function translate(err: unknown): unknown {
    if (err instanceof APIError) {
      return new Error(err.message);
    }
    return err;
  }

  it('wraps APIError in a plain Error with the original message', () => {
    const apiErr = new APIError('BAD_REQUEST', { message: 'Email taken' });
    const out = translate(apiErr);
    expect(out).toBeInstanceOf(Error);
    expect((out as Error).message).toBe('Email taken');
  });

  it('preserves non-APIError exceptions', () => {
    const boom = new Error('network down');
    expect(translate(boom)).toBe(boom);
  });

  it('preserves unknown values unchanged', () => {
    const value = { weird: 'thing' };
    expect(translate(value)).toBe(value);
  });
});

describe('server module smoke', () => {
  it('getAuth is exported and callable', async () => {
    const mod = await import('./auth');
    expect(typeof mod.getAuth).toBe('function');
  });

  it('vi is wired in correctly (sanity)', () => {
    const spy = vi.fn();
    spy('ok');
    expect(spy).toHaveBeenCalledWith('ok');
  });
});

describe('getAuth singleton', () => {
  it('returns a stable auth instance across calls', async () => {
    const { getAuth } = await import('./auth');
    const a = getAuth();
    const b = getAuth();
    expect(a).toBe(b);
    expect(a).toBeDefined();
  });
});

describe('requireParentSession', () => {
  it('throws "Unauthenticated." when session is null', async () => {
    const { requireParentSession } = await import('./auth-fns');
    expect(() => requireParentSession(null)).toThrow('Unauthenticated.');
  });

  it('throws "Parent session required." when session is a child session', async () => {
    const { requireParentSession } = await import('./auth-fns');
    const childSession = {
      user: { id: 'parent-1', email: '', isChild: true, childProfileId: 'child-1' },
      session: { token: '' },
    };
    expect(() => requireParentSession(childSession)).toThrow(
      'Unauthorized. Parent session required.',
    );
  });

  it('passes (no throw) for a valid parent JWT session', async () => {
    const { requireParentSession } = await import('./auth-fns');
    const parentSession = {
      user: { id: 'parent-1', email: 'parent@example.com', name: 'Parent' },
      session: { token: 'abc' },
    };
    expect(() => requireParentSession(parentSession)).not.toThrow();
  });
});

describe('authorizeChildAccess', () => {
  it('passes when child session profileId matches', async () => {
    const { authorizeChildAccess } = await import('./auth-fns');
    const childSession = {
      user: { id: 'parent-1', isChild: true, childProfileId: 'child-1' },
    };
    expect(() => authorizeChildAccess(childSession, 'child-1')).not.toThrow();
  });

  it('throws "Unauthorized." when child session profileId mismatches', async () => {
    const { authorizeChildAccess } = await import('./auth-fns');
    const childSession = {
      user: { id: 'parent-1', isChild: true, childProfileId: 'child-1' },
    };
    expect(() => authorizeChildAccess(childSession, 'child-2')).toThrow('Unauthorized.');
  });

  it('passes (no-op) for a parent session', async () => {
    const { authorizeChildAccess } = await import('./auth-fns');
    const parentSession = {
      user: { id: 'parent-1', email: 'parent@example.com' },
    };
    expect(() => authorizeChildAccess(parentSession, 'any-id')).not.toThrow();
  });
});

// ─── buildChildSession ──────────────────────────────────────────────────

describe('buildChildSession', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when cookie verification fails (invalid/tampered cookie)', async () => {
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn().mockReturnValue(null),
    }));

    const { buildChildSession } = await import('./auth-fns');
    const mockDb = { select: vi.fn() } as never;
    const result = await buildChildSession(mockDb, 'tampered-cookie');
    expect(result).toBeNull();
  });

  it('returns null when profile not found in DB', async () => {
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn().mockReturnValue({ profileId: 'profile-1' }),
    }));

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            then: vi.fn().mockResolvedValue(null),
          }),
        }),
      }),
    } as never;

    const { buildChildSession } = await import('./auth-fns');
    const result = await buildChildSession(mockDb, 'valid-cookie');
    expect(result).toBeNull();
  });

  it('returns session-like object with correct shape when valid', async () => {
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn().mockReturnValue({ profileId: 'profile-1' }),
    }));

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            then: vi.fn().mockResolvedValue({ userId: 'parent-1' }),
          }),
        }),
      }),
    } as never;

    const { buildChildSession } = await import('./auth-fns');
    const result = await buildChildSession(mockDb, 'valid-cookie');

    expect(result).not.toBeNull();
    expect(result!.user).toBeDefined();
    expect(result!.session).toBeDefined();
    expect(result!.user.id).toBe('parent-1');
    expect(result!.user.email).toBe('');
    expect(result!.user.isChild).toBe(true);
    expect(result!.user.childProfileId).toBe('profile-1');
    expect(result!.session.token).toBe('');
    expect(result!.session.userId).toBe('parent-1');
  });

  it('child session user has isChild: true and correct childProfileId', async () => {
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn().mockReturnValue({ profileId: 'child-abc' }),
    }));

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            then: vi.fn().mockResolvedValue({ userId: 'parent-xyz' }),
          }),
        }),
      }),
    } as never;

    const { buildChildSession } = await import('./auth-fns');
    const result = await buildChildSession(mockDb, 'valid-cookie');

    expect(result!.user.isChild).toBe(true);
    expect(result!.user.childProfileId).toBe('child-abc');
  });
});

// ─── registerFn error handling ──────────────────────────────────────────

describe('registerFn', () => {
  const mockSignUp = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    mockSignUp.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('APIError is caught and re-thrown as plain Error', async () => {
    const mockAuth = { api: { signUpEmail: mockSignUp } };
    vi.doMock('./auth', () => ({ getAuth: () => mockAuth }));
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

    mockSignUp.mockRejectedValueOnce(new APIError('BAD_REQUEST', { message: 'Email taken' }));

    const { registerFn } = await import('./auth-fns');
    await expect(
      (registerFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { email: 'test@example.com', password: 'password123' },
      }),
    ).rejects.toThrow('Email taken');
  });

  it('non-APIError exceptions pass through unchanged', async () => {
    const mockAuth = { api: { signUpEmail: mockSignUp } };
    vi.doMock('./auth', () => ({ getAuth: () => mockAuth }));
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

    const originalError = new Error('network timeout');
    mockSignUp.mockRejectedValueOnce(originalError);

    const { registerFn } = await import('./auth-fns');
    await expect(
      (registerFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { email: 'test@example.com', password: 'password123' },
      }),
    ).rejects.toBe(originalError);
  });

  it('delegates to auth.api.signUpEmail with correct parameters', async () => {
    const mockAuth = { api: { signUpEmail: mockSignUp } };
    vi.doMock('./auth', () => ({ getAuth: () => mockAuth }));
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

    mockSignUp.mockResolvedValueOnce({ response: { user: { id: 'u1' } } });

    const { registerFn } = await import('./auth-fns');
    await (registerFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
      data: { email: 'test@example.com', password: 'password123' },
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      body: { name: 'test', email: 'test@example.com', password: 'password123' },
      headers: expect.any(Headers),
      returnHeaders: true,
    });
  });
});

// ─── loginFn error handling ─────────────────────────────────────────────

describe('loginFn', () => {
  const mockSignIn = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    mockSignIn.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('APIError is caught and re-thrown as plain Error', async () => {
    const mockAuth = { api: { signInEmail: mockSignIn } };
    vi.doMock('./auth', () => ({ getAuth: () => mockAuth }));
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

    mockSignIn.mockRejectedValueOnce(
      new APIError('UNAUTHORIZED', { message: 'Invalid credentials' }),
    );

    const { loginFn } = await import('./auth-fns');
    await expect(
      (loginFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { email: 'test@example.com', password: 'wrong' },
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('non-APIError exceptions pass through unchanged', async () => {
    const mockAuth = { api: { signInEmail: mockSignIn } };
    vi.doMock('./auth', () => ({ getAuth: () => mockAuth }));
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

    const originalError = new Error('service unavailable');
    mockSignIn.mockRejectedValueOnce(originalError);

    const { loginFn } = await import('./auth-fns');
    await expect(
      (loginFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { email: 'test@example.com', password: 'password123' },
      }),
    ).rejects.toBe(originalError);
  });

  it('delegates to auth.api.signInEmail with correct parameters', async () => {
    const mockAuth = { api: { signInEmail: mockSignIn } };
    vi.doMock('./auth', () => ({ getAuth: () => mockAuth }));
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

    mockSignIn.mockResolvedValueOnce({ response: { user: { id: 'u1' } } });

    const { loginFn } = await import('./auth-fns');
    await (loginFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
      data: { email: 'test@example.com', password: 'password123' },
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      body: { email: 'test@example.com', password: 'password123' },
      headers: expect.any(Headers),
      returnHeaders: true,
    });
  });
});

// ─── enableChildMode ────────────────────────────────────────────────────

describe('enableChildMode', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns { name, avatar } for an owned profile', async () => {
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn(),
      signChildModeCookie: vi.fn(),
    }));
    vi.doMock('~/db', () => ({ getDb: () => ({ __fakeDb: true }) }));
    vi.doMock('./profiles', () => ({
      getActiveProfile: vi.fn().mockResolvedValue({
        id: 'profile-1',
        name: 'Aisyah',
        avatar: 'alif-lamp',
        vowelMode: 'fathah',
      }),
    }));

    const { enableChildMode } = await import('./auth-fns');
    const result = await enableChildMode({} as never, 'user-1', 'profile-1');
    expect(result).toEqual({ name: 'Aisyah', avatar: 'alif-lamp' });
  });

  it('throws when profile not owned by user (via getActiveProfile)', async () => {
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn(),
      signChildModeCookie: vi.fn(),
    }));
    vi.doMock('~/db', () => ({ getDb: () => ({ __fakeDb: true }) }));
    vi.doMock('./profiles', () => ({
      getActiveProfile: vi
        .fn()
        .mockRejectedValue(new Error('Profile not found or does not belong to you.')),
    }));

    const { enableChildMode } = await import('./auth-fns');
    await expect(enableChildMode({} as never, 'user-1', 'other-profile')).rejects.toThrow(
      'Profile not found or does not belong to you.',
    );
  });
});

// ─── enableChildModeFn / disableChildModeFn wrappers ────────────────────

describe('enableChildModeFn', () => {
  const mockSetCookie = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    mockSetCookie.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validateSessionFn returns session when mock auth is set up', async () => {
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
      setCookie: mockSetCookie,
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          getSession: vi.fn().mockResolvedValue({
            user: { id: 'user-1', email: 'p@test.com', name: 'P' },
            session: {},
          }),
        },
      }),
    }));

    const { validateSessionFn } = await import('./auth-fns');
    const result = await (validateSessionFn as unknown as () => Promise<unknown>)();
    expect(result).toEqual(
      expect.objectContaining({ user: expect.objectContaining({ id: 'user-1' }) }),
    );
  });

  it('sets child_mode cookie and returns profile on success', async () => {
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
      setCookie: mockSetCookie,
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          getSession: vi.fn().mockResolvedValue({
            user: { id: 'user-1', email: 'p@test.com', name: 'P' },
            session: {},
          }),
        },
      }),
    }));
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn(),
      signChildModeCookie: vi.fn().mockReturnValue('signed-cookie-value'),
    }));
    vi.doMock('~/db', () => ({ getDb: () => ({}) }));
    vi.doMock('./profiles', () => ({
      getActiveProfile: vi.fn().mockResolvedValue({
        id: 'profile-1',
        name: 'Aisyah',
        avatar: 'alif-lamp',
        vowelMode: 'fathah',
      }),
    }));

    const { enableChildModeFn } = await import('./auth-fns');
    const result = await (
      enableChildModeFn as unknown as (input: { data: unknown }) => Promise<unknown>
    )({ data: { profileId: '550e8400-e29b-41d4-a716-446655440000' } });

    expect(result).toEqual({ success: true, profile: { name: 'Aisyah', avatar: 'alif-lamp' } });
    expect(mockSetCookie).toHaveBeenCalledWith(
      'child_mode',
      'signed-cookie-value',
      expect.objectContaining({ httpOnly: false, maxAge: 31_536_000, sameSite: 'lax', path: '/' }),
    );
  });

  it('throws when session is null (unauthenticated)', async () => {
    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: (args: { data: unknown }) => Promise<unknown>) => fn),
      })),
    }));
    vi.doMock('@tanstack/react-start/server', () => ({
      getRequest: () => ({ headers: new Headers() }),
      getCookie: vi.fn(),
      setCookie: mockSetCookie,
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          getSession: vi.fn().mockResolvedValue(null),
        },
      }),
    }));

    const { enableChildModeFn } = await import('./auth-fns');
    await expect(
      (enableChildModeFn as unknown as (input: { data: unknown }) => Promise<unknown>)({
        data: { profileId: '550e8400-e29b-41d4-a716-446655440000' },
      }),
    ).rejects.toThrow('Unauthenticated.');
  });
});

describe('disableChildModeFn', () => {
  const mockSetCookie = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    mockSetCookie.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logoutFn calls signOut and returns success', async () => {
    const mockSignOut = vi.fn().mockResolvedValue({});
    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: () => Promise<unknown>) => fn),
      })),
    }));
    vi.doMock('@tanstack/react-start/server', () => ({
      getRequest: () => ({ headers: new Headers({ cookie: 'test' }) }),
      getCookie: vi.fn(),
      setCookie: vi.fn(),
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          signOut: mockSignOut,
        },
      }),
    }));

    const { logoutFn } = await import('./auth-fns');
    const result = await (logoutFn as unknown as () => Promise<unknown>)();

    expect(result).toEqual({ success: true });
    expect(mockSignOut).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
  });

  it('clears child_mode cookie and returns success', async () => {
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
      setCookie: mockSetCookie,
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          getSession: vi.fn().mockResolvedValue({
            user: { id: 'user-1', email: 'p@test.com', name: 'P' },
            session: {},
          }),
        },
      }),
    }));

    const { disableChildModeFn } = await import('./auth-fns');
    const result = await (
      disableChildModeFn as unknown as (input: { data: unknown }) => Promise<unknown>
    )({ data: undefined });

    expect(result).toEqual({ success: true });
    expect(mockSetCookie).toHaveBeenCalledWith('child_mode', '', { maxAge: 0, path: '/' });
  });

  it('validateSessionFn falls back to child cookie when parent session is null', async () => {
    // buildChildSession sets user.id/session.userId to the parent userId from the DB,
    // email to '' and token to '' — the expected shape reflects the actual function behavior
    const mockChildSession = {
      user: { id: 'parent-1', email: '', isChild: true as const, childProfileId: 'profile-1' },
      session: expect.objectContaining({ token: '', userId: 'parent-1' }),
    };
    vi.doMock('@tanstack/react-start', () => ({
      createServerFn: vi.fn(() => ({
        inputValidator: vi.fn().mockReturnThis(),
        handler: vi.fn((fn: (args: { data: unknown }) => Promise<unknown>) => fn),
      })),
    }));
    vi.doMock('@tanstack/react-start/server', () => ({
      getRequest: () => ({ headers: new Headers() }),
      getCookie: vi.fn((name: string) => {
        if (name === 'better-auth.session_token') return undefined;
        if (name === 'child_mode') return 'valid-child-cookie';
        return undefined;
      }),
      setCookie: vi.fn(),
    }));
    vi.doMock('./auth', () => ({
      getAuth: () => ({
        api: {
          getSession: vi.fn().mockResolvedValue(null),
        },
      }),
    }));
    vi.doMock('~/db', () => ({
      getDb: () => ({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ userId: 'parent-1' }]),
          }),
        }),
      }),
    }));
    vi.doMock('~/lib/utils/child-mode.server', () => ({
      verifyChildModeCookie: vi.fn().mockReturnValue({ profileId: 'profile-1' }),
    }));

    const { validateSessionFn } = await import('./auth-fns');
    const result = await (validateSessionFn as unknown as () => Promise<unknown>)();

    expect(result).toEqual(mockChildSession);
  });
});
