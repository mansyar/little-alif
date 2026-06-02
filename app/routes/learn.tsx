import { useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { audioEngine } from '~/lib/audio/audio-engine';
import { preloadOnIdle } from '~/lib/audio/preloader';
import { getActiveProfileFn } from '~/server/profiles';
import { getVisibleLettersFn, type VisibleLetter } from '~/server/letters';
import { useAuthStore } from '~/stores/auth-store';
import { useUiStore } from '~/stores/ui-store';
import { ProfileBadge } from '~/components/child/ProfileBadge';
import { ChildHarakatBar } from '~/components/child/ChildHarakatBar';
import { LetterGrid } from '~/components/child/LetterGrid';

export const Route = createFileRoute('/learn')({
  component: LearnPage,
});

function LearnPage() {
  // Warm up SpeechSynthesis during idle time so the first real utterance
  // has near-instant latency instead of ~500ms cold-start delay.
  useEffect(() => {
    preloadOnIdle(audioEngine);
  }, []);

  const profileId = useAuthStore((state) => state.childProfileId);

  // Render branches are separated into their own components so each has
  // a stable hook list (avoids conditional-hook violations).
  if (!profileId) {
    return <SelectChildMessage />;
  }

  return <LearnContent profileId={profileId} />;
}

function SelectChildMessage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background-warm">
      <p className="text-text-muted mb-8 max-w-md">
        Select a child profile from the dashboard to start learning.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-small border-2 border-green text-green font-semibold hover:bg-green hover:text-white transition-colors"
      >
        Back to Home
      </Link>
    </main>
  );
}

interface LearnContentProps {
  profileId: string;
}

function LearnContent({ profileId }: LearnContentProps) {
  const currentHarakat = useUiStore((state) => state.currentHarakat);

  const profileQuery = useQuery({
    queryKey: ['activeProfile', profileId],
    queryFn: () => getActiveProfileFn({ data: { profileId } }),
  });

  const lettersQuery = useQuery<VisibleLetter[]>({
    queryKey: ['visibleLetters', profileId],
    queryFn: () => getVisibleLettersFn({ data: { profileId } }),
  });

  // Loading: any of the two queries still pending.
  if (profileQuery.isLoading || lettersQuery.isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background-warm">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-sand-dark border-t-green"
          aria-label="Loading"
        />
      </main>
    );
  }

  // Error: profile fetch failure → show the message but keep the grid working
  // for the common case (the active profile is rarely missing; letters is the
  // data the child actually needs).
  if (profileQuery.isError) {
    return (
      <ErrorRetry
        message={
          profileQuery.error instanceof Error
            ? profileQuery.error.message
            : 'Failed to load profile.'
        }
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  if (lettersQuery.isError) {
    return (
      <ErrorRetry
        message={
          lettersQuery.error instanceof Error
            ? lettersQuery.error.message
            : 'Failed to load letters.'
        }
        onRetry={() => void lettersQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data ?? null;
  const visibleLetters = (lettersQuery.data ?? []).filter((l) => l.isVisible);
  const canStartReading = visibleLetters.length >= 3;

  return (
    <main className="min-h-screen flex flex-col bg-background-warm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-sand-light">
        <ProfileBadge profile={profile ? { name: profile.name, avatar: profile.avatar } : null} />
        <Link to="/" className="text-sm text-text-muted hover:text-text-dark">
          Back
        </Link>
      </div>

      <div className="flex justify-center px-4 py-3">
        <ChildHarakatBar />
      </div>

      <div className="flex-1">
        <LetterGrid visibleLetters={visibleLetters} currentHarakat={currentHarakat} />
      </div>

      <div className="flex justify-center px-4 py-6">
        <button
          type="button"
          disabled={!canStartReading}
          className="rounded-large bg-green px-6 py-3 text-white font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reading Practice
        </button>
      </div>
    </main>
  );
}

interface ErrorRetryProps {
  message: string;
  onRetry: () => void;
}

function ErrorRetry({ message, onRetry }: ErrorRetryProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background-warm">
      <p className="text-red-600 mb-4 max-w-md">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="text-sm font-semibold text-red-700 underline"
      >
        Try again
      </button>
    </main>
  );
}
