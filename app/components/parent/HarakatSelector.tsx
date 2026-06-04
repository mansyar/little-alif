import * as RadioGroup from '@radix-ui/react-radio-group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfileFn } from '~/server/profiles';
import { VOWEL_MODES } from '~/lib/utils/harakat';
import type { VowelMode } from '~/lib/utils/harakat';
import { useI18nContext } from '~/lib/i18n';
import { useUiStore } from '~/stores/ui-store';

interface HarakatSelectorProps {
  profileId: string;
  currentVowelMode: VowelMode;
}

export function HarakatSelector({ profileId, currentVowelMode }: HarakatSelectorProps) {
  const queryClient = useQueryClient();
  const { LL } = useI18nContext();
  const pushToast = useUiStore((state) => state.pushToast);

  const LABELS: Record<VowelMode, string> = {
    none: LL.HARAKAT_PLAIN(),
    fathah: LL.HARAKAT_FATHAH(),
    kasrah: LL.HARAKAT_KASRAH(),
    dammah: LL.HARAKAT_DAMMAH(),
  };

  const updateMutation = useMutation({
    mutationFn: (vowelMode: VowelMode) => updateProfileFn({ data: { profileId, vowelMode } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (err: Error) => {
      pushToast({ variant: 'error', message: err.message ?? 'Could not update vowel mode.' });
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
    </div>
  );
}
