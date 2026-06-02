// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes the callback after the specified delay', () => {
    vi.useFakeTimers();
    const fn = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('arg1', 'arg2');
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('debounces rapid successive calls: only the last one fires', () => {
    vi.useFakeTimers();
    const fn = vi.fn();

    const { result } = renderHook(() => useDebouncedCallback(fn, 300));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    // Advance by less than the debounce delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(fn).not.toHaveBeenCalled();

    // Advance to pass the full 300ms from the last call
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Only the last call's arguments should be used
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('returns a stable function reference when delay does not change', () => {
    const fn = vi.fn();

    const { result, rerender } = renderHook(({ delay }) => useDebouncedCallback(fn, delay), {
      initialProps: { delay: 300 },
    });

    const firstRef = result.current;

    // Re-render with same delay
    rerender({ delay: 300 });

    expect(result.current).toBe(firstRef);
  });

  it('creates a new function when delay changes', () => {
    const fn = vi.fn();

    const { result, rerender } = renderHook(({ delay }) => useDebouncedCallback(fn, delay), {
      initialProps: { delay: 300 },
    });

    const firstRef = result.current;

    rerender({ delay: 500 });

    expect(result.current).not.toBe(firstRef);
  });

  it('calls the most recent callback version', () => {
    vi.useFakeTimers();
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 300), {
      initialProps: { cb: fn1 },
    });

    // Invoke with the first callback
    act(() => {
      result.current('a');
    });

    // Swap the callback
    rerender({ cb: fn2 });

    // Invoke again — the debounce timer resets
    act(() => {
      result.current('b');
    });

    // Advance time past the debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Only the latest callback should have been called
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledWith('b');
  });
});
