// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockValidateSession = vi.fn();

vi.mock('~/server/auth-fns', () => ({
  validateSessionFn: () => mockValidateSession() as Promise<unknown>,
}));

// ── Helpers ────────────────────────────────────────────────────────────

const MOCK_CHILD_SESSION = {
  user: { id: 'parent-1', email: '', isChild: true, childProfileId: 'child-1' },
  session: {
    token: '',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    userId: 'parent-1',
  },
};

const MOCK_PARENT_SESSION = {
  user: { id: 'parent-1', email: 'parent@example.com', name: 'Parent' },
  session: {
    token: 'abc',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    userId: 'parent-1',
  },
};

// Mock `beforeLoad` context — TanStack Router passes a complex generic type.
// We supply just enough to avoid crashes and suppress the unsafe-argument
// rule since the cast is intentional for testing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockBeforeLoadContext(): any {
  return {
    location: { href: '/' },
    params: {},
    context: {},
    cause: 'enter' as const,
    search: {},
    abortController: new AbortController(),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('Landing page beforeLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects child session to /learn', async () => {
    mockValidateSession.mockResolvedValue(MOCK_CHILD_SESSION);

    const { Route } = await import('./index');
    const beforeLoad = Route.options.beforeLoad;

    if (!beforeLoad) {
      throw new Error('Landing route has no beforeLoad');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(beforeLoad(mockBeforeLoadContext())).rejects.toMatchObject({
      status: 307,
      options: { to: '/learn' },
    });
  });

  it('redirects parent session to /dashboard', async () => {
    mockValidateSession.mockResolvedValue(MOCK_PARENT_SESSION);

    const { Route } = await import('./index');
    const beforeLoad = Route.options.beforeLoad;

    if (!beforeLoad) {
      throw new Error('Landing route has no beforeLoad');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(beforeLoad(mockBeforeLoadContext())).rejects.toMatchObject({
      status: 307,
      options: { to: '/dashboard' },
    });
  });

  it('returns null when no session (unauthenticated)', async () => {
    mockValidateSession.mockResolvedValue(null);

    const { Route } = await import('./index');
    const beforeLoad = Route.options.beforeLoad;

    if (!beforeLoad) {
      throw new Error('Landing route has no beforeLoad');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await beforeLoad(mockBeforeLoadContext());
    expect(result).toEqual({ user: null });
  });
});
