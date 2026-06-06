// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

describe('/register route', () => {
  it('exports a Route with a component', async () => {
    const { Route } = await import('./register');
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('does not define a beforeLoad guard (no auth redirect)', async () => {
    const { Route } = await import('./register');
    // Register route intentionally has no beforeLoad — users can visit
    // /register even when already authenticated (TanStack Router handles
    // navigation, not route-level guards).
    expect(Route.options.beforeLoad).toBeUndefined();
  });
});
