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

vi.mock('~/components/parent/DashboardHeader', () => ({
  DashboardHeader: () => (
    <div data-testid="dashboard-header">
      <span>Dashboard</span>
      <button type="button">Bahasa Indonesia</button>
    </div>
  ),
}));

vi.mock('~/components/parent/ProfileList', () => ({
  ProfileList: () => <div data-testid="profile-list">Profile list</div>,
}));

vi.mock('~/components/parent/ProfileEditor', () => ({
  ProfileEditor: () => null,
}));

vi.mock('~/components/ui/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      DASHBOARD_TITLE: () => 'Dashboard' as const,
      DASHBOARD_ADD_CHILD: () => 'Add Child' as const,
      PROFILE_NAME: () => 'Child Profiles' as const,
      PROFILE_DELETE: () => 'Delete' as const,
      PROFILE_DELETE_CONFIRM: () => 'Are you sure you want to delete this profile?' as const,
      PROFILE_CANCEL: () => 'Cancel' as const,
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

  it('renders DashboardHeader with title instead of sidebar', { timeout: 10000 }, async () => {
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

    // DashboardHeader is present with the title
    expect(await screen.findByText('Dashboard')).toBeTruthy();

    // No sidebar should exist (no direct "Sign out" button — it's in dropdown)
    expect(screen.queryByRole('complementary')).toBeNull();

    // "Child Profiles" appears once as the main section heading (no sidebar nav)
    const childProfileElements = screen.getAllByText('Child Profiles');
    expect(childProfileElements).toHaveLength(1);
  });

  it('renders language toggle and "Add Child" button', { timeout: 10000 }, async () => {
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

    // Language toggle rendered by DashboardHeader
    expect(await screen.findByText('Bahasa Indonesia')).toBeTruthy();

    // Add Child button in main content
    expect(screen.getByText('Add Child')).toBeTruthy();
  });

  it('renders ProfileList component', { timeout: 10000 }, async () => {
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

    expect(await screen.findByTestId('profile-list')).toBeTruthy();
  });
});
