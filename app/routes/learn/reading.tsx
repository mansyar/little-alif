import { useEffect, useMemo, useRef, useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getReadingDataFn } from '~/server/reading';
import { generateReadingGroups } from '~/lib/utils/reading';
import type { VowelMode } from '~/lib/utils/harakat';
import { useAuthStore } from '~/stores/auth-store';
import { useUiStore } from '~/stores/ui-store';
import { useParentGateHandlers } from '~/lib/hooks/useParentGateHandlers';
import { ProfileBadge } from '~/components/child/ProfileBadge';
import { ParentGate } from '~/components/child/ParentGate';
import { ChildSwitcher } from '~/components/parent/ChildSwitcher';
import { ErrorBoundary } from '~/components/ui/ErrorBoundary';
import { ChildHarakatBar } from '~/components/child/ChildHarakatBar';
import { GroupHeader } from '~/components/child/reading/GroupHeader';
import { GroupPills } from '~/components/child/reading/GroupPills';
import { ReadingGrid } from '~/components/child/reading/ReadingGrid';
import { ReadingActions } from '~/components/child/reading/ReadingActions';

export const Route = createFileRoute('/learn/reading')({
  component: ReadingPage,
});

function ReadingPage() {
  return (
    <ErrorBoundary>
      <ReadingPageContent />
    </ErrorBoundary>
  );
}

function ReadingPageContent() {
  const profileId = useAuthStore((state) => state.childProfileId);

  if (!profileId) {
    return <SelectChildMessage />;
  }

  return <ReadingContent profileId={profileId} />;
}

function SelectChildMessage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background-warm animate-fadeInUp">
      <p className="text-text-muted mb-8 max-w-md">
        Select a child profile from the dashboard to start reading practice.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 rounded-small border-2 border-green text-green font-semibold hover:bg-green hover:text-white transition-colors"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}

interface ReadingContentProps {
  profileId: string;
}

function ReadingContent({ profileId }: ReadingContentProps) {
  const navigate = useNavigate();
  const currentHarakat = useUiStore((state) => state.currentHarakat);
  const setHarakat = useUiStore((state) => state.setHarakat);
  const { handleExit, handleSwitchChild, switcherOpen, setSwitcherOpen } = useParentGateHandlers();

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [randomHarakats, setRandomHarakats] = useState<VowelMode[][] | null>(null);

  // Wrap group index setters to clear random harakat mode on group switch
  const handleGroupSelect = (index: number) => {
    setCurrentGroupIndex(index);
    setRandomHarakats(null);
  };
  const handleNextGroup = () => {
    setCurrentGroupIndex((i) => (i + 1) % groups.length);
    setRandomHarakats(null);
  };

  const readingQuery = useQuery({
    queryKey: ['readingData', profileId],
    queryFn: () => getReadingDataFn({ data: { profileId } }),
  });

  // Groups and letter lookup, recomputed when data changes
  const { groups, letterChars } = useMemo(() => {
    if (!readingQuery.data) {
      return { groups: [], letterChars: {} };
    }
    const chars: Record<string, string> = {};
    for (const letter of readingQuery.data.letters) {
      chars[letter.letterId] = letter.character;
    }
    const grouped = generateReadingGroups(
      readingQuery.data.letters.map((l) => l.letterId),
      (id) => chars[id] ?? id,
    );
    return { groups: grouped, letterChars: chars };
  }, [readingQuery.data]);

  // One-shot: sync harakat from profile data on first load only
  const initialHarakatSet = useRef(false);
  useEffect(() => {
    if (readingQuery.data && !initialHarakatSet.current) {
      initialHarakatSet.current = true;
      setHarakat(readingQuery.data.vowelMode);
    }
  }, [readingQuery.data, setHarakat]);

  // Clear random harakat mode when user picks a different vowel via the harakat bar.
  // Uses Zustand subscribe (callback-based) to avoid sync setState-in-effect lint rule.
  useEffect(() => {
    const unsub = useUiStore.subscribe((state, prevState) => {
      if (state.currentHarakat !== prevState.currentHarakat) {
        setRandomHarakats(null);
      }
    });
    return unsub;
  }, []);

  // Redirect to /learn if fewer than 3 letters
  useEffect(() => {
    if (readingQuery.data && readingQuery.data.letters.length < 3) {
      void navigate({ to: '/learn' });
    }
  }, [readingQuery.data, navigate]);

  // Loading
  if (readingQuery.isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background-warm animate-fadeInUp">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-sand-dark border-t-green"
          aria-label="Loading"
        />
      </main>
    );
  }

  // Error
  if (readingQuery.isError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background-warm animate-fadeInUp">
        <p className="text-red-600 mb-4 max-w-md">
          {readingQuery.error instanceof Error
            ? readingQuery.error.message
            : 'Failed to load reading data.'}
        </p>
        <button
          type="button"
          onClick={() => void readingQuery.refetch()}
          className="text-sm font-semibold text-red-700 underline"
        >
          Try again
        </button>
      </main>
    );
  }

  // Defensive guard — redirect effect handles < 3 letters, but also guard render
  if (!readingQuery.data || readingQuery.data.letters.length < 3) {
    return null;
  }

  const activeGroup = groups[currentGroupIndex];
  if (!activeGroup) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col bg-background-warm animate-fadeInUp">
      <div className="flex items-center justify-between px-6 py-4 border-b border-sand-light">
        <ProfileBadge profile={null} />
        <ParentGate onExit={handleExit} onSwitchChild={handleSwitchChild} />
      </div>

      <ChildSwitcher
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        activeProfileId={profileId}
      />

      <div className="flex justify-center px-4 py-3">
        <ChildHarakatBar />
      </div>

      <div className="flex flex-col items-center px-4 py-4 gap-6">
        <GroupHeader group={activeGroup} vowelMode={currentHarakat} letterChars={letterChars} />

        {groups.length > 1 && (
          <GroupPills
            groups={groups}
            activeIndex={currentGroupIndex}
            onSelect={handleGroupSelect}
          />
        )}

        <ReadingGrid
          group={activeGroup}
          letterChars={letterChars}
          randomHarakats={randomHarakats}
          key={`grid-${shuffleSeed}-${currentGroupIndex}`}
        />

        <ReadingActions
          groups={groups}
          onShuffle={() => setShuffleSeed((s) => s + 1)}
          onNext={handleNextGroup}
          onDone={() => {
            void navigate({ to: '/learn' });
          }}
          onRandomizeHarakat={() => {
            const harakatOpts: VowelMode[] = ['fathah', 'kasrah', 'dammah'];
            const newRows: VowelMode[][] = [];
            const letterCount = activeGroup.letters.length;
            for (let r = 0; r < 6; r++) {
              const row: VowelMode[] = [];
              for (let c = 0; c < letterCount; c++) {
                row.push(harakatOpts[Math.floor(Math.random() * harakatOpts.length)]!);
              }
              newRows.push(row);
            }
            setRandomHarakats(newRows);
          }}
        />
      </div>
    </main>
  );
}
