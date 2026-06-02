import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AudioEngine, type SpeechSynthesisAdapter } from './audio-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A plain-object representation of SpeechSynthesisUtterance used in tests so we
 * can avoid creating real SpeechSynthesisUtterance instances (which require a
 * browser API not available in the Node test environment).
 */
interface MockUtterance {
  text: string;
  rate: number;
  voice: SpeechSynthesisVoice | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
  onstart: (() => void) | null;
  onboundary: (() => void) | null;
  onmark: (() => void) | null;
  pitch: number;
  volume: number;
  lang: string;
}

/** Type guard to access MockUtterance properties from a SpeechSynthesisUtterance. */
function asMock(u: SpeechSynthesisUtterance | undefined): MockUtterance | undefined {
  return u as unknown as MockUtterance | undefined;
}

/** Convenience: retrieve the most recent utterance as a MockUtterance. */
function lastUtterance(adapter: ReturnType<typeof createMockAdapter>): MockUtterance {
  return asMock(adapter.__spokenUtterances[adapter.__spokenUtterances.length - 1])!;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockVoice(overrides: Partial<SpeechSynthesisVoice> = {}): SpeechSynthesisVoice {
  return {
    lang: 'ar-SA',
    name: 'Mock Arabic Voice',
    voiceURI: 'mock-ar',
    default: false,
    localService: true,
    ...overrides,
  };
}

interface MockAdapter extends SpeechSynthesisAdapter {
  __spokenUtterances: SpeechSynthesisUtterance[];
}

/**
 * Create a controllable mock SpeechSynthesisAdapter.
 *
 * The `speak` mock stores a reference to the most recently spoken utterance
 * so tests can invoke its `onend` / `onerror` callbacks to simulate the end
 * (or error) of speech.
 */
function createMockAdapter(): MockAdapter {
  const spokenUtterances: SpeechSynthesisUtterance[] = [];

  const speak: SpeechSynthesisAdapter['speak'] = (utterance) => {
    spokenUtterances.push(utterance);
  };

  const createUtterance: SpeechSynthesisAdapter['createUtterance'] = (text) => {
    return {
      text,
      rate: 1,
      voice: null,
      onend: null,
      onerror: null,
      onpause: null,
      onresume: null,
      onstart: null,
      onboundary: null,
      onmark: null,
      pitch: 1,
      volume: 1,
      lang: '',
    } as unknown as SpeechSynthesisUtterance;
  };

  return {
    getVoices: vi.fn(() => []),
    createUtterance: vi.fn((text: string) => createUtterance(text)),
    speak: vi.fn((utterance: SpeechSynthesisUtterance) => speak(utterance)),
    cancel: vi.fn(),
    speaking: false,
    paused: false,
    onvoiceschanged: null,
    __spokenUtterances: spokenUtterances,
  };
}

// ---------------------------------------------------------------------------
// SpeechSynthesisAdapter – mock & contract
// ---------------------------------------------------------------------------

describe('SpeechSynthesisAdapter mock', () => {
  it('creates a controllable mock adapter', () => {
    const adapter = createMockAdapter();
    expect(typeof adapter.getVoices).toBe('function');
    expect(typeof adapter.speak).toBe('function');
    expect(typeof adapter.cancel).toBe('function');
    expect(adapter.speaking).toBe(false);
    expect(adapter.paused).toBe(false);
  });

  it('createUtterance returns an object with text and event hooks', () => {
    const adapter = createMockAdapter();
    const utterance = adapter.createUtterance('بَ');
    const mock = asMock(utterance)!;
    expect(mock.text).toBe('بَ');
    expect(mock.onend).toBeNull();
    expect(mock.onerror).toBeNull();
  });

  it('speak stores the utterance for later inspection', () => {
    const adapter = createMockAdapter();
    const utterance = adapter.createUtterance('test');
    adapter.speak(utterance);
    expect(adapter.__spokenUtterances).toHaveLength(1);
    expect(adapter.__spokenUtterances[0]).toBe(utterance);
  });
});

// ---------------------------------------------------------------------------
// AudioEngine – isSupported / graceful degradation
// ---------------------------------------------------------------------------

describe('AudioEngine isSupported', () => {
  it('is true when constructed with a valid adapter', () => {
    const adapter = createMockAdapter();
    const engine = new AudioEngine(adapter);
    expect(engine.isSupported).toBe(true);
  });

  it('is false when no adapter is available', () => {
    // Pass nothing (undefined) so the constructor falls through to
    // createBrowserAdapter() which returns null in a Node environment.
    const engine = new AudioEngine();
    expect(engine.isSupported).toBe(false);
  });

  it('speak resolves silently when SpeechSynthesis is unavailable', async () => {
    const engine = new AudioEngine();
    await expect(engine.speak('ب', 'fathah')).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AudioEngine – voice selection
// ---------------------------------------------------------------------------

describe('AudioEngine voice selection', () => {
  let adapter: MockAdapter;
  let engine: AudioEngine;
  let mockGetVoices: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    adapter = createMockAdapter();
    mockGetVoices = vi.fn(() => []);
    adapter.getVoices = mockGetVoices;
    engine = new AudioEngine(adapter);
  });

  it('prefers ar-SA over ar-XA', () => {
    const arXA = createMockVoice({ lang: 'ar-XA', name: 'Arabic XA' });
    const arSA = createMockVoice({ lang: 'ar-SA', name: 'Arabic SA' });
    adapter.getVoices = vi.fn(() => [arXA, arSA]);

    void engine.speak('ب', 'fathah');
    expect(lastUtterance(adapter).voice?.lang).toBe('ar-SA');
  });

  it('prefers ar-XA over any other Arabic voice', () => {
    const arEG = createMockVoice({ lang: 'ar-EG', name: 'Arabic Egypt' });
    const arXA = createMockVoice({ lang: 'ar-XA', name: 'Arabic XA' });
    adapter.getVoices = vi.fn(() => [arEG, arXA]);

    void engine.speak('ب', 'fathah');
    expect(lastUtterance(adapter).voice?.lang).toBe('ar-XA');
  });

  it('falls back to any Arabic voice when ar-SA and ar-XA are absent', () => {
    const arEG = createMockVoice({ lang: 'ar-EG', name: 'Arabic Egypt' });
    adapter.getVoices = vi.fn(() => [arEG]);

    void engine.speak('ب', 'fathah');
    expect(lastUtterance(adapter).voice?.lang).toBe('ar-EG');
  });

  it('falls back to the default voice when no Arabic voice is available', () => {
    const defaultVoice = createMockVoice({
      lang: 'en-US',
      name: 'Default',
      default: true,
    });
    const otherVoice = createMockVoice({ lang: 'fr-FR', name: 'French' });
    adapter.getVoices = vi.fn(() => [otherVoice, defaultVoice]);

    void engine.speak('ب', 'fathah');
    expect(lastUtterance(adapter).voice?.lang).toBe('en-US');
  });

  it('falls back to the first voice when no default exists and no Arabic', () => {
    const firstVoice = createMockVoice({ lang: 'en-US', name: 'First US' });
    const secondVoice = createMockVoice({ lang: 'fr-FR', name: 'French' });
    adapter.getVoices = vi.fn(() => [firstVoice, secondVoice]);

    void engine.speak('ب', 'fathah');
    expect(lastUtterance(adapter).voice?.lang).toBe('en-US');
  });

  it('caches the selected voice (calls getVoices only once)', () => {
    const arSA = createMockVoice({ lang: 'ar-SA' });
    const mockGetVoices = vi.fn(() => [arSA]);
    adapter.getVoices = mockGetVoices;

    void engine.speak('ب', 'fathah');
    void engine.speak('ت', 'kasrah');
    void engine.speak('ث', 'dammah');

    expect(mockGetVoices.mock.calls).toHaveLength(1);
  });

  it('resetVoiceScan allows re-scanning voices', () => {
    const arSA = createMockVoice({ lang: 'ar-SA' });
    const mockGetVoices = vi.fn(() => [arSA]);
    adapter.getVoices = mockGetVoices;

    void engine.speak('ب', 'fathah');
    expect(mockGetVoices.mock.calls).toHaveLength(1);

    engine.resetVoiceScan();
    void engine.speak('ب', 'fathah');
    expect(mockGetVoices.mock.calls).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// AudioEngine – speak behaviour
// ---------------------------------------------------------------------------

describe('AudioEngine speak', () => {
  let adapter: MockAdapter;
  let engine: AudioEngine;
  beforeEach(() => {
    adapter = createMockAdapter();
    adapter.getVoices = vi.fn(() => [createMockVoice({ lang: 'ar-SA' })]);
    engine = new AudioEngine(adapter);
  });

  it('creates an utterance with the composed letter text', () => {
    void engine.speak('ب', 'fathah');
    expect(lastUtterance(adapter).text).toBe('بَ');
  });

  it('sets utterance rate to 0.85', () => {
    void engine.speak('ب', 'fathah');
    expect(lastUtterance(adapter).rate).toBe(0.85);
  });

  it('sets the selected voice on the utterance', () => {
    void engine.speak('ب', 'fathah');
    expect(lastUtterance(adapter).voice?.lang).toBe('ar-SA');
  });

  it('returns a Promise that resolves when the utterance ends', async () => {
    const speakPromise = engine.speak('ب', 'fathah');

    asMock(adapter.__spokenUtterances[0])!.onend!();

    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('cancels previous utterance before starting a new one', () => {
    void engine.speak('ب', 'fathah');
    void engine.speak('ت', 'kasrah');

    expect(vi.mocked(adapter).cancel.mock.calls).toHaveLength(1);
    expect(adapter.__spokenUtterances).toHaveLength(2);
  });

  it('resolves silently when onerror fires (no throw)', async () => {
    const speakPromise = engine.speak('ب', 'fathah');

    asMock(adapter.__spokenUtterances[0])!.onerror!();

    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('cancel() invokes adapter cancel and clears internal reference', () => {
    void engine.speak('ب', 'fathah');
    engine.cancel();

    expect(vi.mocked(adapter).cancel.mock.calls).toHaveLength(1);

    // After cancel, a new speak call should not trigger another cancel
    // (since internal state was cleared)
    void engine.speak('ت', 'dammah');
    expect(vi.mocked(adapter).cancel.mock.calls).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// AudioEngine – dispose
// ---------------------------------------------------------------------------

describe('AudioEngine dispose', () => {
  it('cancels and clears the adapter reference', () => {
    const adapter = createMockAdapter();
    const engine = new AudioEngine(adapter);

    engine.dispose();

    expect(vi.mocked(adapter).cancel.mock.calls).toHaveLength(1);
    expect(engine.isSupported).toBe(false);
  });

  it('speak resolves silently after dispose', async () => {
    const adapter = createMockAdapter();
    const engine = new AudioEngine(adapter);

    engine.dispose();
    await expect(engine.speak('ب', 'fathah')).resolves.toBeUndefined();
  });
});
