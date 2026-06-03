// @vitest-environment jsdom
import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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

describe('GroupHeader', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders 3 Arabic glyphs composed via composeLetter for a complete group', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(<GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" />);

    // Expect 3 aria-hidden glyphs for the 3 letters
    expect(screen.getByText(composeLetter('ا', 'fathah'))).toBeTruthy();
    expect(screen.getByText(composeLetter('ب', 'fathah'))).toBeTruthy();
    expect(screen.getByText(composeLetter('ت', 'fathah'))).toBeTruthy();
  });

  it('renders 2 composed glyphs for an incomplete group', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(<GroupHeader group={INCOMPLETE_GROUP} vowelMode="kasrah" />);

    expect(screen.getByText(composeLetter('خ', 'kasrah'))).toBeTruthy();
    expect(screen.getByText(composeLetter('د', 'kasrah'))).toBeTruthy();
  });

  it('re-renders with new glyphs when vowelMode changes', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    const { rerender } = render(<GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" />);

    expect(screen.getByText(composeLetter('ا', 'fathah'))).toBeTruthy();

    rerender(<GroupHeader group={COMPLETE_GROUP} vowelMode="dammah" />);

    expect(screen.getByText(composeLetter('ا', 'dammah'))).toBeTruthy();
  });

  it('incomplete group renders (N/3) hint below glyphs', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(<GroupHeader group={INCOMPLETE_GROUP} vowelMode="none" />);

    expect(screen.getByText('(2/3)')).toBeTruthy();
  });

  it('complete group does not render (N/3) hint', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    render(
      <GroupHeader
        group={{ ...COMPLETE_GROUP, letters: ['alif', 'ba', 'ta'] }}
        vowelMode="fathah"
      />,
    );

    expect(screen.queryByText(/\(\d+\/3\)/)).toBeNull();
  });

  it('container has aria-label Current group: {label}', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    const { container } = render(<GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" />);

    const groupDiv = container.firstElementChild;
    expect(groupDiv?.getAttribute('aria-label')).toBe('Current group: ا ب ت');
  });

  it('each glyph span has aria-hidden true', async () => {
    const { GroupHeader } = await import('./GroupHeader');
    const { container } = render(<GroupHeader group={COMPLETE_GROUP} vowelMode="fathah" />);

    const glyphSpans = container.querySelectorAll('[aria-hidden="true"]');
    expect(glyphSpans).toHaveLength(3);
  });
});
