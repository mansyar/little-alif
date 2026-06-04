import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AudioEngine } from './audio-engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockAudio() {
  let endedHandler: (() => void) | null = null;
  let errorHandler: (() => void) | null = null;
  let currentSrc = '';

  const audio = {
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    addEventListener: vi.fn((event: string, handler: EventListener) => {
      if (event === 'ended') endedHandler = handler as () => void;
      if (event === 'error') errorHandler = handler as () => void;
    }),
    removeEventListener: vi.fn(),
    set src(value: string) {
      currentSrc = value;
    },
    get src() {
      return currentSrc;
    },
    currentTime: 0,
  };

  return {
    audio,
    setSrc(value: string) {
      currentSrc = value;
    },
    triggerEnded: () => endedHandler?.(),
    triggerError: () => errorHandler?.(),
  };
}

function installMockEnvironment() {
  // Mock Audio
  const audioMock = createMockAudio();
  const origAudio = globalThis.Audio;
  const MockAudio = vi.fn((url?: string) => {
    if (url) audioMock.setSrc(url);
    return audioMock.audio;
  }) as unknown as typeof Audio & { prototype: { play: () => Promise<void> } };
  MockAudio.prototype.play = vi.fn(() => Promise.resolve());
  globalThis.Audio = MockAudio;

  // Mock SpeechSynthesis
  let onvoiceschanged: (() => void) | null = null;

  const utteranceInstances: {
    text: string;
    rate: number;
    lang: string;
    voice: SpeechSynthesisVoice | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
  }[] = [];

  const MockUtterance = vi.fn((text?: string) => {
    const instance = {
      text: text ?? '',
      rate: 1,
      lang: '',
      voice: null,
      onend: null as (() => void) | null,
      onerror: null as (() => void) | null,
    };
    utteranceInstances.push(instance);
    return instance;
  }) as unknown as typeof SpeechSynthesisUtterance;
  globalThis.SpeechSynthesisUtterance = MockUtterance;

  const synthMock = {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => [] as SpeechSynthesisVoice[]),
    get onvoiceschanged() {
      return onvoiceschanged;
    },
    set onvoiceschanged(h: (() => void) | null) {
      onvoiceschanged = h;
    },
  };

  globalThis.window = {
    speechSynthesis: synthMock,
  } as unknown as Window & typeof globalThis;

  return {
    audioMock,
    origAudio,
    synthMock,
    MockUtterance,
    utteranceInstances,
  };
}

function restoreEnvironment(origAudio: typeof Audio | undefined) {
  if (origAudio) {
    globalThis.Audio = origAudio;
  } else {
    delete (globalThis as Record<string, unknown>).Audio;
  }
  delete (globalThis as Record<string, unknown>).window;
  delete (globalThis as Record<string, unknown>).SpeechSynthesisUtterance;
}

// ---------------------------------------------------------------------------
// AudioEngine – isSupported / graceful degradation
// ---------------------------------------------------------------------------

