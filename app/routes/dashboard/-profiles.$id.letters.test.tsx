// @vitest-environment jsdom
import React from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ── Mocks ─────────────────────────────────────────────────────────────

const mockProfileId = 'test-profile-uuid';
const mockValidateSession = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: { children: ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  redirect: vi.fn(() => {
    throw new Error('REDIRECT');
  }),
  createFileRoute: () => (options: Record<string, unknown>) => ({
    ...options,
    options,
    useParams: () => ({ id: mockProfileId }),
  }),
}));

vi.mock('~/server/auth-fns', () => ({
  validateSessionFn: () => mockValidateSession() as Promise<unknown>,
}));

vi.mock('~/components/parent/LetterToggleGrid', () => ({
  LetterToggleGrid: ({ profileId, vowelMode }: { profileId: string; vowelMode: string }) => (
    <div data-testid="letter-toggle-grid">{`Grid for ${profileId} (${vowelMode})`}</div>
  ),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('Letter management route (/dashboard/profiles/$id/letters)', () => {
  beforeEach(() => {
    mockValidateSession.mockResolvedValue({ user: { id: 'test-user' } });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders a "← Back to Profiles" link that navigates to /dashboard', async () => {
    const { Route } = await import('./profiles.$id.letters');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Route has no component');
    }

    render(React.createElement(Component), { wrapper: createWrapper() });

    const backLink = screen.getByText('← Back to Profiles');
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute('href')).toBe('/dashboard');
  });

  it('renders the LetterToggleGrid with the profile ID from URL params', async () => {
    const { Route } = await import('./profiles.$id.letters');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Route has no component');
    }

    render(React.createElement(Component), { wrapper: createWrapper() });

    const grid = await screen.findByTestId('letter-toggle-grid');
    expect(grid).toBeTruthy();
    expect(grid.textContent).toContain(mockProfileId);
  });

  it('has auth guard that redirects when session is null', async () => {
    mockValidateSession.mockResolvedValueOnce(null);

    const { Route } = await import('./profiles.$id.letters');

    await expect(Route.options.beforeLoad?.({} as never)).rejects.toThrow('REDIRECT');
  });
});
