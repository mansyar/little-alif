import { useEffect } from 'react';
import { useUiStore } from '~/stores/ui-store';
import { VOWEL_MODES, type VowelMode } from '~/lib/utils/harakat';
import { readHarakatCookie, writeHarakatCookie } from '~/lib/utils/harakat-cookie';

const LABELS: Record<VowelMode, string> = {
  none: 'Plain',
  fathah: 'Fathah',
  kasrah: 'Kasrah',
  dammah: 'Dammah',
};

export function ChildHarakatBar() {
  const currentHarakat = useUiStore((state) => state.currentHarakat);
  const setHarakat = useUiStore((state) => state.setHarakat);

  // On mount, restore the child's last harakat selection from session cookie
  useEffect(() => {
    const saved = readHarakatCookie();
    if (saved !== null) {
      setHarakat(saved);
    }
  }, [setHarakat]);

  const handleHarakatChange = (mode: VowelMode) => {
    setHarakat(mode);
    writeHarakatCookie(mode);
  };

  return (
    <div className="flex gap-2" role="group" aria-label="Vowel mode">
      {VOWEL_MODES.map((mode) => {
        const isActive = mode === currentHarakat;
        return (
          <button
            key={mode}
            type="button"
            aria-label={LABELS[mode]}
            aria-pressed={isActive}
            onClick={() => handleHarakatChange(mode)}
            className={`min-h-[44px] min-w-[44px] rounded-small px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-1 ${
              isActive
                ? 'bg-green text-white shadow-sm'
                : 'bg-sand-light text-text-muted hover:bg-sand-dark/20 active:bg-sand-dark/30'
            }`}
          >
            {LABELS[mode]}
          </button>
        );
      })}
    </div>
  );
}
