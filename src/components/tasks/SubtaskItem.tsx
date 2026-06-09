import { GoTrash } from 'react-icons/go';
import type { Subtask } from '../../types/task';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function SubtaskItem({ subtask, onToggle, onTitleChange, onDelete }: SubtaskItemProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-radius-sm hover:bg-[var(--color-surface-soft)] group">
      <button
        onClick={() => onToggle(subtask.id)}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          subtask.isCompleted
            ? 'bg-green-500 border-green-500'
            : 'border-[var(--color-border-strong)]'
        }`}
      >
        {subtask.isCompleted && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <input
        type="text"
        value={subtask.title}
        onChange={(e) => onTitleChange(subtask.id, e.target.value)}
        className={`flex-1 text-sm bg-transparent outline-none ${
          subtask.isCompleted
            ? 'line-through text-[var(--color-muted)]'
            : 'text-[var(--color-ink)]'
        }`}
      />
      <button
        onClick={() => onDelete(subtask.id)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)] opacity-0 group-hover:opacity-100 hover:text-red-500"
      >
        <GoTrash className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