describe('AudioEngine isSupported', () => {
  it('is false in Node environment (no Audio constructor)', () => {
    const engine = new AudioEngine();
    expect(engine.isSupported).toBe(false);
  });

  it('is true when Audio constructor is available', () => {
    const { origAudio } = installMockEnvironment();
    const engine = new AudioEngine();
    expect(engine.isSupported).toBe(true);
    restoreEnvironment(origAudio);
  });

  it('speak resolves silently when Audio is unavailable', async () => {
    const engine = new AudioEngine();
    await expect(engine.speak('alif', 'fathah', 'ا')).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AudioEngine – speak MP3 path
// ---------------------------------------------------------------------------

describe('AudioEngine speak – MP3 path', () => {
  let engine: AudioEngine;
  let env: ReturnType<typeof installMockEnvironment>;

  beforeEach(() => {
    env = installMockEnvironment();
    engine = new AudioEngine();
  });

  afterEach(() => {
    restoreEnvironment(env.origAudio);
  });

  it('constructs correct URL with letterId and vowelMode', () => {
    void engine.speak('ba', 'fathah', 'ب');
    expect(env.audioMock.audio.src).toContain('/audio/letters/ba_fathah.mp3');
  });

  it('constructs correct URL with none vowelMode (no suffix)', () => {
    void engine.speak('alif', 'none', 'ا');
    expect(env.audioMock.audio.src).toContain('/audio/letters/alif.mp3');
  });

  it('returns a Promise that resolves when audio ends', async () => {
    const speakPromise = engine.speak('ba', 'fathah', 'ب');

    env.audioMock.triggerEnded();

    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('cancels previous audio before starting a new one', () => {
    void engine.speak('ba', 'fathah', 'ب');
    void engine.speak('ta', 'kasrah', 'ت');

    expect(env.audioMock.audio.pause).toHaveBeenCalledTimes(1);
    expect(env.audioMock.audio.play).toHaveBeenCalledTimes(2);
  });

  it('cancel() pauses audio and clears reference', () => {
    void engine.speak('ba', 'fathah', 'ب');
    engine.cancel();

    expect(env.audioMock.audio.pause).toHaveBeenCalledTimes(1);
    expect(env.audioMock.audio.currentTime).toBe(0);

    // After cancel, a new speak should play fresh audio
    vi.clearAllMocks();
    void engine.speak('ba', 'none', 'ب');
    expect(env.audioMock.audio.src).toContain('/audio/letters/ba.mp3');
  });

  it('cancel() resolves the pending speak promise', async () => {
    const speakPromise = engine.speak('ba', 'fathah', 'ب');
    engine.cancel();
    await expect(speakPromise).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AudioEngine – Web Speech fallback
// ---------------------------------------------------------------------------

describe('AudioEngine speak – Web Speech fallback', () => {
  let engine: AudioEngine;
  let env: ReturnType<typeof installMockEnvironment>;

  beforeEach(() => {
    env = installMockEnvironment();
    engine = new AudioEngine();
  });

  afterEach(() => {
    restoreEnvironment(env.origAudio);
  });

  it('falls back to Web Speech when play() rejects (autoplay block)', async () => {
    // Simulate browser blocking the first play() call
    env.audioMock.audio.play = vi.fn(() => Promise.reject(new Error('play blocked')));

    const speakPromise = engine.speak('ba', 'fathah', 'ب');

    // play().catch(onMp3Fail) runs as a microtask — drain the queue
    // before checking synchronous side effects
    await Promise.resolve();

    // Fallback should have been triggered by the catch handler
    expect(env.synthMock.speak).toHaveBeenCalledTimes(1);
    expect(env.utteranceInstances).toHaveLength(1);
    expect(env.utteranceInstances[0]!.text).toBe('بَ');

    env.utteranceInstances[0]!.onend?.();
    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('falls back to Web Speech when MP3 errors', async () => {
    const speakPromise = engine.speak('ba', 'fathah', 'ب');
    env.audioMock.triggerError();

    // Fallback created a Web Speech utterance
    expect(env.synthMock.speak).toHaveBeenCalledTimes(1);
    expect(env.utteranceInstances).toHaveLength(1);
    expect(env.utteranceInstances[0]!.text).toBe('بَ');

    // Resolve the fallback
    env.utteranceInstances[0]!.onend?.();
    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('fallback sets rate 0.85 and lang ar-SA', async () => {
    const speakPromise = engine.speak('ba', 'fathah', 'ب');
    env.audioMock.triggerError();

    expect(env.utteranceInstances[0]!.rate).toBe(0.85);
    expect(env.utteranceInstances[0]!.lang).toBe('ar-SA');

    env.utteranceInstances[0]!.onend?.();
    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('fallback resolves when utterance.onerror fires', async () => {
    const speakPromise = engine.speak('ba', 'fathah', 'ب');
    env.audioMock.triggerError();

    env.utteranceInstances[0]!.onerror?.();
    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('fallback uses available Arabic voice when found', async () => {
    // Reinstall with Arabic voice available
    restoreEnvironment(env.origAudio);
    env = installMockEnvironment();
    env.synthMock.getVoices.mockReturnValue([
      { lang: 'en-US', name: 'Test US' },
      { lang: 'ar-SA', name: 'Test Arabic' },
    ] as SpeechSynthesisVoice[]);
    engine = new AudioEngine();

    const speakPromise = engine.speak('ba', 'fathah', 'ب');
    env.audioMock.triggerError();

    expect(env.utteranceInstances[0]!.voice?.lang).toBe('ar-SA');

    env.utteranceInstances[0]!.onend?.();
    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('fallback resolves silently when SpeechSynthesis is unavailable', async () => {
    // Remove SpeechSynthesis from window mock
    delete (globalThis.window as unknown as Record<string, unknown>).speechSynthesis;

    const speakPromise = engine.speak('ba', 'fathah', 'ب');
    env.audioMock.triggerError();

    // No fallback possible → resolves silently
    await expect(speakPromise).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AudioEngine – dispose
// ---------------------------------------------------------------------------

describe('AudioEngine dispose', () => {
  let engine: AudioEngine;
  let env: ReturnType<typeof installMockEnvironment>;

  beforeEach(() => {
    env = installMockEnvironment();
    engine = new AudioEngine();
  });

  afterEach(() => {
    restoreEnvironment(env.origAudio);
  });

  it('cancels current playback', () => {
    void engine.speak('ba', 'fathah', 'ب');
    engine.dispose();

    expect(env.audioMock.audio.pause).toHaveBeenCalledTimes(1);
  });

  it('makes isSupported return false', () => {
    engine.dispose();
    expect(engine.isSupported).toBe(false);
  });

  it('speak resolves silently after dispose', async () => {
    engine.dispose();
    await expect(engine.speak('ba', 'fathah', 'ب')).resolves.toBeUndefined();
  });
});
