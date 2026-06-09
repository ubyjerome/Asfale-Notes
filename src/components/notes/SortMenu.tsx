import { GoArrowSwitch } from 'react-icons/go';
import { useState } from 'react';
import type { SortOption } from '../../types/note';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'color', label: 'Color' },
  { value: 'created-desc', label: 'Created (newest)' },
  { value: 'created-asc', label: 'Created (oldest)' },
  { value: 'updated-desc', label: 'Updated (newest)' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
];

interface SortMenuProps {
  current: SortOption;
  onChange: (option: SortOption) => void;
}

export function SortMenu({ current, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === current)?.label ?? 'Sort';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-10 px-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] rounded-radius-lg hover:bg-[var(--color-surface-soft)]"
      >
        <GoArrowSwitch className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLabel}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg shadow-lg py-1">
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  onChange(value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm ${
                  current === value
                    ? 'text-[var(--color-ink)] font-medium bg-[var(--color-surface-soft)]'
                    : 'text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
