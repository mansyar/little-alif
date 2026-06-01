import { describe, it, expect } from 'vitest';
import { getRouter } from './router';

describe('getRouter', () => {
  it('returns a router instance with the expected lifecycle methods', () => {
    const router = getRouter();
    expect(router).toBeDefined();
    expect(typeof router.subscribe).toBe('function');
  });

  it('returns a fresh instance on each call (factory, not singleton)', () => {
    const a = getRouter();
    const b = getRouter();
    expect(a).not.toBe(b);
  });
});
