import { GoStar } from 'react-icons/go';
import type { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

export function TaskCard({ task, onToggleComplete, onToggleStar, onOpenDetail }: TaskCardProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-1.5 group">
      <button
        onClick={() => onToggleComplete(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          task.isCompleted
            ? 'bg-green-500 border-green-500'
            : 'border-[var(--color-border-strong)]'
        }`}
        aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.isCompleted && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <button
        onClick={() => onOpenDetail(task.id)}
        className={`flex-1 text-sm min-w-0 truncate text-left ${
          task.isCompleted
            ? 'line-through text-[var(--color-muted)]'
            : 'text-[var(--color-ink)]'
        }`}
      >
        {task.title}
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleStar(task.id); }}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          task.isStarred ? 'text-yellow-500' : 'text-[var(--color-muted)] opacity-0 group-hover:opacity-100'
        }`}
        aria-label={task.isStarred ? 'Unstar' : 'Star'}
      >
        <GoStar className={`w-4 h-4 ${task.isStarred ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
