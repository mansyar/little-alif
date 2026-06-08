// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '~/stores/ui-store';
import type { ReadingGroup } from '~/lib/utils/reading';

interface ReadingCellMockProps {
  glyph: string;
  letterId: string;
  vowelMode: string;
  letterChar: string;
  isSystematicRow?: boolean;
  onTap?: () => void;
}

const mockCell = vi.fn<(props: ReadingCellMockProps) => void>();

vi.mock('./ReadingCell', () => ({
  ReadingCell: (props: ReadingCellMockProps) => {
    mockCell(props);
    return (
      <button data-testid="reading-cell" data-glyph={props.glyph} onClick={() => props.onTap?.()}>
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

  it('does not render the Pattern label anywhere', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    render(<ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    expect(screen.queryByText('Pattern')).toBeNull();
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
    expect(cells).toHaveLength(18); // 6 rows × 3 cells (1 per letter, composed with currentHarakat)
  });

  it('incomplete group (2 letters) renders 2 cells per row', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    render(<ReadingGrid group={TWO_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    const cells = screen.getAllByTestId('reading-cell');
    expect(cells).toHaveLength(12); // 6 rows × 2 cells
  });

  it('currentHarakat change re-renders cells with new vowelMode and new glyph', async () => {
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
    const lastBatchIndex = callsAfter.length - 18; // last 18 calls are from rerender
    expect(callsAfter[lastBatchIndex]![0].vowelMode).toBe('kasrah');
  });

  it('randomHarakats applies per-cell random vowels instead of currentHarakat', async () => {
    useUiStore.setState({ currentHarakat: 'fathah' });
    mockCell.mockClear();

    const { ReadingGrid } = await import('./ReadingGrid');

    // Provide random harakat: row 0 = all kasrah, row 1 = all dammah
    const randomHarakats: ('fathah' | 'kasrah' | 'dammah')[][] = [
      ['kasrah', 'kasrah', 'kasrah'],
      ['dammah', 'dammah', 'dammah'],
      ['kasrah', 'kasrah', 'kasrah'],
      ['dammah', 'dammah', 'dammah'],
      ['kasrah', 'kasrah', 'kasrah'],
      ['dammah', 'dammah', 'dammah'],
    ];

    render(
      <ReadingGrid
        group={THREE_LETTER_GROUP}
        letterChars={LETTER_CHARS}
        randomHarakats={randomHarakats}
      />,
    );

    // Row 0 cells should use 'kasrah' not 'fathah'
    const cells = screen.getAllByTestId('reading-cell');
    expect(cells).toHaveLength(18);

    // First 3 cells (row 0) should have vowelMode='kasrah'
    const calls = mockCell.mock.calls;
    expect(calls[0]![0].vowelMode).toBe('kasrah');
    expect(calls[1]![0].vowelMode).toBe('kasrah');
    expect(calls[2]![0].vowelMode).toBe('kasrah');

    // Next 3 cells (row 1) should have vowelMode='dammah'
    expect(calls[3]![0].vowelMode).toBe('dammah');
    expect(calls[4]![0].vowelMode).toBe('dammah');
    expect(calls[5]![0].vowelMode).toBe('dammah');
  });

  // ── Row progress indicator tests ─────────────────────────────────────

  it('untapped row shows no completion indicator', async () => {
    const { ReadingGrid } = await import('./ReadingGrid');
    const { container } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    // No element should have the green border class
    const bordered = container.querySelectorAll('.border-2');
    expect(bordered).toHaveLength(0);
  });

  it('fully tapped row shows checkmark and green border', async () => {
    const user = userEvent.setup();
    const { ReadingGrid } = await import('./ReadingGrid');
    const { container, rerender } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    // Tap all cells in the first row (cells 0, 1, 2)
    const cells = screen.getAllByTestId('reading-cell');
    await user.click(cells[0]!);
    await user.click(cells[1]!);
    await user.click(cells[2]!);

    // useState pick up after click
    rerender(<ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    // Checkmark should appear — find the span inside the row container
    const checkmarks = container.querySelectorAll('.rounded-full');
    const visibleCheckmarks = Array.from(checkmarks).filter((el) => el.textContent === '✓');
    expect(visibleCheckmarks.length).toBeGreaterThanOrEqual(1);

    // Border class should appear
    const bordered = container.querySelectorAll('.border-2');
    expect(bordered.length).toBeGreaterThanOrEqual(1);
  });

  it('partial row tap updates aria-label with count', async () => {
    const user = userEvent.setup();
    const { ReadingGrid } = await import('./ReadingGrid');
    const { rerender } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    // Tap one cell in first row
    const cells = screen.getAllByTestId('reading-cell');
    await user.click(cells[0]!);

    rerender(<ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    // First outer div should reflect 1 of 3 tapped
    const outerDivs = document.querySelectorAll('[class*="rounded-large"]');
    const firstRow = outerDivs[0];
    expect(firstRow?.getAttribute('aria-label')).toBe('Row 1: 1 of 3 tapped');
  });

  it('complete row has aria-label indicating complete', async () => {
    const user = userEvent.setup();
    const { ReadingGrid } = await import('./ReadingGrid');
    const { rerender } = render(
      <ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />,
    );

    // Tap all 3 cells in first row
    const cells = screen.getAllByTestId('reading-cell');
    await user.click(cells[0]!);
    await user.click(cells[1]!);
    await user.click(cells[2]!);

    rerender(<ReadingGrid group={THREE_LETTER_GROUP} letterChars={LETTER_CHARS} />);

    const outerDivs = document.querySelectorAll('[class*="rounded-large"]');
    const firstRow = outerDivs[0];
    expect(firstRow?.getAttribute('aria-label')).toBe('Row 1: complete');
  });

  it('randomHarakats re-renders when seed changes', async () => {
    useUiStore.setState({ currentHarakat: 'fathah' });
    mockCell.mockClear();

    const { ReadingGrid } = await import('./ReadingGrid');

    const firstHarakats: ('fathah' | 'kasrah' | 'dammah')[][] = [
      ['fathah', 'fathah', 'fathah'],
      ['fathah', 'fathah', 'fathah'],
      ['fathah', 'fathah', 'fathah'],
      ['fathah', 'fathah', 'fathah'],
      ['fathah', 'fathah', 'fathah'],
      ['fathah', 'fathah', 'fathah'],
    ];

    const secondHarakats: ('fathah' | 'kasrah' | 'dammah')[][] = [
      ['kasrah', 'kasrah', 'kasrah'],
      ['kasrah', 'kasrah', 'kasrah'],
      ['kasrah', 'kasrah', 'kasrah'],
      ['kasrah', 'kasrah', 'kasrah'],
      ['kasrah', 'kasrah', 'kasrah'],
      ['kasrah', 'kasrah', 'kasrah'],
    ];

    const { rerender } = render(
      <ReadingGrid
        group={THREE_LETTER_GROUP}
        letterChars={LETTER_CHARS}
        randomHarakats={firstHarakats}
      />,
    );

    const callsAfterFirst = mockCell.mock.calls.length;
    expect(callsAfterFirst).toBe(18);

    rerender(
      <ReadingGrid
        group={THREE_LETTER_GROUP}
        letterChars={LETTER_CHARS}
        randomHarakats={secondHarakats}
      />,
    );

    // After re-render, all cells should show kasrah
    const callsAfterSecond = mockCell.mock.calls;
    const lastBatchStart = callsAfterSecond.length - 18;
    expect(callsAfterSecond[lastBatchStart]![0].vowelMode).toBe('kasrah');
  });
});
