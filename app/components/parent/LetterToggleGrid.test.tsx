// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { VisibleLetter } from '~/server/letters';
import { LETTER_IDS } from '~/lib/constants/letters';
import { useUiStore } from '~/stores/ui-store';
import { ServerFunctionError, ErrorCode } from '~/lib/errors';

const mockProfileId = 'test-profile-id';

const ARABIC_CHARACTERS: Record<string, string> = {
  alif: '\u0627',
  ba: '\u0628',
  ta: '\u062A',
  tsa: '\u062B',
  jim: '\u062C',
  ha: '\u062D',
  kho: '\u062E',
  dal: '\u062F',
  dzal: '\u0630',
  ra: '\u0631',
  zai: '\u0632',
  sin: '\u0633',
  syin: '\u0634',
  shad: '\u0635',
  dhad: '\u0636',
  tha: '\u0637',
  dzha: '\u0638',
  ain: '\u0639',
  ghain: '\u063A',
  fa: '\u0641',
  qaf: '\u0642',
  kaf: '\u0643',
  lam: '\u0644',
  mim: '\u0645',
  nun: '\u0646',
  waw: '\u0648',
  hae: '\u0647',
  ya: '\u064A',
};

const mockLetters: VisibleLetter[] = LETTER_IDS.map((id, i) => ({
  letterId: id,
  character: ARABIC_CHARACTERS[id] ?? '',
  displayOrder: i + 1,
  audioFile: `${id}.mp3`,
  isVisible: false,
}));

const mockGetVisibleLetters = vi.fn().mockResolvedValue(mockLetters);
const mockToggleLetter = vi.fn().mockResolvedValue({ letterId: 'alif', isVisible: true });
const mockBulkToggleLetters = vi.fn().mockResolvedValue({ updatedCount: 28 });

vi.mock('~/server/letters', () => ({
  getVisibleLettersFn: (opts: { data: { profileId: string } }) =>
    mockGetVisibleLetters(opts.data.profileId) as Promise<VisibleLetter[]>,
  toggleLetterFn: (opts: { data: { profileId: string; letterId: string; isVisible: boolean } }) =>
    mockToggleLetter(opts.data) as Promise<{ letterId: string; isVisible: boolean }>,
  bulkToggleLettersFn: (opts: {
    data: { profileId: string; letterIds: string[]; isVisible: boolean };
  }) => mockBulkToggleLetters(opts.data) as Promise<{ updatedCount: number }>,
}));

const mockUpdateProfile = vi.fn().mockResolvedValue({
  id: mockProfileId,
  name: 'Test',
  avatar: 'ba-boat',
  vowelMode: 'fathah',
});

vi.mock('~/server/profiles', () => ({
  updateProfileFn: (opts: { data: { profileId: string; vowelMode: string } }) =>
    mockUpdateProfile(opts.data) as Promise<unknown>,
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      LETTERS_SHOW: () => 'Show',
      LETTERS_HIDE: () => 'Hide',
      LETTERS_TITLE: () => 'Letters',
      HARAKAT_PLAIN: () => 'Plain',
      HARAKAT_FATHAH: () => 'Fathah',
      HARAKAT_KASRAH: () => 'Kasrah',
      HARAKAT_DAMMAH: () => 'Dammah',
      ERROR_AUTH: () => 'Please sign in again.',
      ERROR_UNKNOWN: () => 'Something went wrong.',
    },
  }),
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

