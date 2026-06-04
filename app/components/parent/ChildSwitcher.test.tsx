// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAuthStore } from '~/stores/auth-store';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockListProfilesForSwitch = vi.fn();
const mockEnableChildMode = vi.fn().mockResolvedValue({
  success: true,
  profile: { name: 'Aisyah', avatar: 'alif-lamp' },
});
const mockNavigate = vi.fn();

vi.mock('~/server/profiles', () => ({
  listProfilesForSwitchFn: () => mockListProfilesForSwitch() as Promise<unknown>,
}));

vi.mock('~/server/auth-fns', () => ({
  enableChildModeFn: (opts: { data: { profileId: string } }) =>
    mockEnableChildMode(opts.data.profileId) as Promise<unknown>,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// ── Fixtures ───────────────────────────────────────────────────────────

const ACTIVE_PROFILE_ID = 'active-profile-001';
const OTHER_PROFILE_1 = 'other-profile-002';
const OTHER_PROFILE_2 = 'other-profile-003';

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

beforeEach(() => {
  vi.clearAllMocks();
  mockEnableChildMode.mockResolvedValue({
    success: true,
    profile: { name: 'Aisyah', avatar: 'alif-lamp' },
  });
  useAuthStore.getState().clear();
});

afterEach(() => {
  cleanup();
  queryClient?.clear();
});

// ── Tests ──────────────────────────────────────────────────────────────

describe('ChildSwitcher', () => {
  it('renders a Radix Dialog when open is true', async () => {
    mockListProfilesForSwitch.mockResolvedValue([]);
    const { ChildSwitcher } = await import('./ChildSwitcher');
    render(<ChildSwitcher open onOpenChange={vi.fn()} activeProfileId={ACTIVE_PROFILE_ID} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('shows the "Switch child" heading', async () => {
    mockListProfilesForSwitch.mockResolvedValue([]);
    const { ChildSwitcher } = await import('./ChildSwitcher');
    render(<ChildSwitcher open onOpenChange={vi.fn()} activeProfileId={ACTIVE_PROFILE_ID} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Switch child')).toBeTruthy();
  });

  it('shows the "No other children" empty state when profile list is empty', async () => {
    mockListProfilesForSwitch.mockResolvedValue([]);
    const { ChildSwitcher } = await import('./ChildSwitcher');
    render(<ChildSwitcher open onOpenChange={vi.fn()} activeProfileId={ACTIVE_PROFILE_ID} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText(/no other children/i)).toBeTruthy();
  });

  it('shows the "No other children" empty state when the only profile is the active one', async () => {
    mockListProfilesForSwitch.mockResolvedValue([
      { id: ACTIVE_PROFILE_ID, name: 'Aisyah', avatar: 'alif-lamp' },
    ]);
    const { ChildSwitcher } = await import('./ChildSwitcher');
    render(<ChildSwitcher open onOpenChange={vi.fn()} activeProfileId={ACTIVE_PROFILE_ID} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText(/no other children/i)).toBeTruthy();
  });

  it('shows a tappable tile per non-active profile when there are multiple', async () => {
    mockListProfilesForSwitch.mockResolvedValue([
      { id: ACTIVE_PROFILE_ID, name: 'Aisyah', avatar: 'alif-lamp' },
      { id: OTHER_PROFILE_1, name: 'Bilal', avatar: 'ba-boat' },
      { id: OTHER_PROFILE_2, name: 'Citra', avatar: 'ta-table' },
    ]);
    const { ChildSwitcher } = await import('./ChildSwitcher');
    render(<ChildSwitcher open onOpenChange={vi.fn()} activeProfileId={ACTIVE_PROFILE_ID} />, {
      wrapper: createWrapper(),
    });

    // Active profile tile is NOT shown
    expect(screen.queryByText('Aisyah')).toBeNull();
    // Other profile tiles ARE shown
    expect(await screen.findByText('Bilal')).toBeTruthy();
    expect(screen.getByText('Citra')).toBeTruthy();
  });

  it('aria-label of each tile includes the child name', async () => {
    mockListProfilesForSwitch.mockResolvedValue([
      { id: ACTIVE_PROFILE_ID, name: 'Aisyah', avatar: 'alif-lamp' },
      { id: OTHER_PROFILE_1, name: 'Bilal', avatar: 'ba-boat' },
    ]);
    const { ChildSwitcher } = await import('./ChildSwitcher');
    render(<ChildSwitcher open onOpenChange={vi.fn()} activeProfileId={ACTIVE_PROFILE_ID} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByLabelText(/Switch to Bilal/i)).toBeTruthy();
  });

  it('clicking a profile tile calls the onSwitch prop with that profile id', async () => {
    mockListProfilesForSwitch.mockResolvedValue([
      { id: ACTIVE_PROFILE_ID, name: 'Aisyah', avatar: 'alif-lamp' },
      { id: OTHER_PROFILE_1, name: 'Bilal', avatar: 'ba-boat' },
    ]);
    const onSwitch = vi.fn();
    const { ChildSwitcher } = await import('./ChildSwitcher');
    render(
      <ChildSwitcher
        open
        onOpenChange={vi.fn()}
        activeProfileId={ACTIVE_PROFILE_ID}
        onSwitch={onSwitch}
      />,
      { wrapper: createWrapper() },
    );

    const bilalTile = await screen.findByLabelText(/Switch to Bilal/i);
    fireEvent.click(bilalTile);

    await waitFor(() => {
      expect(onSwitch).toHaveBeenCalledWith(OTHER_PROFILE_1);
    });
  });

  it('clicking a profile tile triggers enableChildModeFn', async () => {
    mockListProfilesForSwitch.mockResolvedValue([
      { id: ACTIVE_PROFILE_ID, name: 'Aisyah', avatar: 'alif-lamp' },
      { id: OTHER_PROFILE_1, name: 'Bilal', avatar: 'ba-boat' },
    ]);
    const { ChildSwitcher } = await import('./ChildSwitcher');
    render(<ChildSwitcher open onOpenChange={vi.fn()} activeProfileId={ACTIVE_PROFILE_ID} />, {
      wrapper: createWrapper(),
    });

    const bilalTile = await screen.findByLabelText(/Switch to Bilal/i);
    fireEvent.click(bilalTile);

    await waitFor(() => {
      expect(mockEnableChildMode).toHaveBeenCalledWith(OTHER_PROFILE_1);
    });
  });
});
