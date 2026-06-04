import { describe, expect, it } from 'vitest';
import {
  PARENT_GATE_LONG_PRESS_MS,
  PARENT_GATE_TAP_COUNT,
  PARENT_GATE_TAP_WINDOW_MS,
} from './parent-gate';

describe('parent-gate constants', () => {
  it('PARENT_GATE_LONG_PRESS_MS is exported and equals 1500', () => {
    expect(PARENT_GATE_LONG_PRESS_MS).toBe(1500);
  });

  it('PARENT_GATE_TAP_WINDOW_MS is exported and equals 1000', () => {
    expect(PARENT_GATE_TAP_WINDOW_MS).toBe(1000);
  });

  it('PARENT_GATE_TAP_COUNT is exported and equals 3', () => {
    expect(PARENT_GATE_TAP_COUNT).toBe(3);
  });

  it('all three constants are positive numbers', () => {
    expect(typeof PARENT_GATE_LONG_PRESS_MS).toBe('number');
    expect(typeof PARENT_GATE_TAP_WINDOW_MS).toBe('number');
    expect(typeof PARENT_GATE_TAP_COUNT).toBe('number');
    expect(PARENT_GATE_LONG_PRESS_MS).toBeGreaterThan(0);
    expect(PARENT_GATE_TAP_WINDOW_MS).toBeGreaterThan(0);
    expect(PARENT_GATE_TAP_COUNT).toBeGreaterThan(0);
  });
});
