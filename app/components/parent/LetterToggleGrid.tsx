import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Switch from '@radix-ui/react-switch';
import { getVisibleLettersFn, toggleLetterFn, bulkToggleLettersFn } from '~/server/letters';
import { LETTER_IDS } from '~/db/schema';
import type { LetterId } from '~/db/schema';
import { useI18nContext } from '~/lib/i18n';
import type { VisibleLetter } from '~/server/letters';
import { useDebouncedCallback } from '~/lib/utils/useDebouncedCallback';
import type { VowelMode } from '~/lib/utils/harakat';
import { useUiStore } from '~/stores/ui-store';
import { HarakatSelector } from './HarakatSelector';

interface LetterToggleGridProps {
  profileId: string;
  vowelMode: VowelMode;
}

export function LetterToggleGrid({ profileId, vowelMode }: LetterToggleGridProps) {
  const { LL } = useI18nContext();
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);

  const {
    data: letters,
    isLoading,
    isError,
    error,
  } = useQuery<VisibleLetter[]>({
    queryKey: ['visibleLetters', profileId],
    queryFn: () => getVisibleLettersFn({ data: { profileId } }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ letterId, isVisible }: { letterId: LetterId; isVisible: boolean }) =>
      toggleLetterFn({ data: { profileId, letterId, isVisible } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['visibleLetters', profileId] });
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (err: Error) => {
      pushToast({ variant: 'error', message: err.message ?? LL.ERROR_GENERIC() });
    },
  });

  // Debounce individual toggles: rapid clicks produce a single server call after 300ms
  const debouncedToggle = useDebouncedCallback(
    useCallback(
      (letterId: LetterId, isVisible: boolean) => {
        toggleMutation.mutate({ letterId, isVisible });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps -- toggleMutation.mutate is stable
      [toggleMutation.mutate],
    ),
    300,
  );

  const bulkMutation = useMutation({
    mutationFn: ({ isVisible }: { isVisible: boolean }) =>
      bulkToggleLettersFn({ data: { profileId, letterIds: [...LETTER_IDS], isVisible } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['visibleLetters', profileId] });
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (err: Error) => {
      pushToast({ variant: 'error', message: err.message ?? LL.ERROR_GENERIC() });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sand-dark border-t-green" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-large bg-red-50 p-4 text-center">
        <p className="text-red-600">
          {error instanceof Error ? error.message : LL.ERROR_GENERIC()}
        </p>
      </div>
    );
  }

  const anyPending = toggleMutation.isPending || bulkMutation.isPending;

  return (
    <div>
      {/* Vowel mode selector */}
      <HarakatSelector profileId={profileId} currentVowelMode={vowelMode} />

      {/* Show All / Hide All toolbar */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => bulkMutation.mutate({ isVisible: true })}
          disabled={bulkMutation.isPending}
          className="rounded-small bg-green px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-green/90 disabled:opacity-60"
        >
          {LL.LETTERS_SHOW()}
        </button>
        <button
          type="button"
          onClick={() => bulkMutation.mutate({ isVisible: false })}
          disabled={bulkMutation.isPending}
          className="rounded-small border border-sand-dark px-4 py-1.5 text-sm font-medium text-text-dark transition-colors hover:bg-sand-light disabled:opacity-60"
        >
          {LL.LETTERS_HIDE()}
        </button>
      </div>

      {/* 28-letter grid */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
        {(letters ?? []).map((letter) => (
          <div
            key={letter.letterId}
            className="flex flex-col items-center gap-2 rounded-large bg-white p-3 shadow-card"
          >
            <span className="pt-1 text-2xl leading-none text-text-dark">{letter.character}</span>
            <Switch.Root
              checked={letter.isVisible}
              onCheckedChange={(checked) => {
                debouncedToggle(letter.letterId as LetterId, checked);
              }}
              disabled={anyPending}
              className="relative h-6 w-11 rounded-full bg-sand-dark data-[state=checked]:bg-green"
            >
              <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[26px]" />
            </Switch.Root>
          </div>
        ))}
      </div>
    </div>
  );
}
