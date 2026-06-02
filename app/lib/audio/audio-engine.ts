import { type VowelMode, composeLetter } from '~/lib/utils/harakat';

// ---------------------------------------------------------------------------
// Adapter Interface
// ---------------------------------------------------------------------------
// A thin abstraction over the browser's `window.speechSynthesis` API so the
// AudioEngine can be unit-tested in Node without a real SpeechSynthesis.
// ---------------------------------------------------------------------------

export interface SpeechSynthesisAdapter {
  getVoices(): SpeechSynthesisVoice[];
  createUtterance(text: string): SpeechSynthesisUtterance;
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  readonly speaking: boolean;
  readonly paused: boolean;
  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => void) | null;
}

// ---------------------------------------------------------------------------
// Browser adapter factory
// ---------------------------------------------------------------------------

export function createBrowserAdapter(): SpeechSynthesisAdapter | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  const synth = window.speechSynthesis;
  return {
    getVoices: () => synth.getVoices(),
    createUtterance: (text: string) => new SpeechSynthesisUtterance(text),
    speak: (u) => synth.speak(u),
    cancel: () => synth.cancel(),
    get speaking() {
      return synth.speaking;
    },
    get paused() {
      return synth.paused;
    },
    onvoiceschanged: null,
  };
}

// ---------------------------------------------------------------------------
// AudioEngine
// ---------------------------------------------------------------------------

export class AudioEngine {
  private _adapter: SpeechSynthesisAdapter | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voiceScanComplete = false;

  /** Whether SpeechSynthesis is available and the engine is not disposed. */
  get isSupported(): boolean {
    return this._adapter !== null;
  }

  constructor(adapter?: SpeechSynthesisAdapter) {
    if (adapter) {
      this._adapter = adapter;
    } else {
      this._adapter = createBrowserAdapter();
    }
  }

  // ---- Private helpers ---------------------------------------------------

  /**
   * Select (and cache) the best available Arabic voice.
   * Preference order: `ar-SA` > `ar-XA` > any `ar-*` > browser default.
   * Once a voice has been selected the result is cached so `getVoices()` is
   * only called once unless `resetVoiceScan()` is explicitly invoked.
   */
  private selectVoice(): SpeechSynthesisVoice | null {
    if (!this._adapter) return null;
    if (this.voiceScanComplete) return this.selectedVoice;

    const voices = this._adapter.getVoices();

    const arSA = voices.find((v) => v.lang === 'ar-SA');
    if (arSA) {
      this.selectedVoice = arSA;
      this.voiceScanComplete = true;
      return arSA;
    }

    const arXA = voices.find((v) => v.lang === 'ar-XA');
    if (arXA) {
      this.selectedVoice = arXA;
      this.voiceScanComplete = true;
      return arXA;
    }

    const anyArabic = voices.find((v) => v.lang.startsWith('ar'));
    if (anyArabic) {
      this.selectedVoice = anyArabic;
      this.voiceScanComplete = true;
      return anyArabic;
    }

    // Fallback: first default voice, or first voice overall
    const fallback = voices.find((v) => v.default) ?? voices[0] ?? null;
    this.selectedVoice = fallback;
    this.voiceScanComplete = true;
    return fallback;
  }

  // ---- Public API --------------------------------------------------------

  /**
   * Pronounce a letter with the given vowel mode.
   *
   * Returns a Promise that resolves when the utterance finishes playing.
   * If SpeechSynthesis is unavailable the Promise resolves silently.
   * If a previous utterance is still playing it is cancelled first.
   */
  speak(letterChar: string, vowelMode: VowelMode): Promise<void> {
    if (!this._adapter) {
      return Promise.resolve();
    }

    const text = composeLetter(letterChar, vowelMode);
    const utterance = this._adapter.createUtterance(text);

    // Cancel any in-flight utterance before starting a new one (FR-2)
    if (this.currentUtterance) {
      this._adapter.cancel();
    }

    utterance.rate = 0.85;
    const voice = this.selectVoice();
    if (voice) {
      utterance.voice = voice;
    }

    this.currentUtterance = utterance;

    return new Promise<void>((resolve) => {
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        resolve(); // resolve silently on error (FR-3)
      };

      this._adapter!.speak(utterance);
    });
  }

  /** Cancel any ongoing utterance immediately. */
  cancel(): void {
    if (this._adapter) {
      this._adapter.cancel();
    }
    this.currentUtterance = null;
  }

  /** Reset the voice cache so the next `speak()` re-scans available voices. */
  resetVoiceScan(): void {
    this.voiceScanComplete = false;
    this.selectedVoice = null;
  }

  /** Tear down the engine and release resources. */
  dispose(): void {
    this.cancel();
    this._adapter = null;
    this.selectedVoice = null;
    this.voiceScanComplete = false;
  }
}

// ---------------------------------------------------------------------------
// Singleton convenience instance
// ---------------------------------------------------------------------------
// Components import `audioEngine` directly — no React context or hooks.
// For testing, construct `new AudioEngine(mockAdapter)` instead.
// ---------------------------------------------------------------------------

export const audioEngine = new AudioEngine();
