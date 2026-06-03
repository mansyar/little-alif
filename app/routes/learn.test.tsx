// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import { useAuthStore } from '~/stores/auth-store';
import { useUiStore } from '~/stores/ui-store';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockGetActiveProfile = vi.fn();
const mockGetVisibleLetters = vi.fn();
const mockPreloadOnIdle = vi.fn();
const mockNavigate = vi.fn();

vi.mock('~/server/profiles', () => ({
  getActiveProfileFn: (opts: { data: { profileId: string } }) =>
    mockGetActiveProfile(opts.data.profileId) as Promise<unknown>,
}));

vi.mock('~/server/letters', () => ({
  getVisibleLettersFn: (opts: { data: { profileId: string } }) =>
    mockGetVisibleLetters(opts.data.profileId) as Promise<unknown>,
}));

vi.mock('~/lib/audio/preloader', () => ({
  preloadOnIdle: mockPreloadOnIdle,
}));

// audioEngine needs to be a real-ish object so the import doesn't crash,
// but the actual preload logic is already thoroughly tested in preloader.test.ts.
vi.mock('~/lib/audio/audio-engine', () => ({
  audioEngine: {} as import('~/lib/audio/audio-engine').AudioEngine,
}));

// Link requires a Router context which is heavy to set up.
// Replace it with a plain <a> so we can assert on its text/attributes.
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
const TEST_PROFILE = {
  id: TEST_PROFILE_ID,
  name: 'Aisyah',
  avatar: 'alif-lamp',
  vowelMode: 'fathah' as const,
};

const VISIBLE_LETTER_A = {
  letterId: 'alif',
  character: '\u0627',
  displayOrder: 1,
  audioFile: '',
  isVisible: true,
};
const VISIBLE_LETTER_B = {
  letterId: 'ba',
  character: '\u0628',
  displayOrder: 2,
  audioFile: '',
  isVisible: true,
};
const VISIBLE_LETTER_T = {
  letterId: 'ta',
  character: '\u062A',
  displayOrder: 3,
  audioFile: '',
  isVisible: true,
};
const HIDDEN_LETTER = {
  letterId: 'tsa',
  character: '\u062B',
  displayOrder: 4,
  audioFile: '',
  isVisible: false,
};

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

describe('Learn route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUiStore();
    setActiveChild(null);
  });

  afterEach(() => {
    cleanup();
  });

  it('calls preloadOnIdle on mount', async () => {
    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    expect(mockPreloadOnIdle).toHaveBeenCalledTimes(1);
  });

  it('renders a "select a child" message when childProfileId is null', async () => {
    setActiveChild(null);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    // The message is rendered as plain text (no card grid, no Reading Practice button)
    expect(await screen.findByText(/Select a child profile from the dashboard/i)).toBeTruthy();
    expect(screen.queryByText('Reading Practice')).toBeNull();
  });

  it('renders child letter grid with one LetterCard per visible letter', async () => {
    setActiveChild(TEST_PROFILE_ID);
    mockGetActiveProfile.mockResolvedValue(TEST_PROFILE);
    mockGetVisibleLetters.mockResolvedValue([
      VISIBLE_LETTER_A,
      VISIBLE_LETTER_B,
      VISIBLE_LETTER_T,
      HIDDEN_LETTER,
    ]);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    // Active child name appears in ProfileBadge
    expect(await screen.findByText('Aisyah')).toBeTruthy();

    // LetterCards rendered for the 3 visible letters (hidden letter excluded)
    const alifCard = await screen.findByLabelText('alif');
    expect(alifCard).toBeTruthy();
    expect(screen.getByLabelText('ba')).toBeTruthy();
    expect(screen.getByLabelText('ta')).toBeTruthy();
    // Hidden letter must NOT render a card
    expect(screen.queryByLabelText('tsa')).toBeNull();
  });

  it('renders EmptyState when no letters are visible', async () => {
    setActiveChild(TEST_PROFILE_ID);
    mockGetActiveProfile.mockResolvedValue(TEST_PROFILE);
    mockGetVisibleLetters.mockResolvedValue([HIDDEN_LETTER]);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    const { container } = render(<Component />, { wrapper: createWrapper() });

    // ProfileBadge still renders with the profile name
    expect(await screen.findByText('Aisyah')).toBeTruthy();

    // EmptyState icon is rendered (Lucide BookOpen)
    expect(container.querySelector('svg.lucide-book-open')).toBeTruthy();
    // No LetterCard should render
    expect(screen.queryByLabelText('tsa')).toBeNull();
  });

  it('disables the Reading Practice button when fewer than 3 letters are visible', async () => {
    setActiveChild(TEST_PROFILE_ID);
    mockGetActiveProfile.mockResolvedValue(TEST_PROFILE);
    mockGetVisibleLetters.mockResolvedValue([VISIBLE_LETTER_A, VISIBLE_LETTER_B]);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    const readingBtn = await screen.findByRole('button', { name: 'Reading Practice' });
    expect(readingBtn).toBeTruthy();
    expect((readingBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables the Reading Practice button when 3 or more letters are visible', async () => {
    setActiveChild(TEST_PROFILE_ID);
    mockGetActiveProfile.mockResolvedValue(TEST_PROFILE);
    mockGetVisibleLetters.mockResolvedValue([VISIBLE_LETTER_A, VISIBLE_LETTER_B, VISIBLE_LETTER_T]);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    const readingBtn = await screen.findByRole('button', { name: 'Reading Practice' });
    expect(readingBtn).toBeTruthy();
    expect((readingBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('renders a "back to home" link alongside the select-child message', async () => {
    setActiveChild(null);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    // Sanity check that the "missing profile" branch still offers navigation
    expect(await screen.findByText(/Select a child profile from the dashboard/i)).toBeTruthy();

    // The select-child message branch should include a back/home link.
    // (The Link mock renders a plain <a> without `href`, so we assert by text.)
    expect(screen.getByText('Back to Home')).toBeTruthy();
  });
});
