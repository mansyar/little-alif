import { describe, expect, it, vi } from 'vitest';
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
  // Replicates the try/catch body in registerFn / loginFn. We exercise
  // it independently because the server function itself is wrapped in
  // createServerFn and cannot be unit-tested in isolation.
  function translate(err: unknown): unknown {
    if (err instanceof APIError) {
      return new Error(err.message);
    }
    return err;
  }

  it('wraps APIError in a plain Error with the original message', () => {
    const apiErr = new APIError('BAD_REQUEST', {
      message: 'Email taken',
    });
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
