import { useState, useRef, useEffect } from 'react';
import { GoCalendar } from 'react-icons/go';
import type { TaskList } from '../../types/task';

interface NewTaskPageProps {
  lists: TaskList[];
  activeListId: string | null;
  onSave: (title: string, description: string, dueDate: number | undefined, listId: string) => void;
  onClose: () => void;
}

export function NewTaskPage({ lists, activeListId, onSave, onClose }: NewTaskPageProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedListId, setSelectedListId] = useState(activeListId ?? lists[0]?.id ?? '');
  const [showListPicker, setShowListPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!title.trim() || !selectedListId) return;
    const due = dueDate ? new Date(dueDate).getTime() : undefined;
    onSave(title.trim(), description.trim(), due, selectedListId);
  };

  const selectedList = lists.find((l) => l.id === selectedListId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-canvas)] rounded-radius-lg shadow-xl p-6">
        <h2 className="text-base font-medium text-[var(--color-ink)] mb-4">New Task</h2>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full h-11 px-4 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description (optional)"
            rows={2}
            className="w-full px-4 py-3 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm outline-none resize-none text-[var(--color-body)] placeholder:text-[var(--color-muted)]"
          />

          <div className="relative">
            <button
              onClick={() => setShowListPicker(!showListPicker)}
              className="w-full flex items-center justify-between h-11 px-4 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm text-[var(--color-body)]"
            >
              <span>{selectedList?.name ?? 'Select list'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showListPicker && (
              <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => { setSelectedListId(list.id); setShowListPicker(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${
                      list.id === selectedListId
                        ? 'bg-[var(--color-surface-soft)] text-[var(--color-ink)]'
                        : 'text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]'
                    }`}
                  >
                    {list.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <GoCalendar className="w-4 h-4 text-[var(--color-muted)]" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 h-11 px-4 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm outline-none text-[var(--color-ink)]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="h-10 px-4 text-sm text-[var(--color-muted)]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !selectedListId}
            className="h-10 px-5 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
