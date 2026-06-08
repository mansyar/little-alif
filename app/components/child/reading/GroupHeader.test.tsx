// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReadingGroup } from '~/lib/utils/reading';
import { composeLetter } from '~/lib/utils/harakat';

const COMPLETE_GROUP: ReadingGroup = {
  id: 1,
  letters: ['alif', 'ba', 'ta'],
  label: 'ا ب ت',
  isComplete: true,
};

const INCOMPLETE_GROUP: ReadingGroup = {
  id: 2,
  letters: ['kho', 'dal'],
  label: 'خ د',
  isComplete: false,
};

const LETTER_CHARS: Record<string, string> = {
  alif: 'ا',
  ba: 'ب',
  ta: 'ت',
  kho: 'خ',
  dal: 'د',
};

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
    cancel: cancelMock,
  },
}));

describe('GroupHeader', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    speakResolves.length = 0;
  });

  // ── Visual rendering (existing tests) ────────────────────────────────

  it('renders 3 Arabic glyphs composed via composeLetter for a complete group', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(<GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" letterChars={LETTER_CHARS} />);

    expect(screen.getByText(composeLetter('ا', 'fathah'))).toBeTruthy();
    expect(screen.getByText(composeLetter('ب', 'fathah'))).toBeTruthy();
    expect(screen.getByText(composeLetter('ت', 'fathah'))).toBeTruthy();
  });

  it('renders 2 composed glyphs for an incomplete group', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(<GroupHeader group={INCOMPLETE_GROUP} vowelMode="kasrah" letterChars={LETTER_CHARS} />);

    expect(screen.getByText(composeLetter('خ', 'kasrah'))).toBeTruthy();
    expect(screen.getByText(composeLetter('د', 'kasrah'))).toBeTruthy();
  });

  it('re-renders with new glyphs when vowelMode changes', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    const { rerender } = render(
      <GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" letterChars={LETTER_CHARS} />,
    );

    expect(screen.getByText(composeLetter('ا', 'fathah'))).toBeTruthy();

    rerender(<GroupHeader group={COMPLETE_GROUP} vowelMode="dammah" letterChars={LETTER_CHARS} />);

    expect(screen.getByText(composeLetter('ا', 'dammah'))).toBeTruthy();
  });

  it('incomplete group renders (N/3) hint below glyphs', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(<GroupHeader group={INCOMPLETE_GROUP} vowelMode="none" letterChars={LETTER_CHARS} />);

    expect(screen.getByText('(2/3)')).toBeTruthy();
  });

  it('complete group does not render (N/3) hint', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(
      <GroupHeader
        group={{ ...COMPLETE_GROUP, letters: ['alif', 'ba', 'ta'] }}
        vowelMode="fathah"
        letterChars={LETTER_CHARS}
      />,
    );

    expect(screen.queryByText(/\(\d+\/3\)/)).toBeNull();
  });

  it('button has aria-label for tappable header', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(
      <GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" letterChars={LETTER_CHARS} />,
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Tap to hear letter names');
  });

  it('inner label div has aria-label Current group: {label}', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    const { container } = render(
      <GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" letterChars={LETTER_CHARS} />,
    );

    const button = container.firstElementChild;
    const labelDiv = button?.querySelector('[aria-label]');
    expect(labelDiv?.getAttribute('aria-label')).toBe('Current group: ا ب ت');
  });

  it('each glyph span has aria-hidden true', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    const { container } = render(
      <GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" letterChars={LETTER_CHARS} />,
    );

    const glyphSpans = container.querySelectorAll('[aria-hidden="true"]');
    expect(glyphSpans).toHaveLength(3);
  });

  // ── Audio playback tests ─────────────────────────────────────────────
  //
  // Use userEvent (which handles click dispatch properly under jsdom) +
  // vi.waitFor (which polls until the assertion passes). This avoids the
  // issue where fireEvent.click doesn't dispatch under fake timers.
  // Real timers throughout — slower but reliable.

  describe('audio playback', () => {
    it('tapping calls audioEngine.speak() for each letter with vowelMode none', async () => {
      const user = userEvent.setup();
      const { GroupHeader } = await import('./GroupHeader');
      render(
        <GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" letterChars={LETTER_CHARS} />,
      );

      await user.click(screen.getByRole('button'));

      // setTimeout(0) — fires after the event loop pumps
      await vi.waitFor(() => {
        expect(speakMock).toHaveBeenCalledWith('alif', 'none', 'ا');
      });

      // 300ms later — second letter
      await vi.waitFor(() => {
        expect(speakMock).toHaveBeenCalledWith('ba', 'none', 'ب');
      }, { timeout: 500 });

      // 600ms later — third letter
      await vi.waitFor(() => {
        expect(speakMock).toHaveBeenCalledWith('ta', 'none', 'ت');
      }, { timeout: 500 });
    });

    it('incomplete groups speak only available letters', async () => {
      const user = userEvent.setup();
      const { GroupHeader } = await import('./GroupHeader');
      render(
        <GroupHeader group={INCOMPLETE_GROUP} vowelMode="fathah" letterChars={LETTER_CHARS} />,
      );

      await user.click(screen.getByRole('button'));

      await vi.waitFor(() => {
        expect(speakMock).toHaveBeenCalledWith('kho', 'none', 'خ');
      });

      await vi.waitFor(() => {
        expect(speakMock).toHaveBeenCalledWith('dal', 'none', 'د');
      }, { timeout: 500 });

      expect(speakMock).toHaveBeenCalledTimes(2);
    });

    it('rapid retaps cancel previous sequence and start new one', async () => {
      const user = userEvent.setup();
      const { GroupHeader } = await import('./GroupHeader');
      render(
        <GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" letterChars={LETTER_CHARS} />,
      );

      const button = screen.getByRole('button');

      // First tap — await it so the click handler fires
      await user.click(button);
      expect(cancelMock).toHaveBeenCalledTimes(1);          // cancel for clean start
      // First letter on setTimeout(0) fires after event loop pump
      await vi.waitFor(() => expect(speakMock).toHaveBeenCalledTimes(1));

      // Now the 300ms timeout is pending. Rapid second tap —
      // this should cancel the pending timeout and restart.
      await user.click(button);
      expect(cancelMock).toHaveBeenCalledTimes(2);          // cancel for retap

      // Only one new speak call (the retap's first letter)
      await vi.waitFor(() => expect(speakMock).toHaveBeenCalledTimes(2));
    });
  });
});
