// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '~/stores/ui-store';
import { writeHarakatCookie } from '~/lib/utils/harakat-cookie';

describe('ChildHarakatBar', () => {
  beforeEach(() => {
    // Clear store
    useUiStore.setState({
      selectedLetterId: null,
      isLoading: false,
      toasts: [],
      currentHarakat: 'fathah',
    });

    // Clear all cookies
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0]?.trim();
      if (name) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
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

  describe('harakat cookie persistence', () => {
    it('initializes from valid cookie value on mount', async () => {
      // Set cookie before component mounts
      writeHarakatCookie('dammah');

      const { ChildHarakatBar } = await import('./ChildHarakatBar');
      render(<ChildHarakatBar />);

      // Store should be updated from cookie
      expect(useUiStore.getState().currentHarakat).toBe('dammah');
    });

    it('falls back to current store value when no cookie exists', async () => {
      const { ChildHarakatBar } = await import('./ChildHarakatBar');
      render(<ChildHarakatBar />);

      // Store should keep its default value
      expect(useUiStore.getState().currentHarakat).toBe('fathah');
    });

    it('falls back to current store value when cookie is corrupt', async () => {
      document.cookie = 'little-alif-harakat=invalid; path=/';

      const { ChildHarakatBar } = await import('./ChildHarakatBar');
      render(<ChildHarakatBar />);

      // Store should keep its default value
      expect(useUiStore.getState().currentHarakat).toBe('fathah');
    });

    it('writes cookie when child taps a different harakat', async () => {
      const { ChildHarakatBar } = await import('./ChildHarakatBar');
      render(<ChildHarakatBar />);

      const dammahButton = screen.getByLabelText('Dammah');
      const user = userEvent.setup();
      await user.click(dammahButton);

      expect(document.cookie).toContain('little-alif-harakat=dammah');
    });

    it('clicking Plain mode writes "none" to cookie', async () => {
      const { ChildHarakatBar } = await import('./ChildHarakatBar');
      render(<ChildHarakatBar />);

      const plainButton = screen.getByLabelText('Plain');
      const user = userEvent.setup();
      await user.click(plainButton);

      expect(document.cookie).toContain('little-alif-harakat=none');
    });
  });
});
