import { describe, it, expect, vi, beforeEach } from 'vitest';

const libsqlMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@libsql/client', () => ({
  createClient: libsqlMocks.createClient,
}));

describe('app/db/index', () => {
  beforeEach(() => {
    libsqlMocks.createClient.mockReset();
    delete process.env.DATABASE_URL;
    vi.resetModules();
  });

  it('exports schema, authSchema, and a merged fullSchema', async () => {
    const mod = await import('./index');
    expect(mod.schema).toBeDefined();
    expect(mod.authSchema).toBeDefined();
    expect(mod.fullSchema).toEqual({ ...mod.schema, ...mod.authSchema });
  });

  it('getClient creates a libSQL client with the default local file URL', async () => {
    const fakeClient = { id: 'fake-client' };
    libsqlMocks.createClient.mockReturnValue(fakeClient);

    const { getClient } = await import('./index');
    const client = getClient();

    expect(client).toBe(fakeClient);
    expect(libsqlMocks.createClient).toHaveBeenCalledTimes(1);
    expect(libsqlMocks.createClient).toHaveBeenCalledWith({
      url: 'file:./data/little-alif.db',
    });
  });

  it('getClient uses DATABASE_URL when set (e.g., for Turso)', async () => {
    process.env.DATABASE_URL = 'libsql://test.turso.io';
    const fakeClient = { id: 'fake-client' };
    libsqlMocks.createClient.mockReturnValue(fakeClient);

    const { getClient } = await import('./index');
    getClient();

    expect(libsqlMocks.createClient).toHaveBeenCalledWith({ url: 'libsql://test.turso.io' });
  });

  it('getClient is a lazy singleton (one createClient call, same instance)', async () => {
    libsqlMocks.createClient.mockReturnValue({ id: 'fake' });
    const { getClient } = await import('./index');

    const a = getClient();
    const b = getClient();

    expect(a).toBe(b);
    expect(libsqlMocks.createClient).toHaveBeenCalledTimes(1);
  });

  it('getDb wraps the singleton client with the combined schema', async () => {
    const fakeClient = { id: 'fake' };
    libsqlMocks.createClient.mockReturnValue(fakeClient);
    const { getDb } = await import('./index');

    const db = getDb();

    // A real Drizzle instance exposes select/insert/etc.
    expect(typeof db.select).toBe('function');
    expect(typeof db.insert).toBe('function');
    // The underlying client was created exactly once — the singleton held.
    expect(libsqlMocks.createClient).toHaveBeenCalledTimes(1);
  });
});
