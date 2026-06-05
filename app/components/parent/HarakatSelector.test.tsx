// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mockUpdateProfile = vi.fn();
let queryClient: QueryClient;

vi.mock('~/server/profiles', () => ({
  updateProfileFn: (args: unknown) => mockUpdateProfile(args) as Promise<unknown>,
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      HARAKAT_PLAIN: () => 'Plain' as const,
      HARAKAT_FATHAH: () => 'Fathah' as const,
      HARAKAT_KASRAH: () => 'Kasrah' as const,
      HARAKAT_DAMMAH: () => 'Dammah' as const,
    },
  }),
}));

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('HarakatSelector', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders all four vowel mode options', async () => {
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId="test-id" currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Plain')).toBeTruthy();
    expect(screen.getByText('Fathah')).toBeTruthy();
    expect(screen.getByText('Kasrah')).toBeTruthy();
    expect(screen.getByText('Dammah')).toBeTruthy();
  });

  it('highlights the current vowel mode with active styles', async () => {
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId="test-id" currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const fathahItem = screen.getByLabelText('Fathah');
    expect(fathahItem.className).toContain('bg-green');
  });

  it('non-active modes have muted background', async () => {
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId="test-id" currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const kasrahItem = screen.getByLabelText('Kasrah');
    expect(kasrahItem.className).toContain('bg-sand-light');
  });

  it('calls updateProfileFn with new vowel mode on selection change', async () => {
    mockUpdateProfile.mockResolvedValue({ id: 'test-id', vowelMode: 'kasrah' });
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId="profile-1" currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const user = userEvent.setup();
    const kasrahItem = screen.getByLabelText('Kasrah');
    await user.click(kasrahItem);

    await vi.waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        data: { profileId: 'profile-1', vowelMode: 'kasrah' },
      });
    });
  });

  it('handles update failure gracefully via error toast', async () => {
    mockUpdateProfile.mockRejectedValueOnce(new Error('Update failed'));
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId="profile-1" currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const user = userEvent.setup();
    const kasrahItem = screen.getByLabelText('Kasrah');
    await user.click(kasrahItem);

    // Should not throw to the user — error is swallowed by toast
    await vi.waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  it('disables radio items while mutation is pending', async () => {
    mockUpdateProfile.mockReturnValue(new Promise(() => undefined)); // never resolves
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId="profile-1" currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const user = userEvent.setup();
    const kasrahItem = screen.getByLabelText('Kasrah');
    await user.click(kasrahItem);

    // All items should be disabled while pending
    await vi.waitFor(() => {
      const items = screen.getAllByRole('radio');
      for (const item of items) {
        expect(item.hasAttribute('disabled')).toBe(true);
      }
    });
  });

  it('radio group has aria-label "Vowel mode"', async () => {
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId="test-id" currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const group = screen.getByLabelText('Vowel mode');
    expect(group).toBeTruthy();
    expect(group.getAttribute('role')).toBe('radiogroup');
  });
});
