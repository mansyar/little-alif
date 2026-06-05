import type { ReadingGroup } from '~/lib/utils/reading';

interface GroupPillsProps {
  groups: ReadingGroup[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function GroupPills({ groups, activeIndex, onSelect }: GroupPillsProps) {
  return (
    <div role="tablist" className="flex gap-2 overflow-x-auto">
      {groups.map((group, index) => {
        const isActive = index === activeIndex;
        const isClickable = isActive || group.isComplete;

        let className =
          'min-h-[44px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors';

        if (isActive) {
          className += ' bg-green text-white';
        } else if (group.isComplete) {
          className += ' border border-green text-green-dark bg-white';
        } else {
          className += ' border border-sand-dark text-text-muted bg-white';
        }

        return (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-label={`Group ${group.id}: ${group.label}`}
            aria-current={isActive ? 'true' : undefined}
            aria-disabled={!isClickable ? 'true' : undefined}
            disabled={!isClickable}
            title={!group.isComplete ? 'Needs 3 letters' : undefined}
            onClick={() => {
              if (isClickable && !isActive) {
                onSelect(index);
              }
            }}
            className={className}
          >
            {group.label}
          </button>
        );
      })}
    </div>
  );
}
