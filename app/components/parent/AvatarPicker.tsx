import * as RadioGroup from '@radix-ui/react-radio-group';
import { AVATAR_MAP } from './avatars';
import { AVATAR_KEYS } from '~/db/schema';
import type { AvatarKey } from '~/db/schema';
import { useI18nContext } from '~/lib/i18n';

interface AvatarPickerProps {
  value: AvatarKey | null;
  onValueChange: (value: AvatarKey) => void;
}

export function AvatarPicker({ value, onValueChange }: AvatarPickerProps) {
  const { LL } = useI18nContext();

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-dark">{LL.PROFILE_AVATAR()}</label>
      <RadioGroup.Root
        value={value ?? ''}
        onValueChange={onValueChange}
        className="grid grid-cols-4 gap-3"
        aria-label={LL.PROFILE_AVATAR()}
      >
        {AVATAR_KEYS.map((key) => {
          const AvatarComponent = AVATAR_MAP[key];
          const isSelected = value === key;
          return (
            <RadioGroup.Item
              key={key}
              value={key}
              aria-label={key}
              className={`flex aspect-square items-center justify-center rounded-large border-2 p-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-green bg-green/10'
                  : 'border-sand-dark/30 bg-white hover:border-sand-dark/60'
              }`}
            >
              {AvatarComponent ? (
                <AvatarComponent className="h-full w-full" />
              ) : (
                <span className="text-lg text-text-muted">?</span>
              )}
            </RadioGroup.Item>
          );
        })}
      </RadioGroup.Root>
    </div>
  );
}
