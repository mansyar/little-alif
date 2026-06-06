// @vitest-environment node
import { describe, expect, it } from 'vitest';

type HealthHandler = (opts: { request: Request }) => Promise<Response>;

describe('GET /api/health', () => {
  async function getHandler(): Promise<HealthHandler> {
    const { Route } = await import('./health');
    const server = Route.options.server;
    // server.handlers is typed as a complex conditional — cast to access GET
    const handlers = server as unknown as { handlers: { GET: HealthHandler } };
    return handlers.handlers.GET;
  }

  it('returns 200 status', async () => {
    const handler = await getHandler();
    const response = await handler({ request: new Request('http://localhost:3000/api/health') });
    expect(response.status).toBe(200);
  });

  it('returns JSON body { status: "ok" }', async () => {
    const handler = await getHandler();
    const response = await handler({ request: new Request('http://localhost:3000/api/health') });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('responds without requiring auth headers', async () => {
    const handler = await getHandler();
    const response = await handler({ request: new Request('http://localhost:3000/api/health') });
    expect(response.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
