import { useState, useRef, useEffect } from 'react';

interface NewListDialogProps {
  onSave: (name: string) => void;
  onClose: () => void;
}

export function NewListDialog({ onSave, onClose }: NewListDialogProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--color-canvas)] rounded-radius-lg p-6 shadow-xl">
        <h2 className="text-base font-medium text-[var(--color-ink)] mb-4">New List</h2>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List name"
          className="w-full h-11 px-4 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="h-10 px-4 text-sm text-[var(--color-muted)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="h-10 px-5 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
