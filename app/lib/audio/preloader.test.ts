import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AudioEngine, type SpeechSynthesisAdapter } from './audio-engine';
import { preloadOnIdle, resetPreloader } from './preloader';

// ---------------------------------------------------------------------------
// Helpers (mirrors audio-engine.test.ts patterns)
// ---------------------------------------------------------------------------

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

function asMock(u: SpeechSynthesisUtterance | undefined): MockUtterance | undefined {
  return u as unknown as MockUtterance | undefined;
}

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
  speaking: boolean; // writable override for test control
}

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
// Setup
// ---------------------------------------------------------------------------

describe('preloadOnIdle', () => {
  let adapter: MockAdapter;
  let engine: AudioEngine;

  beforeEach(() => {
    resetPreloader();

    // Mock requestIdleCallback to fire synchronously
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn((cb: IdleRequestCallback) => {
        cb({ didTimeout: false, timeRemaining: () => 50 });
      }),
    );

    adapter = createMockAdapter();
    adapter.getVoices = vi.fn(() => [createMockVoice({ lang: 'ar-SA' })]);
    engine = new AudioEngine(adapter);

    // Pre-warm voice cache by calling speak once (so selectVoice runs)
    void engine.speak('ب', 'fathah');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // -----------------------------------------------------------------------
  // FR-1: triggers speechSynthesis.speak() with an empty utterance
  // -----------------------------------------------------------------------

  it('triggers adapter.speak() with an empty utterance', () => {
    // adapter.speak was already called once by the beforeEach warm-up speak('ب')
    preloadOnIdle(engine);

    // Now it should have been called a second time — the preload utterance
    expect(vi.mocked(adapter).speak.mock.calls).toHaveLength(2);
    const utterance = asMock(adapter.__spokenUtterances[1])!;
    expect(utterance.text).toBe('');
  });

  it('sets the cached Arabic voice on the warm-up utterance', () => {
    preloadOnIdle(engine);

    const utterance = asMock(adapter.__spokenUtterances[1])!;
    expect(utterance.voice?.lang).toBe('ar-SA');
  });

  // -----------------------------------------------------------------------
  // FR-2: Idempotency guard — double call only triggers one warm-up
  // -----------------------------------------------------------------------

  it('is idempotent: second call is a no-op', () => {
    preloadOnIdle(engine);
    preloadOnIdle(engine);

    // adapter.speak is called once for the warm-up speak('ب')
    // and once for the preloader — NOT twice for preloader
    expect(vi.mocked(adapter).speak.mock.calls).toHaveLength(2);
  });

  // -----------------------------------------------------------------------
  // FR-3: Returns void (no Promise, no async)
  // -----------------------------------------------------------------------

  it('returns void (not a Promise)', () => {
    const result = preloadOnIdle(engine);
    expect(result).toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // FR-4: Graceful skipping
  // -----------------------------------------------------------------------

  it('silently exits when SpeechSynthesis is unavailable', () => {
    const unsupportedEngine = new AudioEngine(); // no adapter → isSupported = false

    preloadOnIdle(unsupportedEngine);

    // No errors thrown, nothing spoken
    expect(vi.mocked(adapter).speak.mock.calls).toHaveLength(1); // only the warm-up speak from beforeEach
  });

  it('silently exits when voice cache is empty (voices not yet scanned)', () => {
    const freshEngine = new AudioEngine(adapter);
    // freshEngine has NOT called speak() yet, so voiceScanComplete is false

    preloadOnIdle(freshEngine);

    // Verify no preload utterance was spoken (only the original warm-up)
    expect(adapter.__spokenUtterances).toHaveLength(1);
  });

  // -----------------------------------------------------------------------
  // NFR: Does not interfere with active playback
  // -----------------------------------------------------------------------

  it('does not preload when an utterance is already speaking', () => {
    adapter.speaking = true;

    preloadOnIdle(engine);

    // Only the warm-up speak from beforeEach
    expect(vi.mocked(adapter).speak.mock.calls).toHaveLength(1);
  });
});
