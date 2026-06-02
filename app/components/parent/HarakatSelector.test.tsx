// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { VowelMode } from '~/lib/utils/harakat';

const mockProfileId = 'test-profile-id';

const mockUpdateProfile = vi.fn().mockResolvedValue({
  id: mockProfileId,
  name: 'Test',
  avatar: 'ba-boat',
  vowelMode: 'fathah',
});

vi.mock('~/server/profiles', () => ({
  updateProfileFn: (opts: { data: { profileId: string; vowelMode: VowelMode } }) =>
    mockUpdateProfile(opts.data) as Promise<unknown>,
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

describe('HarakatSelector', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders all 4 vowel mode options', async () => {
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId={mockProfileId} currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Plain')).toBeTruthy();
    expect(screen.getByText(/Fathah/)).toBeTruthy();
    expect(screen.getByText(/Kasrah/)).toBeTruthy();
    expect(screen.getByText(/Dammah/)).toBeTruthy();
  });

  it('highlights the currently active mode', async () => {
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId={mockProfileId} currentVowelMode="kasrah" />, {
      wrapper: createWrapper(),
    });

    // The active radio item should have a highlight style
    const kasrahItem = screen.getByLabelText('Kasrah');
    expect(kasrahItem.className).toContain('bg-green');
  });

  it('does not highlight inactive modes', async () => {
    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId={mockProfileId} currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const plainItem = screen.getByLabelText('Plain');
    expect(plainItem.className).not.toContain('bg-green');
  });

  it('calls updateProfileFn when a different mode is selected', async () => {
    mockUpdateProfile.mockResolvedValue({
      id: mockProfileId,
      name: 'Test',
      avatar: 'ba-boat',
      vowelMode: 'dammah',
    });

    const { HarakatSelector } = await import('./HarakatSelector');
    render(<HarakatSelector profileId={mockProfileId} currentVowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const dammahItem = screen.getByLabelText('Dammah');
    const user = userEvent.setup();
    await user.click(dammahItem);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        profileId: mockProfileId,
        vowelMode: 'dammah',
      });
    });
  });
});
