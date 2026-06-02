// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { useUiStore } from '~/stores/ui-store';
import type { VisibleLetter } from '~/server/letters';
import type { VowelMode } from '~/lib/utils/harakat';

vi.mock('./LetterCard', () => ({
  LetterCard: ({ letter }: { letter: VisibleLetter }) => (
    <button data-testid="letter-card" data-letter-id={letter.letterId}>
      {letter.letterId}
    </button>
  ),
}));

vi.mock('./LetterDetail', () => ({
  LetterDetail: () => <div data-testid="letter-detail" />,
}));

import { LetterGrid } from './LetterGrid';

const letters: VisibleLetter[] = [
  { letterId: 'alif', character: 'ا', displayOrder: 1, audioFile: '', isVisible: true },
  { letterId: 'ba', character: 'ب', displayOrder: 2, audioFile: '', isVisible: true },
  { letterId: 'ta', character: 'ت', displayOrder: 3, audioFile: '', isVisible: true },
];

describe('LetterGrid', () => {
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

  it('renders one LetterCard per letter in visibleLetters, in the order given', () => {
    render(<LetterGrid visibleLetters={letters} currentHarakat="fathah" />);

    const cards = screen.getAllByTestId('letter-card');
    expect(cards).toHaveLength(3);
    expect(within(cards[0]!).getByText('alif')).toBeTruthy();
    expect(within(cards[1]!).getByText('ba')).toBeTruthy();
    expect(within(cards[2]!).getByText('ta')).toBeTruthy();
  });

  it('renders EmptyState when visibleLetters is an empty array', () => {
    const { container } = render(<LetterGrid visibleLetters={[]} currentHarakat="fathah" />);

    // No LetterCard mocks should be present.
    expect(screen.queryAllByTestId('letter-card')).toHaveLength(0);
    // The Lucide BookOpen icon from the real EmptyState component.
    expect(container.querySelector('svg.lucide-book-open')).toBeTruthy();
  });

  it('renders LetterDetail (the overlay) regardless of visibleLetters.length', () => {
    // Case 1: with letters
    const { unmount } = render(<LetterGrid visibleLetters={letters} currentHarakat="fathah" />);
    expect(screen.getByTestId('letter-detail')).toBeTruthy();
    unmount();

    // Case 2: empty
    render(<LetterGrid visibleLetters={[]} currentHarakat="fathah" />);
    expect(screen.getByTestId('letter-detail')).toBeTruthy();
  });

  it('applies the responsive grid template (auto-fill, minmax(80px, 1fr))', () => {
    const { container } = render(<LetterGrid visibleLetters={letters} currentHarakat="fathah" />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    // Tailwind's arbitrary value class for grid-template-columns.
    expect(grid?.className).toMatch(/grid-cols-\[repeat\(auto-fill/);
  });
});
