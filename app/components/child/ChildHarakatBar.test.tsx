// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '~/stores/ui-store';

describe('ChildHarakatBar', () => {
  beforeEach(() => {
    useUiStore.setState({
      selectedLetterId: null,
      isLoading: false,
      toasts: [],
      currentHarakat: 'fathah',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all 4 vowel mode buttons', async () => {
    const { ChildHarakatBar } = await import('./ChildHarakatBar');
    render(<ChildHarakatBar />);

    expect(screen.getByText('Plain')).toBeTruthy();
    expect(screen.getByText('Fathah')).toBeTruthy();
    expect(screen.getByText('Kasrah')).toBeTruthy();
    expect(screen.getByText('Dammah')).toBeTruthy();
  });

  it('clicking a button updates ui-store currentHarakat', async () => {
    const { ChildHarakatBar } = await import('./ChildHarakatBar');
    render(<ChildHarakatBar />);

    const dammahButton = screen.getByLabelText('Dammah');
    const user = userEvent.setup();
    await user.click(dammahButton);

    expect(useUiStore.getState().currentHarakat).toBe('dammah');
  });

  it('clicking Dammah highlights it as active', async () => {
    const { ChildHarakatBar } = await import('./ChildHarakatBar');
    render(<ChildHarakatBar />);

    const dammahButton = screen.getByLabelText('Dammah');
    const user = userEvent.setup();
    await user.click(dammahButton);

    expect(dammahButton.className).toContain('bg-green');
  });

  it('clicking Plain mode sets harakat to none', async () => {
    const { ChildHarakatBar } = await import('./ChildHarakatBar');
    render(<ChildHarakatBar />);

    const plainButton = screen.getByLabelText('Plain');
    const user = userEvent.setup();
    await user.click(plainButton);

    expect(useUiStore.getState().currentHarakat).toBe('none');
  });
});
