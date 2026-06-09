import { useState, useRef, useEffect, useCallback } from 'react';
import { GoArrowLeft, GoStar, GoStarFill, GoPlus, GoCheck, GoCalendar } from 'react-icons/go';
import type { Task, TaskList, Subtask } from '../../types/task';
import { generateId } from '../../utils/uuid';
import { SubtaskItem } from './SubtaskItem';

interface TaskDetailSheetProps {
  task: Task;
  lists: TaskList[];
  onUpdate: (task: Task) => void;
  onClose: () => void;
}

export function TaskDetailSheet({ task, lists, onUpdate, onClose }: TaskDetailSheetProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [isStarred, setIsStarred] = useState(task.isStarred);
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showListPicker, setShowListPicker] = useState(false);
  const [selectedListId, setSelectedListId] = useState(task.listId);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const currentTaskRef = useRef(task);
  currentTaskRef.current = task;

  const scheduleSave = useCallback((updatedTask: Task) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onUpdate(updatedTask);
    }, 500);
  }, [onUpdate]);

  const buildTask = useCallback((overrides: Partial<Task>): Task => {
    return { ...currentTaskRef.current, ...overrides, updatedAt: Date.now() };
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    scheduleSave(buildTask({ title: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    scheduleSave(buildTask({ description: value || undefined }));
  };

  const handleStarToggle = () => {
    const next = !isStarred;
    setIsStarred(next);
    scheduleSave(buildTask({ isStarred: next }));
  };

  const handleDueDateChange = (value: string) => {
    setDueDate(value);
    const ts = value ? new Date(value).getTime() : undefined;
    scheduleSave(buildTask({ dueDate: ts }));
  };

  const handleListChange = (listId: string) => {
    setSelectedListId(listId);
    setShowListPicker(false);
    scheduleSave(buildTask({ listId, order: 0 }));
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: generateId(),
      title: newSubtaskTitle.trim(),
      isCompleted: false,
      order: subtasks.length,
    };
    const next = [...subtasks, newSubtask];
    setSubtasks(next);
    setNewSubtaskTitle('');
    scheduleSave(buildTask({ subtasks: next }));
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    const next = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    setSubtasks(next);
    scheduleSave(buildTask({ subtasks: next }));
  };

  const handleSubtaskTitleChange = (subtaskId: string, value: string) => {
    const next = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, title: value } : st
    );
    setSubtasks(next);
    scheduleSave(buildTask({ subtasks: next }));
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const next = subtasks.filter((st) => st.id !== subtaskId);
    setSubtasks(next);
    scheduleSave(buildTask({ subtasks: next }));
  };

  const handleMarkCompleted = () => {
    onUpdate(buildTask({ isCompleted: true }));
    onClose();
  };

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const formatDate = (ts?: number) => {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const selectedList = lists.find((l) => l.id === selectedListId);
  const completedCount = subtasks.filter((st) => st.isCompleted).length;

  return (
    <div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto md:w-full md:max-w-lg bg-[var(--color-canvas)] md:rounded-radius-lg rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--color-canvas)] z-10 flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--color-hairline)]">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]">
            <GoArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={handleStarToggle} className={`w-10 h-10 rounded-full flex items-center justify-center ${isStarred ? 'text-yellow-500' : 'text-[var(--color-muted)]'}`}>
            {isStarred ? <GoStarFill className="w-5 h-5" /> : <GoStar className="w-5 h-5" />}
          </button>
        </div>

        <div className="px-4 pb-6 space-y-5 pt-4">
          <div className="relative">
            <button
              onClick={() => setShowListPicker(!showListPicker)}
              className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-body)]"
            >
              <span>{selectedList?.name ?? 'Select list'}</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showListPicker && (
              <div className="absolute top-full mt-1 left-0 z-10 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg shadow-lg py-1 min-w-[160px]">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleListChange(list.id)}
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

          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-lg font-medium text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-muted)]"
            placeholder="Task title"
          />

          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Add details"
            rows={2}
            className="w-full px-0 py-1 text-sm bg-transparent outline-none resize-none text-[var(--color-body)] placeholder:text-[var(--color-muted)] border-b border-transparent focus:border-[var(--color-hairline)]"
          />

          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-body)]"
          >
            <GoCalendar className="w-4 h-4" />
            {dueDate ? formatDate(task.dueDate) : 'Add deadline'}
          </button>

          {showDatePicker && (
            <input
              type="date"
              value={dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm outline-none text-[var(--color-ink)]"
            />
          )}

          <div>
            {subtasks.length > 0 && (
              <div className="space-y-1 mb-3">
                {subtasks.map((st) => (
                  <SubtaskItem
                    key={st.id}
                    subtask={st}
                    onToggle={handleSubtaskToggle}
                    onTitleChange={handleSubtaskTitleChange}
                    onDelete={handleDeleteSubtask}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <GoPlus className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
              <input
                data-new-subtask-input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask"
                className="flex-1 h-9 text-sm bg-transparent outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                }}
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-6">
          <button
            onClick={handleMarkCompleted}
            className="w-full h-12 rounded-full border border-[var(--color-hairline)] flex items-center justify-center gap-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <GoCheck className="w-4 h-4" />
            Mark completed
          </button>
        </div>
      </div>
    </div>
  );
}
