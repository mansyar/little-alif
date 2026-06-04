// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';

// ── Helpers ────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// Dispatch a pointerdown on the gate button. Using fireEvent.pointerDown
// directly (instead of userEvent.click) avoids userEvent's internal
// async wait/delays that hang under fake timers.
function pressDown(target: Element) {
  fireEvent.pointerDown(target, { pointerType: 'mouse', button: 0 });
}
function pressUp(target: Element) {
  fireEvent.pointerUp(target, { pointerType: 'mouse', button: 0 });
}
function tap(target: Element) {
  // Simulate a "real" tap: pointerdown → pointerup → click, in the same
  // synchronous burst. user-event v14's click() does this, but with
  // fake timers it hangs on internal waits. fireEvent is synchronous.
  pressDown(target);
  pressUp(target);
  fireEvent.click(target);
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('ParentGate', () => {
  it('renders a Lock icon by default', async () => {
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const lock = document.querySelector('svg.lucide-lock');
    expect(lock).toBeTruthy();
  });

  it('the lock button has aria-label="Parent menu"', async () => {
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    expect(screen.getByLabelText('Parent menu')).toBeTruthy();
  });

  it('clicking the icon once does NOT open the parent menu', async () => {
    vi.useFakeTimers();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');
    act(() => {
      tap(button);
    });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Switch child')).toBeNull();
  });

  it('clicking the icon 3 times within 1s opens the parent menu', async () => {
    vi.useFakeTimers();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');

    act(() => {
      tap(button);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      tap(button);
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      tap(button);
    });
    // Drain the deferred setTimeout(0) that opens the menu
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Switch child')).toBeTruthy();
    expect(screen.getByText(/Exit to parent dashboard/i)).toBeTruthy();
  });

  it('clicking the icon 3 times with >1s between taps does NOT open the menu', async () => {
    vi.useFakeTimers();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');

    act(() => {
      tap(button);
    });
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    act(() => {
      tap(button);
    });
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    act(() => {
      tap(button);
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('holding the icon for 1.5s opens the parent menu', async () => {
    vi.useFakeTimers();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');

    act(() => {
      pressDown(button);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      pressUp(button);
    });

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('holding for <1.5s then releasing does NOT open the menu', async () => {
    vi.useFakeTimers();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');

    act(() => {
      pressDown(button);
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    act(() => {
      pressUp(button);
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('the progress ring is at 0% at rest and grows during the hold (data-progress attribute)', async () => {
    vi.useFakeTimers();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');
    expect(Number(button.getAttribute('data-progress'))).toBe(0);

    act(() => {
      pressDown(button);
    });
    expect(Number(button.getAttribute('data-progress'))).toBe(0);

    act(() => {
      vi.advanceTimersByTime(750);
    });
    const mid = Number(button.getAttribute('data-progress') ?? '0');
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(0.8);

    act(() => {
      vi.advanceTimersByTime(750);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(Number(button.getAttribute('data-progress'))).toBe(0);
  });

  it('when disabled is true, no interaction is accepted', async () => {
    vi.useFakeTimers();
    const onSwitchChild = vi.fn();
    const onExit = vi.fn();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={onExit} onSwitchChild={onSwitchChild} disabled />);

    const button = screen.getByLabelText('Parent menu') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    act(() => {
      pressDown(button);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('clicking "Switch child" in the menu calls onSwitchChild', async () => {
    vi.useFakeTimers();
    const onSwitchChild = vi.fn();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={onSwitchChild} />);

    const button = screen.getByLabelText('Parent menu');
    act(() => {
      pressDown(button);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    // Drain the deferred setTimeout that opens the menu
    act(() => {
      vi.advanceTimersByTime(0);
    });

    fireEvent.click(screen.getByText('Switch child'));

    expect(onSwitchChild).toHaveBeenCalledTimes(1);
  });

  it('clicking "Exit to parent dashboard" in the menu calls onExit', async () => {
    vi.useFakeTimers();
    const onExit = vi.fn();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={onExit} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');
    act(() => {
      pressDown(button);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    fireEvent.click(screen.getByText(/Exit to parent dashboard/i));

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('the parent menu can be closed via the Close affordance', async () => {
    vi.useFakeTimers();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');
    act(() => {
      pressDown(button);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('the parent menu is rendered at z-60 (above LetterDetail z-50)', async () => {
    vi.useFakeTimers();
    const { ParentGate } = await import('./ParentGate');
    render(<ParentGate onExit={vi.fn()} onSwitchChild={vi.fn()} />);

    const button = screen.getByLabelText('Parent menu');
    act(() => {
      pressDown(button);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const dialog = screen.getByRole('dialog');
    const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement | null;
    const dialogClass = dialog.className + ' ' + (overlay?.className ?? '');
    expect(dialogClass).toMatch(/z-60|z-\[60\]/);
  });
});
