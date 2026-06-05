// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockListProfiles = vi.fn().mockResolvedValue([]);

vi.mock('~/server/profiles', () => ({
  listProfilesFn: () => mockListProfiles() as Promise<unknown>,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      DASHBOARD_TITLE: () => 'Dashboard' as const,
      LOCALE_SWITCH: () => 'Bahasa Indonesia' as const,
      PROFILE_MANAGE_LETTERS: () => 'Manage Letters' as const,
      DASHBOARD_SIGN_OUT: () => 'Sign out' as const,
      DASHBOARD_SIGNING_OUT: () => 'Signing out\u2026' as const,
      ERROR_GENERIC: () => 'Something went wrong.' as const,
    },
  }),
  locales: ['en', 'id'],
  defaultLocale: 'en',
  I18nClient: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('./LanguageToggle', () => ({
  LanguageToggle: () => <button type="button">Bahasa Indonesia</button>,
}));

vi.mock('./ProfileMenu', () => ({
  ProfileMenu: () => (
    <button type="button" aria-label="Profile menu">
      Profile menu trigger
    </button>
  ),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('DashboardHeader', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the dashboard title', async () => {
    const { DashboardHeader } = await import('./DashboardHeader');
    render(<DashboardHeader />, { wrapper: createWrapper() });

    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('renders the language toggle', async () => {
    const { DashboardHeader } = await import('./DashboardHeader');
    render(<DashboardHeader />, { wrapper: createWrapper() });

    expect(screen.getByText('Bahasa Indonesia')).toBeTruthy();
  });

  it('renders the profile menu trigger', async () => {
    const { DashboardHeader } = await import('./DashboardHeader');
    render(<DashboardHeader />, { wrapper: createWrapper() });

    expect(screen.getByLabelText('Profile menu')).toBeTruthy();
  });
});
