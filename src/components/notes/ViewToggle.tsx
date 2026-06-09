import { GoTable, GoListUnordered, GoColumns } from 'react-icons/go';
import type { ViewMode } from '../../types/note';

interface ViewToggleProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const VIEWS: { mode: ViewMode; icon: typeof GoTable }[] = [
  { mode: 'grid', icon: GoTable },
  { mode: 'list', icon: GoListUnordered },
  { mode: 'detailed', icon: GoColumns },
];

export function ViewToggle({ current, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-[var(--color-surface-soft)] rounded-radius-lg p-0.5">
      {VIEWS.map(({ mode, icon: Icon }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`w-9 h-9 rounded-radius-md flex items-center justify-center ${
            current === mode
              ? 'bg-[var(--color-canvas)] text-[var(--color-ink)] shadow-sm'
              : 'text-[var(--color-muted)] hover:text-[var(--color-body)]'
          }`}
          aria-label={`${mode} view`}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
