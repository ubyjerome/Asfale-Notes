import { GoSearch, GoX } from 'react-icons/go';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChange, autoFocus }: SearchBarProps) {
  return (
    <div className="relative px-4 pt-4 pb-2">
      <div className="relative">
        <GoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search notes..."
          autoFocus={autoFocus}
          className="w-full h-12 pl-10 pr-10 text-sm bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] rounded-radius-lg outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-link)]"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)]"
          >
            <GoX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
