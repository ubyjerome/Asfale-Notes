import { GoDotFill, GoArchive, GoTrash, GoX } from 'react-icons/go';
import { useState } from 'react';
import { ColorPicker } from './ColorPicker';

interface MultiSelectBarProps {
  count: number;
  onAssignColor: (color: string) => void;
  onArchive: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function MultiSelectBar({ count, onAssignColor, onArchive, onDelete, onCancel }: MultiSelectBarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 h-14 bg-[var(--color-canvas)] border-b border-[var(--color-hairline)] flex items-center justify-between px-4 md:left-60">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="w-10 h-10 rounded-full flex items-center justify-center">
            <GoX className="w-5 h-5 text-[var(--color-ink)]" />
          </button>
          <span className="text-sm font-medium text-[var(--color-ink)]">{count} selected</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]"
          >
            <GoDotFill className="w-5 h-5" />
          </button>
          <button
            onClick={onArchive}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]"
          >
            <GoArchive className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <GoTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
      {showColorPicker && (
        <div className="fixed top-14 left-0 right-0 z-30 bg-[var(--color-canvas)] border-b border-[var(--color-hairline)] md:left-60 shadow-lg">
          <ColorPicker selectedColor="" onSelect={(color) => { onAssignColor(color); setShowColorPicker(false); }} />
        </div>
      )}
    </>
  );
}
