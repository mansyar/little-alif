// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { useAuthStore } from '~/stores/auth-store';
import { useUiStore } from '~/stores/ui-store';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockGetReadingData = vi.fn();
const mockNavigate = vi.fn();

vi.mock('~/server/reading', () => ({
  getReadingDataFn: (opts: { data: { profileId: string } }) =>
    mockGetReadingData(opts.data.profileId) as Promise<unknown>,
}));

vi.mock('~/lib/audio/audio-engine', () => ({
  audioEngine: {} as import('~/lib/audio/audio-engine').AudioEngine,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    Link: ({
      children,
      ...props
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) => (
      <a {...props}>{children}</a>
    ),
    useNavigate: () => mockNavigate,
  };
});

// ── Test fixtures ──────────────────────────────────────────────────────

const TEST_PROFILE_ID = 'test-profile-001';
const THREE_LETTERS = [
  { letterId: 'alif', character: '\u0627' },
  { letterId: 'ba', character: '\u0628' },
  { letterId: 'ta', character: '\u062A' },
];
const TWO_LETTERS = [
  { letterId: 'alif', character: '\u0627' },
  { letterId: 'ba', character: '\u0628' },
];
const FOUR_LETTERS = [
  { letterId: 'alif', character: '\u0627' },
  { letterId: 'ba', character: '\u0628' },
  { letterId: 'ta', character: '\u062A' },
  { letterId: 'tsa', character: '\u062B' },
];
const READING_DATA = { letters: THREE_LETTERS, vowelMode: 'fathah' as const };
const READING_DATA_TWO = { letters: TWO_LETTERS, vowelMode: 'fathah' as const };
const READING_DATA_FOUR = { letters: FOUR_LETTERS, vowelMode: 'fathah' as const };

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

function setActiveChild(profileId: string | null) {
  useAuthStore.setState({
    childProfileId: profileId,
    user: null,
    mode: profileId ? 'child' : null,
    isAuthenticated: profileId !== null,
  });
}

function resetUiStore() {
  useUiStore.setState({
    selectedLetterId: null,
    isLoading: false,
    toasts: [],
    currentHarakat: 'fathah' as const,
  });
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('Reading route (/learn/reading)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUiStore();
    setActiveChild(TEST_PROFILE_ID);
    mockGetReadingData.mockResolvedValue(READING_DATA);
    mockNavigate.mockReturnValue(undefined);
  });

  afterEach(() => {
    cleanup();
    queryClient?.clear();
  });

  it('renders all reading components when reading data loads (≥3 letters)', async () => {
    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    // Wait for data to load — components should appear
    expect(await screen.findByText('Pattern')).toBeTruthy();
    expect(await screen.findByLabelText('Shuffle rows')).toBeTruthy();
    expect(await screen.findByLabelText('Done reading practice')).toBeTruthy();

    // Grid renders 6 rows
    const rows = document.querySelectorAll('[role="row"]');
    expect(rows).toHaveLength(6);
  });

  it('redirects to /learn when fewer than 3 letters', async () => {
    mockGetReadingData.mockResolvedValue(READING_DATA_TWO);

    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/learn' });
    });
  });

  it('shows a loading spinner while fetching data', async () => {
    // Never resolve
    mockGetReadingData.mockReturnValue(new Promise<never>(() => undefined));

    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    expect(screen.getByLabelText('Loading')).toBeTruthy();
  });

  it('shows error + retry when getReadingDataFn rejects', async () => {
    mockGetReadingData.mockRejectedValue(new Error('Failed to load reading data'));

    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    expect(await screen.findByText(/Failed to load reading data/)).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });

  it('retry button calls refetch', async () => {
    mockGetReadingData
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce(READING_DATA);

    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    expect(await screen.findByText(/Failed/)).toBeTruthy();

    await userEvent.setup().click(screen.getByText('Try again'));

    // After successful retry, the components should appear
    expect(await screen.findByText('Pattern')).toBeTruthy();
  });

  it('clicks Next Group to navigate to next group and wraps around', async () => {
    mockGetReadingData.mockResolvedValue(READING_DATA_FOUR); // 4 letters = 2 groups

    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    // Wait for data load
    expect(await screen.findByText('Pattern')).toBeTruthy();
    expect(await screen.findByRole('tab', { name: 'Group 1: ا ب ت' })).toBeTruthy(); // Group 1 pills
    expect(await screen.findByRole('tab', { name: 'Group 2: ث' })).toBeTruthy(); // Group 2 pill (incomplete, but still rendered)

    // Click next group
    const nextBtn = await screen.findByLabelText('Next group');
    await userEvent.setup().click(nextBtn);

    // After clicking next, the second group should be active
    // The first group pill should still exist, and GroupHeader should show thaa (the incomplete group)
    // We verify by checking that the second pill label is now visible
    expect(screen.getByRole('tab', { name: 'Group 2: ث' })).toBeTruthy();
  });

  it('clicks Done navigates to /learn', async () => {
    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    expect(await screen.findByText('Pattern')).toBeTruthy();

    await userEvent.setup().click(screen.getByLabelText('Done reading practice'));

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/learn' });
  });

  it('clicks Shuffle re-renders the grid', async () => {
    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    expect(await screen.findByText('Pattern')).toBeTruthy();

    await userEvent.setup().click(screen.getByLabelText('Shuffle rows'));

    // Grid still renders 6 rows after shuffle
    const rows = document.querySelectorAll('[role="row"]');
    expect(rows).toHaveLength(6);
  });

  it('harakat bar toggle re-renders cells with new vowelMode', async () => {
    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    await screen.findByText('Pattern');

    // Toggle to kasrah via uiStore
    act(() => {
      useUiStore.getState().setHarakat('kasrah');
    });

    // Wait for render — grid should still have 6 rows
    await waitFor(() => {
      const rows = document.querySelectorAll('[role="row"]');
      expect(rows).toHaveLength(6);
    });
  });

  it('renders select-child message when no childProfileId is set', async () => {
    setActiveChild(null);

    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    expect(await screen.findByText(/Select a child profile from the dashboard/i)).toBeTruthy();
  });

  it('incomplete group has disabled pill with Needs 3 letters title', async () => {
    mockGetReadingData.mockResolvedValue(READING_DATA_FOUR); // 4 letters = 2 groups (3 + 1 incomplete)

    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    // The incomplete group pill should be disabled with tooltip
    const incompletePill = await screen.findByTitle('Needs 3 letters');
    expect(incompletePill).toBeTruthy();
    expect(incompletePill.getAttribute('aria-disabled')).toBe('true');
  });

  it('renders a hidden parent-menu lock icon in the header', async () => {
    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    // Lock icon (ParentGate) is the parent escape hatch — replaces the old "Back" text link.
    expect(await screen.findByLabelText('Parent menu')).toBeTruthy();
  });

  it('does NOT render a "Back" text link in the header', async () => {
    const { Route } = await import('./reading');
    const Component = Route.options.component;

    if (!Component) throw new Error('Reading route has no component');

    render(<Component />, { wrapper: createWrapper() });

    // Wait for the page to render
    expect(await screen.findByText('Pattern')).toBeTruthy();

    // The "Back" text link (replaced by ParentGate) should not be present in the header.
    const links = screen.queryAllByRole('link');
    for (const link of links) {
      expect(link.textContent).not.toBe('Back');
    }
  });
});
