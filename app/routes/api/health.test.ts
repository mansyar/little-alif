// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('GET /api/health', () => {
  it('returns 200 status', async () => {
    const { Route } = await import('./health');
    const handler = Route.options.server?.handlers?.GET;
    expect(handler).toBeDefined();

    const response = await handler!({ request: new Request('http://localhost:3000/api/health') });
    expect(response.status).toBe(200);
  });

  it('returns JSON body { status: "ok" }', async () => {
    const { Route } = await import('./health');
    const handler = Route.options.server?.handlers?.GET;
    expect(handler).toBeDefined();

    const response = await handler!({ request: new Request('http://localhost:3000/api/health') });
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('responds without requiring auth headers', async () => {
    // No auth setup needed — the handler is pure
    const { Route } = await import('./health');
    const handler = Route.options.server?.handlers?.GET;
    expect(handler).toBeDefined();

    const response = await handler!({ request: new Request('http://localhost:3000/api/health') });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
