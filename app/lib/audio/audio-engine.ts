import { type VowelMode, composeLetter } from '~/lib/utils/harakat';

// ---------------------------------------------------------------------------
// Browser SpeechSynthesis adapter (lazy, SSR-safe)
// ---------------------------------------------------------------------------

function createBrowserAdapter(): {
  synth: SpeechSynthesis;
  cancel: () => void;
  speak: (utterance: SpeechSynthesisUtterance) => void;
  createUtterance: (text: string) => SpeechSynthesisUtterance;
  getVoices: () => SpeechSynthesisVoice[];
  onvoiceschanged: (() => void) | null;
} | null {
  if (typeof window === 'undefined') return null;
  const synth = window.speechSynthesis;
  if (!synth) return null;

  return {
    synth,
    cancel: () => synth.cancel(),
    speak: (utterance: SpeechSynthesisUtterance) => synth.speak(utterance),
    createUtterance: (text: string) => new SpeechSynthesisUtterance(text),
    getVoices: () => synth.getVoices(),
    set onvoiceschanged(handler: (() => void) | null) {
      (synth as unknown as { onvoiceschanged: (() => void) | null }).onvoiceschanged = handler;
    },
    get onvoiceschanged(): (() => void) | null {
      return synth.onvoiceschanged as (() => void) | null;
    },
  };
}

type BrowserAdapter = NonNullable<ReturnType<typeof createBrowserAdapter>>;

// ---------------------------------------------------------------------------
// AudioEngine — MP3 primary, Web Speech API fallback
// ---------------------------------------------------------------------------

export class AudioEngine {
  private mp3Audio: HTMLAudioElement | null = null;
  private currentResolve: (() => void) | null = null;
  private isDisposed = false;

  // Web Speech fallback state
  private synthAdapter: BrowserAdapter | null = null;
  private voiceScanComplete = false;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  private ensureAdapter(): BrowserAdapter | null {
    if (this.synthAdapter) return this.synthAdapter;
    this.synthAdapter = createBrowserAdapter();
    if (this.synthAdapter) {
      this.synthAdapter.onvoiceschanged = () => {
        this.scanVoices();
      };
      // Initial scan — voices may already be loaded
      this.scanVoices();
    }
    return this.synthAdapter;
  }

  private scanVoices(): void {
    const adapter = this.synthAdapter;
    if (!adapter) return;
    const voices = adapter.getVoices();
    if (voices.length === 0) return;
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    this.selectedVoice = arabicVoice ?? null;
    this.voiceScanComplete = true;
  }

  private selectVoice(): SpeechSynthesisVoice | null {
    if (this.voiceScanComplete) return this.selectedVoice;
    this.scanVoices();
    return this.selectedVoice;
  }

  get isSupported(): boolean {
    if (this.isDisposed) return false;
    if (typeof window === 'undefined') return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Audio.prototype.play is a known browser API
    return typeof Audio !== 'undefined' && typeof Audio.prototype.play === 'function';
  }

  /**
   * Play the audio for a letter.
   *
   * Tries MP3 first. If the audio file fails to load, falls back to the
   * Web Speech API with `ar-SA` language hint and any available Arabic voice.
   * This ensures the app works even when audio files are missing or loading
   * fails (e.g. during development or network issues).
   */
  speak(letterId: string, vowelMode: VowelMode, letterChar: string): Promise<void> {
    if (!this.isSupported) {
      return Promise.resolve();
    }

    this.cancel();

    const url =
      vowelMode === 'none'
        ? `/audio/letters/${letterId}.mp3`
        : `/audio/letters/${letterId}_${vowelMode}.mp3`;

    const audio = new Audio(url);
    this.mp3Audio = audio;

    return new Promise<void>((resolve) => {
      this.currentResolve = resolve;

      audio.addEventListener('ended', () => {
        this.mp3Audio = null;
        this.currentResolve = null;
        resolve();
      });

      const onMp3Fail = () => {
        this.mp3Audio = null;
        // Don't nullify currentResolve here — the fallback chain will
        // handle it when the Web Speech utterance finishes or is cancelled.
        void this.fallbackToSpeech(letterChar, vowelMode).then(() => {
          this.currentResolve = null;
          resolve();
        });
      };

      audio.addEventListener('error', onMp3Fail);

      // play() can reject without firing the 'error' event (e.g. autoplay
      // policy blocking the first play in a session). Catch the rejection
      // and route to the same fallback path.
      audio.play().catch(onMp3Fail);
    });
  }

  private fallbackToSpeech(letterChar: string, vowelMode: VowelMode): Promise<void> {
    const adapter = this.ensureAdapter();
    if (!adapter) return Promise.resolve();

    // Chrome bug workaround: always cancel before speaking
    adapter.cancel();

    const text = composeLetter(letterChar, vowelMode);
    const utterance = adapter.createUtterance(text);
    utterance.rate = 0.85;
    utterance.lang = 'ar-SA';

    const voice = this.selectVoice();
    if (voice) utterance.voice = voice;

    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      adapter.speak(utterance);
    });
  }

  cancel(): void {
    // Cancel MP3
    if (this.mp3Audio) {
      this.mp3Audio.pause();
      this.mp3Audio.currentTime = 0;
      this.mp3Audio = null;
    }
    // Cancel Web Speech
    if (this.synthAdapter) {
      this.synthAdapter.cancel();
    }
    // Resolve any pending promise so callers don't hang
    if (this.currentResolve) {
      this.currentResolve();
      this.currentResolve = null;
    }
  }

  dispose(): void {
    this.cancel();
    this.isDisposed = true;
    this.synthAdapter = null;
    this.selectedVoice = null;
    this.voiceScanComplete = false;
  }
}

export const audioEngine = new AudioEngine();
