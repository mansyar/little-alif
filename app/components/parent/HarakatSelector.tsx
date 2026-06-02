import { useState, useEffect } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfileFn } from '~/server/profiles';
import { VOWEL_MODES } from '~/lib/utils/harakat';
import type { VowelMode } from '~/lib/utils/harakat';

interface HarakatSelectorProps {
  profileId: string;
  currentVowelMode: VowelMode;
}

const LABELS: Record<VowelMode, string> = {
  none: 'Plain',
  fathah: 'Fathah',
  kasrah: 'Kasrah',
  dammah: 'Dammah',
};

export function HarakatSelector({ profileId, currentVowelMode }: HarakatSelectorProps) {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Auto-clear mutation error after 5 seconds
  useEffect(() => {
    if (mutationError !== null) {
      const timer = setTimeout(() => setMutationError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mutationError]);

  const updateMutation = useMutation({
    mutationFn: (vowelMode: VowelMode) => updateProfileFn({ data: { profileId, vowelMode } }),
    onSuccess: () => {
      setMutationError(null);
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (err: Error) => {
      setMutationError(err.message ?? 'Failed to update vowel mode.');
    },
  });

  return (
    <div className="mb-4">
      <RadioGroup.Root
        value={currentVowelMode}
        onValueChange={(value) => {
          updateMutation.mutate(value as VowelMode);
        }}
        className="flex gap-1.5"
        aria-label="Vowel mode"
      >
        {VOWEL_MODES.map((mode) => {
          const isActive = mode === currentVowelMode;
          return (
            <RadioGroup.Item
              key={mode}
              value={mode}
              aria-label={LABELS[mode]}
              disabled={updateMutation.isPending}
              className={`rounded-small px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1 ${
                isActive
                  ? 'bg-green text-white'
                  : 'bg-sand-light text-text-muted hover:bg-sand-dark/20'
              } disabled:opacity-60`}
            >
              {LABELS[mode]}
            </RadioGroup.Item>
          );
        })}
      </RadioGroup.Root>

      {/* Mutation error message */}
      {mutationError !== null && <p className="mt-1 text-xs text-red-500">{mutationError}</p>}
    </div>
  );
}
