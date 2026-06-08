// @vitest-environment jsdom
import { describe, expect, it, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useAuthStore } from '~/stores/auth-store';
import { useUiStore } from '~/stores/ui-store';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockGetProfile = vi.fn();
const mockGetLetters = vi.fn();

vi.mock('~/server/profiles', () => ({
  getActiveProfileFn: (opts: { data: { profileId: string } }) =>
    mockGetProfile(opts.data.profileId) as Promise<unknown>,
}));

vi.mock('~/server/letters', () => ({
  getVisibleLettersFn: (opts: { data: { profileId: string } }) =>
    mockGetLetters(opts.data.profileId) as Promise<unknown>,
}));

vi.mock('~/lib/audio/audio-engine', () => ({
  audioEngine: {} as import('~/lib/audio/audio-engine').AudioEngine,
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {},
  }),
}));

// Mock the router's Link and useMatchRoute
vi.mock('@tanstack/react-router', async () => {
  const actual =
    await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
  return {
    ...actual,
    Link: ({ children, ...props }: { children: ReactNode; to: string; className?: string }) => (
      <a {...props}>{children}</a>
    ),
    useMatchRoute: () => () => false, // Not on child route → renders LearnContent
    useNavigate: () => vi.fn(),
  };
});

// ── Test fixtures ──────────────────────────────────────────────────────

const TEST_PROFILE_ID = 'test-profile-001';
const TEST_PROFILE = { name: 'Aisha', avatar: null };
const TEST_LETTERS = [
  { letterId: 'alif', character: '\u0627', displayOrder: 1, audioFile: '', isVisible: true },
  { letterId: 'ba', character: '\u0628', displayOrder: 2, audioFile: '', isVisible: true },
  { letterId: 'ta', character: '\u062A', displayOrder: 3, audioFile: '', isVisible: true },
];

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

describe('/learn route — entrance animation', () => {
  beforeAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    resetUiStore();
    setActiveChild(TEST_PROFILE_ID);
    mockGetProfile.mockResolvedValue(TEST_PROFILE);
    mockGetLetters.mockResolvedValue(TEST_LETTERS);
  });

  afterEach(() => {
    cleanup();
    queryClient?.clear();
  });

  it('root <main> has animate-fadeInUp class when data loads', async () => {
    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) throw new Error('Learn route has no component');

    render(<Component />, { wrapper: createWrapper() });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Reading Practice')).toBeTruthy();
    });

    const main = document.querySelector('main');
    expect(main).toBeTruthy();
    expect(main!.className).toContain('animate-fadeInUp');
  });

  it('respects prefers-reduced-motion: animation class still present', async () => {
    // Mock matchMedia to simulate reduced motion preference
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    try {
      const { Route } = await import('./learn');
      const Component = Route.options.component;

      if (!Component) throw new Error('Learn route has no component');

      render(<Component />, { wrapper: createWrapper() });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Reading Practice')).toBeTruthy();
      });

      const main = document.querySelector('main');
      expect(main).toBeTruthy();
      // Class is still applied — CSS @media rule zeroes out animation duration
      expect(main!.className).toContain('animate-fadeInUp');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
