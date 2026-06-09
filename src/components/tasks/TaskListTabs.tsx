import { GoPlus } from 'react-icons/go';
import type { TaskList } from '../../types/task';

interface TaskListTabsProps {
  lists: TaskList[];
  activeListId: string | null;
  onSelect: (id: string) => void;
  onNewList: () => void;
}

export function TaskListTabs({ lists, activeListId, onSelect, onNewList }: TaskListTabsProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto scrollbar-none">
      {lists.map((list) => (
        <button
          key={list.id}
          onClick={() => onSelect(list.id)}
          className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap ${
            activeListId === list.id
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
              : 'bg-[var(--color-surface-soft)] text-[var(--color-body)] hover:bg-[var(--color-hairline)]'
          }`}
        >
          {list.name}
        </button>
      ))}
      <button
        onClick={onNewList}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-surface-soft)] text-[var(--color-muted)] flex items-center justify-center hover:bg-[var(--color-hairline)]"
        aria-label="New list"
      >
        <GoPlus className="w-4 h-4" />
      </button>
    </div>
  );
}
