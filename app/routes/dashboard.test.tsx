// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockListProfiles = vi.fn().mockResolvedValue([]);
const mockValidateSession = vi.fn();

vi.mock('~/server/profiles', () => ({
  listProfilesFn: () => mockListProfiles() as Promise<unknown>,
}));

vi.mock('~/server/auth-fns', () => ({
  validateSessionFn: () => mockValidateSession() as Promise<unknown>,
  logoutFn: vi.fn(),
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      DASHBOARD_TITLE: () => 'Dashboard' as const,
      DASHBOARD_ADD_CHILD: () => 'Add Child' as const,
      DASHBOARD_NO_CHILDREN: () => 'No child profiles yet. Add one to get started.' as const,
      DASHBOARD_SIGN_OUT: () => 'Sign out' as const,
      DASHBOARD_SIGNING_OUT: () => 'Signing out\u2026' as const,
      PROFILE_NAME: () => 'Child Profiles' as const,
      PROFILE_LETTERS_LABEL: () => 'introduced' as const,
      PROFILE_MANAGE_LETTERS: () => 'Manage Letters' as const,
      PROFILE_EDIT: () => 'Edit' as const,
      PROFILE_DELETE: () => 'Delete' as const,
      ERROR_GENERIC: () => 'Something went wrong.' as const,
      LOCALE_SWITCH: () => 'Bahasa Indonesia' as const,
    },
  }),
  locales: ['en', 'id'],
  defaultLocale: 'en',
  I18nClient: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

let queryClient: QueryClient;

// ── Route-level tests ──────────────────────────────────────────────────

describe('Dashboard route', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the sidebar with dashboard title', async () => {
    const { Route } = await import('./dashboard');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Dashboard route has no component');
    }

    render(
      <QueryClientProvider client={queryClient}>
        <Component />
      </QueryClientProvider>,
    );

    // Sidebar title
    expect(await screen.findByText('Dashboard')).toBeTruthy();

    // Sidebar contains Sign out
    expect(screen.getByText('Sign out')).toBeTruthy();

    // "Child Profiles" appears twice: sidebar nav + header — use getAllByText
    const childProfileElements = screen.getAllByText('Child Profiles');
    expect(childProfileElements.length).toBe(2);
  });

  it('renders the locale toggle and "Add Child" button', async () => {
    const { Route } = await import('./dashboard');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Dashboard route has no component');
    }

    render(
      <QueryClientProvider client={queryClient}>
        <Component />
      </QueryClientProvider>,
    );

    // "Bahasa Indonesia" appears only in the sidebar
    const localeButtons = await screen.findAllByText('Bahasa Indonesia');
    expect(localeButtons.length).toBe(1);

    // Add Child button in main content
    expect(screen.getByText('Add Child')).toBeTruthy();
  });
});
