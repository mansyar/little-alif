// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReadingGroup } from '~/lib/utils/reading';

const GROUPS: ReadingGroup[] = [
  { id: 1, letters: ['alif', 'ba', 'ta'], label: 'ا ب ت', isComplete: true },
  { id: 2, letters: ['tsa', 'jim', 'ha'], label: 'ث ج ح', isComplete: true },
  { id: 3, letters: ['kho', 'dal'], label: 'خ د', isComplete: false },
];

describe('GroupPills', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders one button per group', async () => {
    const { GroupPills } = await import('./GroupPills');
    render(<GroupPills groups={GROUPS} activeIndex={0} onSelect={vi.fn()} />);

    const buttons = screen.getAllByRole('tab');
    expect(buttons).toHaveLength(3);
  });

  it('active group has the active styling class', async () => {
    const { GroupPills } = await import('./GroupPills');
    render(<GroupPills groups={GROUPS} activeIndex={0} onSelect={vi.fn()} />);

    const buttons = screen.getAllByRole('tab');
    expect(buttons[0]!.className).toContain('bg-green');
    expect(buttons[0]!.className).toContain('text-white');
  });

  it('complete inactive groups have outline style and are enabled', async () => {
    const { GroupPills } = await import('./GroupPills');
    const onSelect = vi.fn();
    render(<GroupPills groups={GROUPS} activeIndex={0} onSelect={onSelect} />);

    const buttons = screen.getAllByRole('tab');
    // Second button (index 1) is complete and inactive
    expect(buttons[1]!.className).toContain('border-green');
    expect(buttons[1]!.className).toContain('text-green-dark');
    expect(buttons[1]!.getAttribute('aria-disabled')).toBeNull();
    expect((buttons[1]! as HTMLButtonElement).disabled).toBe(false);
  });

  it('incomplete inactive groups are disabled with title and aria-disabled', async () => {
    const { GroupPills } = await import('./GroupPills');
    render(<GroupPills groups={GROUPS} activeIndex={0} onSelect={vi.fn()} />);

    const buttons = screen.getAllByRole('tab');
    // Third button (index 2) is incomplete and inactive
    expect(buttons[2]!.className).toContain('border-sand-dark');
    expect(buttons[2]!.className).toContain('text-text-muted');
    expect((buttons[2]! as HTMLButtonElement).disabled).toBe(true);
    expect(buttons[2]!.getAttribute('aria-disabled')).toBe('true');
    expect(buttons[2]!.getAttribute('title')).toBe('Needs 3 letters');
  });

  it('clicking active group pill does not call onSelect', async () => {
    const { GroupPills } = await import('./GroupPills');
    const onSelect = vi.fn();
    render(<GroupPills groups={GROUPS} activeIndex={0} onSelect={onSelect} />);

    const buttons = screen.getAllByRole('tab');
    const user = userEvent.setup();
    await user.click(buttons[0]!);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('clicking complete inactive group pill calls onSelect with that index', async () => {
    const { GroupPills } = await import('./GroupPills');
    const onSelect = vi.fn();
    render(<GroupPills groups={GROUPS} activeIndex={0} onSelect={onSelect} />);

    const buttons = screen.getAllByRole('tab');
    const user = userEvent.setup();
    await user.click(buttons[1]!);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('clicking incomplete group pill is a no-op', async () => {
    const { GroupPills } = await import('./GroupPills');
    const onSelect = vi.fn();
    render(<GroupPills groups={GROUPS} activeIndex={0} onSelect={onSelect} />);

    const buttons = screen.getAllByRole('tab');
    const user = userEvent.setup();
    await user.click(buttons[2]!);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('each pill has aria-label and active pill has aria-current', async () => {
    const { GroupPills } = await import('./GroupPills');
    render(<GroupPills groups={GROUPS} activeIndex={1} onSelect={vi.fn()} />);

    const pills = screen.getAllByRole('tab');
    expect(pills[0]!.getAttribute('aria-label')).toContain('ا ب ت');
    expect(pills[1]!.getAttribute('aria-label')).toContain('ث ج ح');
    expect(pills[2]!.getAttribute('aria-label')).toContain('خ د');

    expect(pills[0]!.getAttribute('aria-current')).toBeNull();
    expect(pills[1]!.getAttribute('aria-current')).toBe('true');
    expect(pills[2]!.getAttribute('aria-current')).toBeNull();
  });

  it('container has overflow-x-auto for horizontal scrolling', async () => {
    const { GroupPills } = await import('./GroupPills');
    const { container } = render(<GroupPills groups={GROUPS} activeIndex={0} onSelect={vi.fn()} />);

    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist?.className).toContain('overflow-x-auto');
  });
});
