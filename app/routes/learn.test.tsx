// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import type { ReactNode, AnchorHTMLAttributes } from 'react';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockPreloadOnIdle = vi.fn();

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
  };
});

// ── Route-level tests ──────────────────────────────────────────────────

describe('Learn route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the placeholder heading and back link', async () => {
    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />);

    expect(screen.getByText('Little Alif')).toBeTruthy();
    expect(screen.getByText('Child letter grid — coming soon.')).toBeTruthy();
    expect(screen.getByText('Back to Home')).toBeTruthy();
  });

  it('calls preloadOnIdle on mount', async () => {
    const { Route } = await import('./learn');
    const Component = Route.options.component;

    if (!Component) {
      throw new Error('Learn route has no component');
    }

    render(<Component />);

    expect(mockPreloadOnIdle).toHaveBeenCalledTimes(1);
  });
});
