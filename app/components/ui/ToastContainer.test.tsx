// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '~/stores/ui-store';
import { ToastContainer } from './ToastContainer';

describe('ToastContainer', () => {
  afterEach(() => {
    cleanup();
    useUiStore.setState({ toasts: [] });
  });

  // ─── Rendering tests (no timers needed) ─────────────────────────────

  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all toasts from the store', () => {
    useUiStore.setState({
      toasts: [
        { id: '1', variant: 'success', message: 'Saved!' },
        { id: '2', variant: 'error', message: 'Failed!' },
      ],
    });

    render(<ToastContainer />);
    expect(screen.getByText('Saved!')).toBeTruthy();
    expect(screen.getByText('Failed!')).toBeTruthy();
  });

  it('renders success variant with appropriate styling', () => {
    useUiStore.setState({
      toasts: [{ id: '1', variant: 'success', message: 'Success!' }],
    });

    render(<ToastContainer />);
    const toast = screen.getByText('Success!');
    expect(toast.className).toContain('green');
  });

  it('renders error variant with appropriate styling', () => {
    useUiStore.setState({
      toasts: [{ id: '1', variant: 'error', message: 'Error!' }],
    });

    render(<ToastContainer />);
    const toast = screen.getByText('Error!');
    expect(toast.className).toContain('red');
  });

  it('renders info variant with appropriate styling', () => {
    useUiStore.setState({
      toasts: [{ id: '1', variant: 'info', message: 'Info!' }],
    });

    render(<ToastContainer />);
    const toast = screen.getByText('Info!');
    expect(toast.className).toContain('text');
  });

  // ─── Interaction tests (real timers for userEvent) ──────────────────

  it('dismisses a toast on click', async () => {
    useUiStore.setState({
      toasts: [{ id: '1', variant: 'info', message: 'Hello' }],
    });

    const user = userEvent.setup();
    render(<ToastContainer />);

    expect(screen.getByText('Hello')).toBeTruthy();

    await user.click(screen.getByText('Hello'));
    expect(useUiStore.getState().toasts).toHaveLength(0);
  });

  it('does not dismiss other toasts when one is dismissed', async () => {
    useUiStore.setState({
      toasts: [
        { id: '1', variant: 'error', message: 'Error 1' },
        { id: '2', variant: 'success', message: 'Success 2' },
      ],
    });

    const user = userEvent.setup();
    render(<ToastContainer />);

    await user.click(screen.getByText('Error 1'));
    const remaining = useUiStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.id).toBe('2');
  });

  // ─── Timer tests (fake timers) ─────────────────────────────────────

  it('auto-dismisses after 5 seconds', () => {
    vi.useFakeTimers();
    useUiStore.setState({
      toasts: [{ id: '1', variant: 'success', message: 'Auto dismiss' }],
    });

    render(<ToastContainer />);
    expect(useUiStore.getState().toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(useUiStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });
});
