// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useUiStore } from '~/stores/ui-store';
import { composeLetter } from '~/lib/utils/harakat';
import type { VowelMode } from '~/lib/utils/harakat';
import type { VisibleLetter } from '~/server/letters';

import { LetterDetail } from './LetterDetail';

const visibleLetters: VisibleLetter[] = [
  { letterId: 'alif', character: 'ا', displayOrder: 1, audioFile: '', isVisible: true },
  { letterId: 'ba', character: 'ب', displayOrder: 2, audioFile: '', isVisible: true },
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
  });

  it('renders nothing when useUiStore.selectedLetterId is null', () => {
    const { container } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders the composed glyph at large size (≥ text-8xl) when selectedLetterId is set', () => {
    useUiStore.setState({ selectedLetterId: 'alif' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    // composeLetter('ا', 'fathah') → 'اَ'
    const expected = composeLetter('ا', 'fathah');
    const glyph = screen.getByText(expected);

    expect(glyph).toBeTruthy();
    // Large enough: must contain at least one of text-8xl/9xl (the plan/spec uses text-9xl).
    expect(glyph.className).toMatch(/text-8xl|text-9xl/);
  });

  it('positions the overlay with fixed inset-0 z-50 (full-screen)', () => {
    useUiStore.setState({ selectedLetterId: 'alif' });

    const { container } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    const overlay = container.firstElementChild as HTMLElement;
    expect(overlay.className).toContain('fixed');
    expect(overlay.className).toContain('inset-0');
    expect(overlay.className).toContain('z-50');
  });

  it('looks up the character from visibleLetters by selectedLetterId', () => {
    useUiStore.setState({ selectedLetterId: 'ba' });

    render(<LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />);

    // ba is 'ب' with fathah → 'بَ'
    const expected = composeLetter('ب', 'fathah');
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('re-renders the glyph when currentHarakat prop changes', () => {
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

  it('overlay has animate-bounceIn entrance animation class when open', () => {
  useUiStore.setState({ selectedLetterId: 'alif' });

  const { container } = render(
    <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
  );

  const overlay = container.firstElementChild as HTMLElement;
  expect(overlay.className).toContain('animate-bounceIn');
});

it('renders nothing when selectedLetterId is set but does not match any visible letter', () => {
    useUiStore.setState({ selectedLetterId: 'non-existent' });

    const { container } = render(
      <LetterDetail visibleLetters={visibleLetters} currentHarakat="fathah" />,
    );

    // No crash; the overlay just doesn't show because the letter can't be composed.
    expect(container.firstChild).toBeNull();
  });
});
