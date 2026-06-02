import { useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { audioEngine } from '~/lib/audio/audio-engine';
import { preloadOnIdle } from '~/lib/audio/preloader';

export const Route = createFileRoute('/learn')({
  component: LearnPage,
});

function LearnPage() {
  // Warm up SpeechSynthesis during idle time so the first real utterance
  // has near-instant latency instead of ~500ms cold-start delay.
  useEffect(() => {
    preloadOnIdle(audioEngine);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background-warm">
      <h1 className="font-arabic text-6xl font-bold text-green mb-4">لا</h1>
      <h2 className="text-3xl font-bold text-text-dark mb-2">Little Alif</h2>
      <p className="text-text-muted mb-8 max-w-md">Child letter grid — coming soon.</p>
      <Link
        to="/"
        className="px-6 py-3 rounded-small border-2 border-green text-green font-semibold hover:bg-green hover:text-white transition-colors"
      >
        Back to Home
      </Link>
    </main>
  );
}
