import { useState, type KeyboardEvent } from 'react';
import { GoX } from 'react-icons/go';

interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

export function TagInput({ tags, onAdd, onRemove }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = input.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        onAdd(tag);
      }
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-sm">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-[var(--color-surface-soft)] text-[var(--color-body)] rounded-full"
        >
          {tag}
          <button onClick={() => onRemove(tag)} className="w-3.5 h-3.5 flex items-center justify-center">
            <GoX className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? 'Add tag...' : ''}
        className="flex-1 min-w-[80px] h-7 text-sm bg-transparent outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
      />
    </div>
  );
}
