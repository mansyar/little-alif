// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const speakMock = vi.fn();
const resolves: (() => void)[] = [];

vi.mock('~/lib/audio/audio-engine', () => ({
  audioEngine: {
    speak: (...args: unknown[]) => {
      speakMock(...args);
      return new Promise<void>((resolve) => {
        resolves.push(resolve);
      });
    },
  },
}));

describe('ReadingCell', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    resolves.length = 0;
  });

  it('renders the glyph prop in the cell', async () => {
    const { ReadingCell } = await import('./ReadingCell');
    render(<ReadingCell glyph="بَ" letterId="ba" vowelMode="fathah" letterChar="ب" />);

    expect(screen.getByText('بَ')).toBeTruthy();
  });

  it('tap calls audioEngine.speak(letterId, vowelMode)', async () => {
    const user = userEvent.setup();
    const { ReadingCell } = await import('./ReadingCell');
    render(<ReadingCell glyph="بِ" letterId="ba" vowelMode="kasrah" letterChar="ب" />);

    await user.click(screen.getByRole('button'));

    expect(speakMock).toHaveBeenCalledWith('ba', 'kasrah', 'ب');
  });

  it('tap sets data-flashed to true', async () => {
    const user = userEvent.setup();
    const { ReadingCell } = await import('./ReadingCell');
    render(<ReadingCell glyph="بَ" letterId="ba" vowelMode="fathah" letterChar="ب" />);

    const button = screen.getByRole('button');
    expect(button.getAttribute('data-flashed')).toBe('false');

    await user.click(button);

    expect(button.getAttribute('data-flashed')).toBe('true');
  });

  it('when speak() resolves, data-flashed returns to false', async () => {
    const user = userEvent.setup();
    const { ReadingCell } = await import('./ReadingCell');
    render(<ReadingCell glyph="بَ" letterId="ba" vowelMode="fathah" letterChar="ب" />);

    const button = screen.getByRole('button');
    await user.click(button);
    expect(button.getAttribute('data-flashed')).toBe('true');

    act(() => {
      resolves[0]!();
    });

    await waitFor(() => {
      expect(button.getAttribute('data-flashed')).toBe('false');
    });
  });

  it('tapping a second cell does not affect the first cells flashed state', async () => {
    const user = userEvent.setup();
    const { ReadingCell } = await import('./ReadingCell');
    render(
      <div>
        <ReadingCell glyph="بَ" letterId="ba" vowelMode="fathah" letterChar="ب" />
        <ReadingCell glyph="تَ" letterId="ta" vowelMode="fathah" letterChar="ت" />
      </div>,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]!);
    expect(buttons[0]!.getAttribute('data-flashed')).toBe('true');
    expect(buttons[1]!.getAttribute('data-flashed')).toBe('false');

    await user.click(buttons[1]!);
    expect(buttons[0]!.getAttribute('data-flashed')).toBe('true');
    expect(buttons[1]!.getAttribute('data-flashed')).toBe('true');

    act(() => {
      resolves[0]!();
      resolves[1]!();
    });

    await waitFor(() => {
      expect(buttons[0]!.getAttribute('data-flashed')).toBe('false');
      expect(buttons[1]!.getAttribute('data-flashed')).toBe('false');
    });
  });

  it('cell has min-h-[56px] min-w-[56px] and aspect-square', async () => {
    const { ReadingCell } = await import('./ReadingCell');
    const { container } = render(
      <ReadingCell glyph="بَ" letterId="ba" vowelMode="fathah" letterChar="ب" />,
    );

    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button!.className).toContain('min-h-[56px]');
    expect(button!.className).toContain('min-w-[56px]');
    expect(button!.className).toContain('aspect-square');
  });

  it('aria-label is "{letterId} {vowelMode}"', async () => {
    const { ReadingCell } = await import('./ReadingCell');
    render(<ReadingCell glyph="بَ" letterId="ba" vowelMode="fathah" letterChar="ب" />);

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('ba fathah');
  });

  it('glyph span has aria-hidden true', async () => {
    const { ReadingCell } = await import('./ReadingCell');
    const { container } = render(
      <ReadingCell glyph="بَ" letterId="ba" vowelMode="fathah" letterChar="ب" />,
    );

    const spans = container.querySelectorAll('[aria-hidden="true"]');
    expect(spans).toHaveLength(1);
    expect(spans[0]!.textContent).toBe('بَ');
  });
});
