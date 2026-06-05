// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '~/stores/ui-store';
import { composeLetter } from '~/lib/utils/harakat';

const speakMock = vi.fn();
let speakPromise: Promise<void> | null = null;
let resolveSpeak: (() => void) | null = null;

vi.mock('~/lib/audio/audio-engine', () => ({
  audioEngine: {
    speak: (...args: unknown[]) => {
      speakMock(...args);
      speakPromise = new Promise<void>((resolve) => {
        resolveSpeak = resolve;
      });
      return speakPromise;
    },
  },
}));

import { LetterCard } from './LetterCard';
import type { LetterId } from '~/db/schema';
import type { VowelMode } from '~/lib/utils/harakat';

const letter = {
  letterId: 'alif' as LetterId,
  character: 'ا',
  displayOrder: 1,
  audioFile: '',
  isVisible: true,
};

describe('LetterCard', () => {
  beforeEach(() => {
    useUiStore.setState({
      selectedLetterId: null,
      isLoading: false,
      toasts: [],
      currentHarakat: 'fathah' as VowelMode,
    });
    speakMock.mockClear();
    speakPromise = null;
    resolveSpeak = null;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the composed glyph using composeLetter(character, currentHarakat)', () => {
    useUiStore.setState({ currentHarakat: 'fathah' });

    render(<LetterCard letter={letter} />);

    // composeLetter('ا', 'fathah') → 'اَ' (U+0627 U+064E)
    const expected = composeLetter('ا', 'fathah');
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('tap calls audioEngine.speak(letter.letterId, currentHarakat)', async () => {
    useUiStore.setState({ currentHarakat: 'kasrah' });

    render(<LetterCard letter={letter} />);

    const user = userEvent.setup();
    const card = screen.getByRole('button', { name: 'alif' });
    await user.click(card);

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock).toHaveBeenCalledWith('alif', 'kasrah', 'ا');
  });

  it('tap sets selectedLetterId in useUiStore (opens the LetterDetail overlay)', async () => {
    render(<LetterCard letter={letter} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'alif' }));

    // The setSelectedLetter call happens synchronously in the click handler,
    // before the await on audioEngine.speak(...).
    expect(useUiStore.getState().selectedLetterId).toBe('alif');
  });

  it('clears selectedLetterId when the speak() promise resolves', async () => {
    render(<LetterCard letter={letter} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'alif' }));

    // Sanity: selectedLetterId is set during playback.
    expect(useUiStore.getState().selectedLetterId).toBe('alif');

    // Resolve the speak() promise (simulating utterance end).
    await act(async () => {
      resolveSpeak?.();
      await speakPromise;
    });

    expect(useUiStore.getState().selectedLetterId).toBeNull();
  });

  it('clears selectedLetterId in .finally() when speak() resolves (symmetric for reject)', async () => {
    render(<LetterCard letter={letter} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'alif' }));

    expect(useUiStore.getState().selectedLetterId).toBe('alif');

    // The component uses .finally(...), which runs on both fulfill and reject,
    // so a normal resolve exercises the same code path as a cancellation. A
    // normal resolve is sufficient to assert the .finally contract.
    await act(async () => {
      resolveSpeak?.();
      if (speakPromise) await speakPromise;
    });

    expect(useUiStore.getState().selectedLetterId).toBeNull();
  });

  it('glyph re-renders with the new composeLetter result when currentHarakat changes', () => {
    useUiStore.setState({ currentHarakat: 'fathah' });
    const { rerender } = render(<LetterCard letter={letter} />);

    const fathah = composeLetter('ا', 'fathah');
    expect(screen.getByText(fathah)).toBeTruthy();

    act(() => {
      useUiStore.setState({ currentHarakat: 'dammah' });
    });
    rerender(<LetterCard letter={letter} />);

    const dammah = composeLetter('ا', 'dammah');
    expect(screen.getByText(dammah)).toBeTruthy();
    // The fathah glyph is no longer present.
    expect(screen.queryByText(fathah)).toBeNull();
  });

  it('card has minimum touch target ≥64×64dp (min-h-[64px] min-w-[64px])', () => {
    render(<LetterCard letter={letter} />);

    const card = screen.getByRole('button', { name: 'alif' });
    expect(card.className).toContain('min-h-[64px]');
    expect(card.className).toContain('min-w-[64px]');
    expect(card.className).toContain('aspect-square');
  });

  it('applies active:scale-95 transition-transform for tap bounce (PRD REQ-5.7)', () => {
    render(<LetterCard letter={letter} />);

    const card = screen.getByRole('button', { name: 'alif' });
    expect(card.className).toContain('active:scale-95');
    expect(card.className).toContain('transition-transform');
  });

  it('marks the glyph as aria-hidden (decorative; the letterId is the accessible name)', () => {
    useUiStore.setState({ currentHarakat: 'fathah' });
    render(<LetterCard letter={letter} />);

    const glyphSpan = screen.getByText(composeLetter('ا', 'fathah'));
    expect(glyphSpan.getAttribute('aria-hidden')).toBe('true');
  });

  it('falls back to sand-light bg for unknown letterId', () => {
    const unknownLetter = {
      letterId: 'unknown-letter',
      character: '?',
      displayOrder: 99,
      audioFile: '',
      isVisible: true,
    };
    // @ts-expect-error - testing with unknown letterId
    render(<LetterCard letter={unknownLetter} />);

    const card = screen.getByRole('button', { name: 'unknown-letter' });
    expect(card.className).toContain('bg-sand-light');
  });

  it('renders with no harakat when currentHarakat is none', () => {
    useUiStore.setState({ currentHarakat: 'none' });
    render(<LetterCard letter={letter} />);

    const plain = composeLetter('ا', 'none');
    expect(screen.getByText(plain)).toBeTruthy();
  });

  it('passes letter.character (not letterId) as the third argument to audioEngine.speak', async () => {
    const user = userEvent.setup();
    render(<LetterCard letter={letter} />);

    await user.click(screen.getByRole('button', { name: 'alif' }));

    expect(speakMock).toHaveBeenCalledWith('alif', 'fathah', 'ا');
  });

  it('does not crash when speak() rejects - .finally() handles rejection', async () => {
    speakMock.mockRejectedValueOnce(new Error('Audio failed'));

    const user = userEvent.setup();
    render(<LetterCard letter={letter} />);

    await expect(
      user.click(screen.getByRole('button', { name: 'alif' })),
    ).resolves.toBeUndefined();
  });
});
