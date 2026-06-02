import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Switch from '@radix-ui/react-switch';
import { getVisibleLettersFn, toggleLetterFn, bulkToggleLettersFn } from '~/server/letters';
import { LETTER_IDS } from '~/db/schema';
import type { LetterId } from '~/db/schema';
import { useI18nContext } from '~/lib/i18n';
import type { VisibleLetter } from '~/server/letters';

interface LetterToggleGridProps {
  profileId: string;
}

export function LetterToggleGrid({ profileId }: LetterToggleGridProps) {
  const { LL } = useI18nContext();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Auto-clear mutation error after 5 seconds
  useEffect(() => {
    if (mutationError !== null) {
      const timer = setTimeout(() => setMutationError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mutationError]);

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
      setMutationError(null);
      void queryClient.invalidateQueries({ queryKey: ['visibleLetters', profileId] });
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (err: Error) => {
      setMutationError(err.message ?? LL.ERROR_GENERIC());
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ isVisible }: { isVisible: boolean }) =>
      bulkToggleLettersFn({ data: { profileId, letterIds: [...LETTER_IDS], isVisible } }),
    onSuccess: () => {
      setMutationError(null);
      void queryClient.invalidateQueries({ queryKey: ['visibleLetters', profileId] });
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (err: Error) => {
      setMutationError(err.message ?? LL.ERROR_GENERIC());
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

      {/* Mutation error message */}
      {mutationError !== null && (
        <div className="mb-4 rounded-large bg-red-50 p-3 text-center">
          <p className="text-sm text-red-600">{mutationError}</p>
        </div>
      )}

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
                toggleMutation.mutate({
                  letterId: letter.letterId as LetterId,
                  isVisible: checked,
                });
              }}
              disabled={anyPending}
              className="relative h-5 w-9 rounded-full bg-sand-dark data-[state=checked]:bg-green"
            >
              <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]" />
            </Switch.Root>
          </div>
        ))}
      </div>
    </div>
  );
}
