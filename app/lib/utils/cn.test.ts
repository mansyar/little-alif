import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins multiple class strings with spaces', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');
  });

  it('supports conditional class objects', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('supports conditional class arrays', () => {
    expect(cn('base', ['a', null, 'b'])).toBe('base a b');
  });

  it('resolves conflicting tailwind utilities (later wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('preserves non-conflicting tailwind utilities', () => {
    expect(cn('px-2', 'py-1', 'text-red-500')).toBe('px-2 py-1 text-red-500');
  });
});