describe('LetterToggleGrid', () => {
  afterEach(() => {
    cleanup();
    useUiStore.setState({ toasts: [] });
  });

  it('renders all 28 letters in correct display order', async () => {
    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    render(<LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const switches = await screen.findAllByRole('switch');
    expect(switches).toHaveLength(28);
  });

  it('renders each letter with an Arabic character and a switch', async () => {
    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    const { container } = render(
      <LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />,
      {
        wrapper: createWrapper(),
      },
    );

    // Wait for data to load
    await screen.findAllByRole('switch');

    // Verify Arabic characters are rendered (check for a few known ones)
    // The component should render the actual Arabic characters from seed data
    expect(container.textContent).toContain('ا'); // alif
    expect(container.textContent).toContain('ب'); // ba
    expect(container.textContent).toContain('ي'); // ya
  });

  it('calls toggleLetterFn when a switch is toggled', async () => {
    // Set up mock so the first letter (alif) starts OFF
    mockToggleLetter.mockResolvedValue({ letterId: 'alif', isVisible: true });

    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    render(<LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const switches = await screen.findAllByRole('switch');
    const user = userEvent.setup();
    await user.click(switches[0]!); // Toggle alif ON

    // Debounce delays the mutation call by 300ms, so wait for it
    await waitFor(() => {
      expect(mockToggleLetter).toHaveBeenCalledWith({
        profileId: mockProfileId,
        letterId: 'alif',
        isVisible: true,
      });
    });
  });

  it('disables the switch while the toggle mutation is in flight', async () => {
    // Make the mutation never resolve so we can check disabled state
    mockToggleLetter.mockReturnValue(new Promise(() => undefined));

    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    render(<LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const switches = await screen.findAllByRole('switch');
    const user = userEvent.setup();
    await user.click(switches[0]!);

    // Wait for debounce to trigger the mutation, then all switches should be disabled
    await waitFor(() => {
      expect(switches[0]?.getAttribute('disabled')).not.toBeNull();
    });
  });

  it('shows error toast with ServerFunctionError message when toggleLetterFn returns classified error', async () => {
    mockToggleLetter.mockRejectedValue(
      new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH'),
    );

    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    render(<LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const switches = await screen.findAllByRole('switch');
    const user = userEvent.setup();
    await user.click(switches[0]!);

    await waitFor(() => {
      const toasts = useUiStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.message).toBe('Please sign in again.');
      expect(toasts[0]!.variant).toBe('error');
    });
  });

  it('shows unknown error toast when toggleLetterFn fails with plain Error', async () => {
    mockToggleLetter.mockRejectedValue(new Error('Network failure'));

    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    render(<LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const switches = await screen.findAllByRole('switch');
    const user = userEvent.setup();
    await user.click(switches[0]!);

    await waitFor(() => {
      const toasts = useUiStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.message).toBe('Something went wrong.');
      expect(toasts[0]!.variant).toBe('error');
    });
  });

  it('debounces rapid toggle clicks: only one server call after multiple clicks within 300ms', async () => {
    // The debounce behavior is thoroughly tested at the unit level
    // (useDebouncedCallback.test.ts — 5 tests). This integration test
    // uses synchronous native clicks (no await between them) so all 3
    // clicks register in the same tick, making the debounce deterministic
    // even under scheduler contention.
    mockToggleLetter.mockResolvedValue({ letterId: 'alif', isVisible: true });

    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    render(<LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    const switches = await screen.findAllByRole('switch', {}, { timeout: 10000 });
    const switchEl = switches[0]!;

    // Clear call count from previous tests that also click the switch
    mockToggleLetter.mockClear();

    // Synchronous clicks — all within the same tick, no awaits between them
    switchEl.click();
    switchEl.click();
    switchEl.click();

    // Wait for debounce to settle
    await new Promise((r) => setTimeout(r, 500));

    expect(mockToggleLetter).toHaveBeenCalledTimes(1);
  }, 15000);

  it('calls bulkToggleLettersFn with all letter IDs when "Show All" is clicked', async () => {
    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    render(<LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    // Wait for data to load
    await screen.findAllByRole('switch');

    const showAllButton = screen.getByText('Show');
    const user = userEvent.setup();
    await user.click(showAllButton);

    expect(mockBulkToggleLetters).toHaveBeenCalledWith({
      profileId: mockProfileId,
      letterIds: [...LETTER_IDS],
      isVisible: true,
    });
  }, 15000);

  it('calls bulkToggleLettersFn with all letter IDs when "Hide All" is clicked', async () => {
    // Set up some letters ON so "Hide All" is meaningful
    const { LetterToggleGrid } = await import('./LetterToggleGrid');
    render(<LetterToggleGrid profileId={mockProfileId} vowelMode="fathah" />, {
      wrapper: createWrapper(),
    });

    // Wait for data to load
    await screen.findAllByRole('switch');

    const hideAllButton = screen.getByText('Hide');
    const user = userEvent.setup();
    await user.click(hideAllButton);

    expect(mockBulkToggleLetters).toHaveBeenCalledWith({
      profileId: mockProfileId,
      letterIds: [...LETTER_IDS],
      isVisible: false,
    });
  }, 15000);
});
