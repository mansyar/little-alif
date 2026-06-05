// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mockProfiles = [
  { id: 'profile-1', name: 'Aisha', avatar: 'ba-boat' as const },
  { id: 'profile-2', name: 'Bilal', avatar: 'alif-lamp' as const },
];

const mockListProfiles = vi.fn().mockResolvedValue(mockProfiles);
const mockLogout = vi.fn().mockResolvedValue(undefined);
const mockNavigate = vi.fn();

vi.mock('~/server/profiles', () => ({
  listProfilesFn: () => mockListProfiles() as Promise<unknown>,
}));

vi.mock('~/server/auth-fns', () => ({
  logoutFn: () => mockLogout() as Promise<unknown>,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      PROFILE_NAME: () => 'Profiles' as const,
      DASHBOARD_SIGN_OUT: () => 'Sign out' as const,
      DASHBOARD_SIGNING_OUT: () => 'Signing out\u2026' as const,
      DASHBOARD_SIGN_OUT_CONFIRM: () => 'Are you sure you want to sign out?' as const,
      ERROR_GENERIC: () => 'Something went wrong.' as const,
      PROFILE_CANCEL: () => 'Cancel' as const,
    },
  }),
  locales: ['en', 'id'],
  defaultLocale: 'en',
  I18nClient: ({ children }: { children: ReactNode }) => <>{children}</>,
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

describe('ProfileMenu', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the trigger button with aria-label', async () => {
    const { ProfileMenu } = await import('./ProfileMenu');
    render(<ProfileMenu />, { wrapper: createWrapper() });

    expect(screen.getByLabelText('Profile menu')).toBeTruthy();
  });

  it('opens dropdown showing profile names when trigger is clicked', async () => {
    const user = userEvent.setup();
    const { ProfileMenu } = await import('./ProfileMenu');
    render(<ProfileMenu />, { wrapper: createWrapper() });

    const trigger = screen.getByLabelText('Profile menu');
    await user.click(trigger);

    expect(screen.getByText('Aisha')).toBeTruthy();
    expect(screen.getByText('Bilal')).toBeTruthy();
  });

  it('navigates to letters route when a profile is clicked', async () => {
    const user = userEvent.setup();
    const { ProfileMenu } = await import('./ProfileMenu');
    render(<ProfileMenu />, { wrapper: createWrapper() });

    const trigger = screen.getByLabelText('Profile menu');
    await user.click(trigger);

    const aishaItem = screen.getByText('Aisha');
    await user.click(aishaItem);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/dashboard/profiles/$id/letters',
      params: { id: 'profile-1' },
    });
  });

  it('opens ConfirmDialog when sign out is clicked', async () => {
    const user = userEvent.setup();
    const { ProfileMenu } = await import('./ProfileMenu');
    render(<ProfileMenu />, { wrapper: createWrapper() });

    const trigger = screen.getByLabelText('Profile menu');
    await user.click(trigger);

    const signOutItem = screen.getByText('Sign out');
    await user.click(signOutItem);

    expect(screen.getByText('Are you sure you want to sign out?')).toBeTruthy();
  });

  it('renders profiles label in dropdown', async () => {
    const user = userEvent.setup();
    const { ProfileMenu } = await import('./ProfileMenu');
    render(<ProfileMenu />, { wrapper: createWrapper() });

    const trigger = screen.getByLabelText('Profile menu');
    await user.click(trigger);

    expect(screen.getByText('Profiles')).toBeTruthy();
  });

  it('displays empty state when no profiles', async () => {
    mockListProfiles.mockResolvedValueOnce([]);

    const user = userEvent.setup();
    const { ProfileMenu } = await import('./ProfileMenu');
    render(<ProfileMenu />, { wrapper: createWrapper() });

    const trigger = screen.getByLabelText('Profile menu');
    await user.click(trigger);

    expect(screen.getByText('Profiles')).toBeTruthy();
    expect(screen.queryByText('Aisha')).toBeNull();
    expect(screen.queryByText('Bilal')).toBeNull();
  });
});
