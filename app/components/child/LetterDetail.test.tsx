// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { useUiStore } from '~/stores/ui-store';
import { composeLetter } from '~/lib/utils/harakat';
import type { VowelMode } from '~/lib/utils/harakat';
import type { VisibleLetter } from '~/server/letters';

// ── Audio mocks ───────────────────────────────────────────────────────

const speakMock = vi.fn();
const cancelMock = vi.fn();
const speakResolves: (() => void)[] = [];

vi.mock('~/lib/audio/audio-engine', () => ({
  audioEngine: {
    speak: (...args: unknown[]) => {
      speakMock(...args);
      return new Promise<void>((resolve) => {
        speakResolves.push(resolve);
      });
    },
    cancel: () => {
      cancelMock();
      const pending = speakResolves.splice(0);
      pending.forEach((resolve) => resolve());
    },
  },
}));

const visibleLetters: VisibleLetter[] = [
  { letterId: 'alif', character: 'ا', displayOrder: 1, audioFile: '', isVisible: true },
  { letterId: 'ba', character: 'ب', displayOrder: 2, audioFile: '', isVisible: true },
  { letterId: 'ta', character: 'ت', displayOrder: 3, audioFile: '', isVisible: true },
];

describe('LetterDetail', () => {
  beforeEach(() => {
    useUiStore.setState({
      selectedLetterId: null,
      isLoading: false,
      toasts: [],
      currentHarakat: 'fathah' as VowelMode,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    speakResolves.length = 0;
  });

  // ── Visual rendering (existing tests, adapted for dynamic import) ─────

  it('renders nothing when useUiStore.selectedLetterId is null', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    const { container } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders the composed glyph at large size when selectedLetterId is set', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'alif' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    const expected = composeLetter('ا', 'fathah');
    const glyph = screen.getByText(expected);

    expect(glyph).toBeTruthy();
    expect(glyph.className).toMatch(/text-8xl|text-9xl/);
  });

  it('positions the overlay with fixed inset-0 z-50 (full-screen)', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'alif' });

    const { container } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    const overlay = container.firstElementChild as HTMLElement;
    expect(overlay.className).toContain('fixed');
    expect(overlay.className).toContain('inset-0');
    expect(overlay.className).toContain('z-50');
  });

  it('looks up the character from visibleLetters by selectedLetterId', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'ba' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    const expected = composeLetter('ب', 'fathah');
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('re-renders the glyph when currentHarakat prop changes', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'alif' });

    const { rerender } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    const fathah = composeLetter('ا', 'fathah');
    expect(screen.getByText(fathah)).toBeTruthy();

    rerender(<LetterDetail visibleLetters={visibleLetters} currentHarakat="dammah" />);

    const dammah = composeLetter('ا', 'dammah');
    expect(screen.getByText(dammah)).toBeTruthy();
    expect(screen.queryByText(fathah)).toBeNull();
  });

  it('overlay has animate-bounceIn entrance animation class when open', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'alif' });

    const { container } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    const overlay = container.firstElementChild as HTMLElement;
    expect(overlay.className).toContain('animate-bounceIn');
  });

  it('renders nothing when selectedLetterId is set but does not match any visible letter', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'non-existent' });

    const { container } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    expect(container.firstChild).toBeNull();
  });

  // ── Swipe navigation tests ────────────────────────────────────────────

  it('swipe left (deltaX ≤ -50px) navigates to the next letter', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'alif' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    const overlay = screen.getByRole('dialog');

    // Swipe left: clientX 200 → 50 = deltaX -150
    fireEvent.mouseDown(overlay, { clientX: 200, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 50, clientY: 100 });

    await waitFor(() => {
      expect(useUiStore.getState().selectedLetterId).toBe('ba');
    });
  });

  it('swipe right (deltaX ≥ 50px) navigates to the previous letter', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'ba' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    const overlay = screen.getByRole('dialog');

    // Swipe right: clientX 50 → 200 = deltaX +150
    fireEvent.mouseDown(overlay, { clientX: 50, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 200, clientY: 100 });

    await waitFor(() => {
      expect(useUiStore.getState().selectedLetterId).toBe('alif');
    });
  });

  it('swipe past the last letter wraps around to the first', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'ta' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    const overlay = screen.getByRole('dialog');

    // Swipe left from last letter → wrap to first
    fireEvent.mouseDown(overlay, { clientX: 200, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 50, clientY: 100 });

    await waitFor(() => {
      expect(useUiStore.getState().selectedLetterId).toBe('alif');
    });
  });

  it('swipe before the first letter wraps around to the last', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'alif' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    const overlay = screen.getByRole('dialog');

    // Swipe right from first letter → wrap to last
    fireEvent.mouseDown(overlay, { clientX: 50, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 200, clientY: 100 });

    await waitFor(() => {
      expect(useUiStore.getState().selectedLetterId).toBe('ta');
    });
  });

  it('sub-threshold swipe (< 50px) does not navigate', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'ba' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    const overlay = screen.getByRole('dialog');

    // Small swipe: deltaX = 30px (< 50px threshold)
    fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 130, clientY: 100 });

    // Allow microtasks to settle (audio promises, etc.)
    await vi.waitFor(() => Promise.resolve());

    expect(useUiStore.getState().selectedLetterId).toBe('ba');
  });

  it('vertical swipe (deltaY > deltaX) does not navigate', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'ba' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    const overlay = screen.getByRole('dialog');

    // Vertical swipe: deltaY = 200, deltaX = 10 — deltaY > deltaX
    fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 110, clientY: 300 });

    // Allow microtasks to settle (audio promises, etc.)
    await vi.waitFor(() => Promise.resolve());

    expect(useUiStore.getState().selectedLetterId).toBe('ba');
  });

  it('single visible letter: swipe does not navigate (stays on same letter)', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    const firstLetter = visibleLetters[0]!;
    const singleLetter: VisibleLetter[] = [firstLetter];
    useUiStore.setState({ selectedLetterId: 'alif' });

    render(<LetterDetail visibleLetters={singleLetter} currentHarakat="fathah" />);

    const overlay = screen.getByRole('dialog');

    // Swipe left
    fireEvent.mouseDown(overlay, { clientX: 200, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 50, clientY: 100 });

    // Allow microtasks to settle (audio promises, etc.)
    await vi.waitFor(() => Promise.resolve());

    expect(useUiStore.getState().selectedLetterId).toBe('alif');
  });

  it('swipe cancels previous audio and plays new letter audio', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'alif' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);
    expect(speakMock).toHaveBeenCalledWith('alif', 'fathah', 'ا');

    speakMock.mockClear();
    cancelMock.mockClear();

    const overlay = screen.getByRole('dialog');

    // Swipe left
    fireEvent.mouseDown(overlay, { clientX: 200, clientY: 100 });
    fireEvent.mouseUp(overlay, { clientX: 50, clientY: 100 });

    await waitFor(() => {
      expect(useUiStore.getState().selectedLetterId).toBe('ba');
    });

    // Previous audio was cancelled
    expect(cancelMock).toHaveBeenCalled();

    // New audio started for the navigated letter
    expect(speakMock).toHaveBeenCalledWith('ba', 'fathah', 'ب');
  });

  it('overlay has touch-none class for gesture surface', async () => {
    const { LetterDetail } = await import('./LetterDetail');
    useUiStore.setState({ selectedLetterId: 'alif' });

    const { container } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    const overlay = container.firstElementChild as HTMLElement;
    expect(overlay.className).toContain('touch-none');
  });
});
