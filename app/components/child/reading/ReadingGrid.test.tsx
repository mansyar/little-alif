// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useUiStore } from '~/stores/ui-store';
import type { ReadingGroup } from '~/lib/utils/reading';

interface ReadingCellMockProps {
  glyph: string;
  letterId: string;
  vowelMode: string;
  letterChar: string;
}

const mockCell = vi.fn<(props: ReadingCellMockProps) => void>();

vi.mock('./ReadingCell', () => ({
  ReadingCell: (props: ReadingCellMockProps) => {
    mockCell(props);
    return (
      <button data-testid="reading-cell" data-glyph={props.glyph}>
        {props.glyph}
      </button>
    );
  },
}));

const THREE_LETTER_GROUP: ReadingGroup = {
  id: 1,
  letters: ['alif', 'ba', 'ta'],
  label: 'ا ب ت',
  isComplete: true,
};

const TWO_LETTER_GROUP: ReadingGroup = {
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

describe('ReadingGrid', () => {
  beforeEach(() => {
    useUiStore.setState({ currentHarakat: 'fathah' });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders 6 rows for a complete 3-letter group', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    const { container } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    const rows = container.querySelectorAll('[role="row"]');
    expect(rows).toHaveLength(6);
  });

  it('row 0 has the Pattern label; rows 1-5 do not', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    render(<ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    const patternLabels = screen.getAllByText('Pattern');
    expect(patternLabels).toHaveLength(1);

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(6);

    const firstRowParent = rows[0]!.parentElement;
    expect(firstRowParent?.querySelector('[aria-hidden="true"]')?.textContent).toBe('Pattern');
  });

  it('container has role grid with aria-rowcount 6', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    const { container } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    const grid = container.querySelector('[role="grid"]');
    expect(grid).toBeTruthy();
    expect(grid?.getAttribute('aria-rowcount')).toBe('6');
  });

  it('each row has aria-rowindex', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    const { container } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    const rows = container.querySelectorAll('[role="row"]');
    rows.forEach((row, index) => {
      expect(row.getAttribute('aria-rowindex')).toBe(String(index + 1));
    });
  });

  it('each row contains the expected number of ReadingCell elements', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    render(<ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    const cells = screen.getAllByTestId('reading-cell');
    expect(cells).toHaveLength(54); // 6 rows × 9 cells
  });

  it('incomplete group (2 letters) renders 6 cells per row instead of 9', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    render(<ReadingGrid group={TWO_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    const cells = screen.getAllByTestId('reading-cell');
    expect(cells).toHaveLength(36); // 6 rows × 6 cells
  });

  it('currentHarakat change re-renders cells with new vowelMode', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    const { rerender } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    // All cells should receive vowelMode='fathah' initially
    expect(mockCell.mock.calls.length).toBeGreaterThan(0);
    expect(mockCell.mock.calls[0]![0].vowelMode).toBe('fathah');

    // Change harakat
    useUiStore.setState({ currentHarakat: 'kasrah' });

    // Re-render to pick up the new store value
    rerender(<ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    // After re-render, the last batch of calls should have vowelMode='kasrah'
    const callsAfter = mockCell.mock.calls;
    const lastBatchIndex = callsAfter.length - 54; // last 54 calls are from rerender
    expect(callsAfter[lastBatchIndex]![0].vowelMode).toBe('kasrah');
  });

  it('Pattern label is aria-hidden', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    const { container } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    const pattern = container.querySelector('[aria-hidden="true"]');
    expect(pattern?.textContent).toBe('Pattern');
  });
});
