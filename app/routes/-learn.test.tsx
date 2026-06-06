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
const mockValidateSession = vi.fn();
const mockNavigate = vi.fn();

vi.mock('~/server/profiles', () => ({
  getActiveProfileFn: (opts: { data: { profileId: string } }) =>
    mockGetActiveProfile(opts.data.profileId) as Promise<unknown>,
}));

vi.mock('~/server/letters', () => ({
  getVisibleLettersFn: (opts: { data: { profileId: string } }) =>
    mockGetVisibleLetters(opts.data.profileId) as Promise<unknown>,
}));

vi.mock('~/server/auth-fns', () => ({
  validateSessionFn: () => mockValidateSession() as Promise<unknown>,
}));

// audioEngine needs to be a real-ish object so the import doesn't crash.
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
    // Return a no-match result so the learn page renders its own content
    useMatchRoute: () => () => undefined,
    // Render nothing for Outlet — child routes are not tested in this file
    Outlet: () => null,
    // Return context for useRouteContext
    useRouteContext: () => ({ childProfileId: null }),
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

const MOCK_CHILD_SESSION = {
  user: { id: 'parent-1', email: '', isChild: true, childProfileId: TEST_PROFILE_ID },
  session: {
    token: '',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    userId: 'parent-1',
  },
};

const MOCK_PARENT_SESSION = {
  user: { id: 'parent-1', email: 'parent@example.com', name: 'Parent' },
  session: {
    token: 'abc',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    userId: 'parent-1',
  },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockBeforeLoadContext(): any {
  return {
    location: { href: '/learn' },
    params: {},
    context: {},
    cause: 'enter' as const,
    search: {},
    abortController: new AbortController(),
  };
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('Learn route beforeLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to / when no session', async () => {
    mockValidateSession.mockResolvedValue(null);

    const { Route } = await import('./learn');
    const beforeLoad = Route.options.beforeLoad;

    if (!beforeLoad) {
      throw new Error('Learn route has no beforeLoad');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(beforeLoad(mockBeforeLoadContext())).rejects.toMatchObject({
      status: 307,
      options: { to: '/' },
    });
  }, 15000);

  it('allows parent session to proceed', async () => {
    mockValidateSession.mockResolvedValue(MOCK_PARENT_SESSION);

    const { Route } = await import('./learn');
    const beforeLoad = Route.options.beforeLoad;

    if (!beforeLoad) {
      throw new Error('Learn route has no beforeLoad');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await beforeLoad(mockBeforeLoadContext());
    expect(result).toEqual({ session: MOCK_PARENT_SESSION });
  });

  it('allows child session to proceed and exposes childProfileId', async () => {
    mockValidateSession.mockResolvedValue(MOCK_CHILD_SESSION);

    const { Route } = await import('./learn');
    const beforeLoad = Route.options.beforeLoad;

    if (!beforeLoad) {
      throw new Error('Learn route has no beforeLoad');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await beforeLoad(mockBeforeLoadContext());
    expect(result).toEqual({ session: MOCK_CHILD_SESSION });
  });
});

describe('Learn route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUiStore();
    setActiveChild(null);
  });

  afterEach(() => {
    cleanup();
  });

  // ── Existing tests (preserved) ───────────────────────────────────────

  it('renders a "select a child" message when childProfileId is null', async () => {
    setActiveChild(null);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

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

    expect(await screen.findByText('Aisyah')).toBeTruthy();

    const alifCard = await screen.findByLabelText('alif');
    expect(alifCard).toBeTruthy();
    expect(screen.getByLabelText('ba')).toBeTruthy();
    expect(screen.getByLabelText('ta')).toBeTruthy();
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

    expect(await screen.findByText('Aisyah')).toBeTruthy();
    expect(container.querySelector('svg.lucide-book-open')).toBeTruthy();
    expect(screen.queryByLabelText('tsa')).toBeNull();
  });

  it('disables the Reading Practice link when fewer than 3 letters are visible', async () => {
    setActiveChild(TEST_PROFILE_ID);
    mockGetActiveProfile.mockResolvedValue(TEST_PROFILE);
    mockGetVisibleLetters.mockResolvedValue([VISIBLE_LETTER_A, VISIBLE_LETTER_B]);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    const readingButton = await screen.findByText('Reading Practice');
    expect(readingButton).toBeTruthy();
    expect(readingButton.tagName).toBe('BUTTON');
    expect(readingButton.hasAttribute('disabled')).toBe(true);
    expect(readingButton.getAttribute('aria-disabled')).toBe('true');
  });

  it('enables the Reading Practice link when 3 or more letters are visible', async () => {
    setActiveChild(TEST_PROFILE_ID);
    mockGetActiveProfile.mockResolvedValue(TEST_PROFILE);
    mockGetVisibleLetters.mockResolvedValue([VISIBLE_LETTER_A, VISIBLE_LETTER_B, VISIBLE_LETTER_T]);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    const readingLink = await screen.findByText('Reading Practice');
    expect(readingLink).toBeTruthy();
    expect(readingLink.getAttribute('disabled')).toBeNull();
    expect(readingLink.getAttribute('to')).toBe('/learn/reading');
  });

  it('renders a "back to dashboard" link alongside the select-child message', async () => {
    setActiveChild(null);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    expect(await screen.findByText(/Select a child profile from the dashboard/i)).toBeTruthy();
    expect(screen.getByText('Back to Dashboard')).toBeTruthy();
  });

  it('renders a hidden parent-menu lock icon in the header when a child is selected', async () => {
    setActiveChild(TEST_PROFILE_ID);
    mockGetActiveProfile.mockResolvedValue(TEST_PROFILE);
    mockGetVisibleLetters.mockResolvedValue([VISIBLE_LETTER_A, VISIBLE_LETTER_B, VISIBLE_LETTER_T]);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    // Lock icon (ParentGate) is the parent escape hatch — replaces the old "Back" text link.
    expect(await screen.findByLabelText('Parent menu')).toBeTruthy();
  });

  it('does NOT render a "Back" text link in the header when a child is selected', async () => {
    setActiveChild(TEST_PROFILE_ID);
    mockGetActiveProfile.mockResolvedValue(TEST_PROFILE);
    mockGetVisibleLetters.mockResolvedValue([VISIBLE_LETTER_A, VISIBLE_LETTER_B, VISIBLE_LETTER_T]);

    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />, { wrapper: createWrapper() });

    // Wait for the page to render
    expect(await screen.findByText('Aisyah')).toBeTruthy();

    // The "Back" text link (replaced by ParentGate) should not be present in the child header.
    // (The "Back to Dashboard" string in SelectChildMessage is a different, parent-only context.)
    const links = screen.queryAllByRole('link');
    for (const link of links) {
      expect(link.textContent).not.toBe('Back');
    }
  });
});
