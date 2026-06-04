// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { useAuthStore } from '~/stores/auth-store';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockEnableChildMode = vi.fn();
const mockDisableChildMode = vi.fn();
const mockNavigate = vi.fn();

vi.mock('~/server/auth-fns', () => ({
  enableChildModeFn: (opts: { data: { profileId: string } }) =>
    mockEnableChildMode(opts.data.profileId) as Promise<unknown>,
  disableChildModeFn: () => mockDisableChildMode() as Promise<unknown>,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      CHILDMODE_ENABLE: () => 'Enable Child Mode' as const,
      CHILDMODE_ACTIVE: () => 'Child Mode is active' as const,
    },
  }),
}));

// ── Fixtures ───────────────────────────────────────────────────────────

const PROFILE_ID = 'profile-1';
const PROFILE_NAME = 'Aisyah';

// ── Helpers ────────────────────────────────────────────────────────────

let queryClient: QueryClient;

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function setAuthStoreChild(profileId: string | null) {
  useAuthStore.setState({
    childProfileId: profileId,
    mode: profileId ? 'child' : null,
    user: null,
    isAuthenticated: profileId !== null,
  });
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('ChildModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthStoreChild(null);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders toggle in OFF state when profile is not active child mode', async () => {
    setAuthStoreChild(null);

    const { ChildModeToggle } = await import('./ChildModeToggle');
    render(<ChildModeToggle profileId={PROFILE_ID} profileName={PROFILE_NAME} />, {
      wrapper: createWrapper(),
    });

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('data-state')).toBe('unchecked');
  });

  it('renders toggle in ON state when profile is active child mode', async () => {
    setAuthStoreChild(PROFILE_ID);

    const { ChildModeToggle } = await import('./ChildModeToggle');
    render(<ChildModeToggle profileId={PROFILE_ID} profileName={PROFILE_NAME} />, {
      wrapper: createWrapper(),
    });

    const toggle = screen.getByRole('switch');
    expect(toggle.getAttribute('data-state')).toBe('checked');
  });

  it('renders toggle in OFF state when a DIFFERENT profile is active', async () => {
    setAuthStoreChild('other-profile');

    const { ChildModeToggle } = await import('./ChildModeToggle');
    render(<ChildModeToggle profileId={PROFILE_ID} profileName={PROFILE_NAME} />, {
      wrapper: createWrapper(),
    });

    const toggle = screen.getByRole('switch');
    expect(toggle.getAttribute('data-state')).toBe('unchecked');
  });

  it('calls enableChildModeFn and navigates to /learn on toggle ON', async () => {
    setAuthStoreChild(null);
    mockEnableChildMode.mockResolvedValue({
      success: true,
      profile: { name: PROFILE_NAME, avatar: 'alif-lamp' },
    });

    const user = userEvent.setup();
    const { ChildModeToggle } = await import('./ChildModeToggle');
    render(<ChildModeToggle profileId={PROFILE_ID} profileName={PROFILE_NAME} />, {
      wrapper: createWrapper(),
    });

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    await vi.waitFor(() => {
      expect(mockEnableChildMode).toHaveBeenCalledWith(PROFILE_ID);
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/learn' });
  });

  it('calls disableChildModeFn on toggle OFF when profile was active', async () => {
    setAuthStoreChild(PROFILE_ID);
    mockDisableChildMode.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    const { ChildModeToggle } = await import('./ChildModeToggle');
    render(<ChildModeToggle profileId={PROFILE_ID} profileName={PROFILE_NAME} />, {
      wrapper: createWrapper(),
    });

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    await vi.waitFor(() => {
      expect(mockDisableChildMode).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows "Child Mode is active" when profile is in child mode', async () => {
    setAuthStoreChild(PROFILE_ID);

    const { ChildModeToggle } = await import('./ChildModeToggle');
    render(<ChildModeToggle profileId={PROFILE_ID} profileName={PROFILE_NAME} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Child Mode is active')).toBeTruthy();
  });
});
