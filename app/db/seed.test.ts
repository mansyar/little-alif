import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SEED_LETTERS } from './seed-data';

const seedMocks = vi.hoisted(() => {
  const insertValues = vi.fn();
  const insert = vi.fn(() => ({ values: insertValues }));
  const from = vi.fn();
  const select = vi.fn(() => ({ from }));
  const fakeDb = { insert, select };
  return {
    fakeDb,
    insert,
    insertValues,
    from,
    select,
    processExit: vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never),
    log: vi.spyOn(console, 'log').mockImplementation(() => undefined),
    error: vi.spyOn(console, 'error').mockImplementation(() => undefined),
  };
});

vi.mock('./index', () => ({ getDb: () => seedMocks.fakeDb }));
vi.mock('./schema', () => ({ letters: { id: 'letters.id' } }));

/**
 * Import the seed module (which runs the top-level `seed().catch(...)` chain)
 * and wait for that chain to settle. We use a setImmediate flush because the
 * chain mixes microtask awaits with macrotask yields.
 */
async function runSeed() {
  await import('./seed');
  await new Promise((resolve) => setImmediate(resolve));
}

beforeEach(() => {
  vi.resetModules();
  seedMocks.insert.mockClear();
  seedMocks.insertValues.mockClear();
  seedMocks.from.mockClear();
  seedMocks.select.mockClear();
  seedMocks.processExit.mockClear();
  seedMocks.log.mockClear();
  seedMocks.error.mockClear();
});

describe('SEED_LETTERS', () => {
  it('contains exactly 28 letters', () => {
    expect(SEED_LETTERS).toHaveLength(28);
  });

  it('has unique IDs', () => {
    const ids = SEED_LETTERS.map((l) => l.id);
    expect(new Set(ids).size).toBe(28);
  });

  it('has unique displayOrder values from 1 to 28', () => {
    const orders = SEED_LETTERS.map((l) => l.displayOrder).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
  });

  it('first letter is alif (ا) with displayOrder 1', () => {
    const alif = SEED_LETTERS.find((l) => l.id === 'alif');
    expect(alif).toBeDefined();
    expect(alif?.character).toBe('ا');
    expect(alif?.displayOrder).toBe(1);
  });

  it('last letter is ya (ي) with displayOrder 28', () => {
    const ya = SEED_LETTERS.find((l) => l.id === 'ya');
    expect(ya).toBeDefined();
    expect(ya?.character).toBe('ي');
    expect(ya?.displayOrder).toBe(28);
  });

  it('every letter has audioFiles for none, fathah, kasrah, dammah modes', () => {
    for (const letter of SEED_LETTERS) {
      expect(Object.keys(letter.audioFiles).sort()).toEqual(['dammah', 'fathah', 'kasrah', 'none']);
    }
  });

  it('audioFiles use the documented {letterId}_{vowelMode}.mp3 pattern', () => {
    for (const letter of SEED_LETTERS) {
      expect(letter.audioFiles.none).toBe(`${letter.id}.mp3`);
      expect(letter.audioFiles.fathah).toBe(`${letter.id}_fathah.mp3`);
      expect(letter.audioFiles.kasrah).toBe(`${letter.id}_kasrah.mp3`);
      expect(letter.audioFiles.dammah).toBe(`${letter.id}_dammah.mp3`);
    }
  });

  it('includes the canonical Hijaiyah order (alif → ya)', () => {
    const ordered = [...SEED_LETTERS].sort((a, b) => a.displayOrder - b.displayOrder);
    // Note: ha = ح (ḥāʼ), hae = ه (soft hāʼ) per docs/tdd.md §6
    const expectedIds = [
      'alif',
      'ba',
      'ta',
      'tsa',
      'jim',
      'ha',
      'kho',
      'dal',
      'dzal',
      'ra',
      'zai',
      'sin',
      'syin',
      'shad',
      'dhad',
      'tha',
      'dzha',
      'ain',
      'ghain',
      'fa',
      'qaf',
      'kaf',
      'lam',
      'mim',
      'nun',
      'waw',
      'hae',
      'ya',
    ];
    expect(ordered.map((l) => l.id)).toEqual(expectedIds);
  });
});

describe('seed() runner', () => {
  it('inserts all 28 letters when the table is empty', async () => {
    seedMocks.from.mockResolvedValueOnce([]);
    await runSeed();

    expect(seedMocks.select).toHaveBeenCalledWith({ id: 'letters.id' });
    expect(seedMocks.insert).toHaveBeenCalledTimes(1);
    const valuesArg = seedMocks.insertValues.mock.calls[0]?.[0] as
      | { id: string; audioFiles: string }[]
      | undefined;
    expect(valuesArg).toHaveLength(28);
    expect(typeof valuesArg?.[0]?.audioFiles).toBe('string');
    expect(JSON.parse(valuesArg![0].audioFiles)).toMatchObject({ none: 'alif.mp3' });
    expect(seedMocks.processExit).not.toHaveBeenCalled();
  });

  it('skips letters that already exist (idempotent)', async () => {
    seedMocks.from.mockResolvedValueOnce([{ id: 'alif' }, { id: 'ba' }, { id: 'ta' }]);
    await runSeed();

    const valuesArg = seedMocks.insertValues.mock.calls[0]?.[0] as
      | { id: string; audioFiles: string }[]
      | undefined;
    expect(valuesArg).toHaveLength(25);
    const insertedIds = valuesArg?.map((v) => v.id) ?? [];
    expect(insertedIds).not.toContain('alif');
    expect(insertedIds).not.toContain('ba');
    expect(insertedIds).not.toContain('ta');
    expect(seedMocks.processExit).not.toHaveBeenCalled();
  });

  it('is a no-op when all letters already exist', async () => {
    const allIds = SEED_LETTERS.map((l) => l.id);
    seedMocks.from.mockResolvedValueOnce(allIds.map((id) => ({ id })));
    await runSeed();

    expect(seedMocks.insert).not.toHaveBeenCalled();
    expect(seedMocks.insertValues).not.toHaveBeenCalled();
    expect(seedMocks.log).toHaveBeenCalledWith(
      expect.stringContaining('All 28 letters already present'),
    );
    expect(seedMocks.processExit).not.toHaveBeenCalled();
  });

  it('exits with code 1 when seeding fails', async () => {
    seedMocks.from.mockResolvedValueOnce([]);
    seedMocks.insertValues.mockRejectedValueOnce(new Error('disk full'));
    await runSeed();

    expect(seedMocks.processExit).toHaveBeenCalledWith(1);
    expect(seedMocks.error).toHaveBeenCalledWith('[seed] Failed:', expect.any(Error));
  });
});
