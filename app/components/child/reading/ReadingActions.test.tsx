// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReadingGroup } from '~/lib/utils/reading';

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      READING_SHUFFLE: () => 'X_SHUFFLE',
      READING_DONE: () => 'X_DONE',
      READING_NEXT_GROUP: () => 'X_NEXT_GROUP',
      READING_RANDOMIZE: () => 'X_RANDOMIZE',
      READING_PATTERN_LABEL: () => 'X_PATTERN',
    },
  }),
}));

const mockOnShuffle = vi.fn();
const mockOnNext = vi.fn();
const mockOnDone = vi.fn();
const mockOnRandomizeHarakat = vi.fn();

const TWO_GROUPS: ReadingGroup[] = [
  { id: 1, letters: ['alif', 'ba', 'ta'], label: 'ا ب ت', isComplete: true },
  { id: 2, letters: ['jim', 'ha', 'kho'], label: 'ج ح خ', isComplete: true },
];

const SINGLE_GROUP: ReadingGroup[] = [
  { id: 1, letters: ['alif', 'ba', 'ta'], label: 'ا ب ت', isComplete: true },
];

describe('ReadingActions', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders translated text from LL calls for all buttons', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    render(
      <ReadingActions
        groups={TWO_GROUPS}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    expect(screen.getByText('X_RANDOMIZE')).toBeTruthy();
    expect(screen.getByText('X_SHUFFLE')).toBeTruthy();
    expect(screen.getByText('X_NEXT_GROUP')).toBeTruthy();
    expect(screen.getByText('X_DONE')).toBeTruthy();
  });

  it('renders Random, Shuffle, Next Group, Done buttons for multiple groups', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    render(
      <ReadingActions
        groups={TWO_GROUPS}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    expect(screen.getByRole('button', { name: 'X_RANDOMIZE' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'X_SHUFFLE' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'X_NEXT_GROUP' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'X_DONE' })).toBeTruthy();
  });

  it('renders Random + Shuffle + Done for single group (no Next Group)', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    render(
      <ReadingActions
        groups={SINGLE_GROUP}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    expect(screen.getByRole('button', { name: 'X_RANDOMIZE' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'X_SHUFFLE' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'X_NEXT_GROUP' })).toBeNull();
    expect(screen.getByRole('button', { name: 'X_DONE' })).toBeTruthy();
  });

  it('clicking Shuffle calls onShuffle once', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    const user = userEvent.setup();
    render(
      <ReadingActions
        groups={TWO_GROUPS}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'X_SHUFFLE' }));
    expect(mockOnShuffle).toHaveBeenCalledTimes(1);
  });

  it('clicking Next Group calls onNext once', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    const user = userEvent.setup();
    render(
      <ReadingActions
        groups={TWO_GROUPS}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'X_NEXT_GROUP' }));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('clicking Done calls onDone once', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    const user = userEvent.setup();
    render(
      <ReadingActions
        groups={TWO_GROUPS}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'X_DONE' }));
    expect(mockOnDone).toHaveBeenCalledTimes(1);
  });

  it('clicking Randomize vowel calls onRandomizeHarakat once', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    const user = userEvent.setup();
    render(
      <ReadingActions
        groups={TWO_GROUPS}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'X_RANDOMIZE' }));
    expect(mockOnRandomizeHarakat).toHaveBeenCalledTimes(1);
  });

  it('all buttons have min-h-[56px]', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    render(
      <ReadingActions
        groups={TWO_GROUPS}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button.className).toContain('min-h-[56px]');
    }
  });

  it('Lucide icons Dices, Shuffle, ChevronRight, Check are rendered inside buttons', async () => {
    const { ReadingActions } = await import('./ReadingActions');
    const { container } = render(
      <ReadingActions
        groups={TWO_GROUPS}
        onShuffle={mockOnShuffle}
        onNext={mockOnNext}
        onDone={mockOnDone}
        onRandomizeHarakat={mockOnRandomizeHarakat}
      />,
    );

    // Icons are rendered as SVG elements inside each button
    const svgs = container.querySelectorAll('button svg');
    expect(svgs.length).toBe(4); // Dices + Shuffle + ChevronRight + Check
  });
});
