import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GoChevronDown, GoChevronRight, GoPlus } from 'react-icons/go';
import type { Task } from '../../types/task';
import { TaskCard } from './TaskCard';
import { useCompletionTimer } from '../../hooks/useCompletionTimer';

interface TaskListViewProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onOpenDetail: (id: string) => void;
  onAddTask?: (title: string) => void;
}

const itemTransition = { duration: 0.25, ease: 'easeInOut' };

export function TaskListView({ tasks, onToggleComplete, onToggleStar, onToggleSubtask, onOpenDetail, onAddTask }: TaskListViewProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [showInlineInput, setShowInlineInput] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const { completingSet, handleToggle: handleToggleComplete } = useCompletionTimer(onToggleComplete);
  const inputRef = useRef<HTMLInputElement>(null);

  const uncompleted = tasks.filter((t) => !t.isCompleted).sort((a, b) => a.order - b.order);
  const completed = tasks.filter((t) => t.isCompleted).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleInlineAdd = () => {
    if (!inlineTitle.trim() || !onAddTask) return;
    onAddTask(inlineTitle.trim());
    setInlineTitle('');
    setShowInlineInput(false);
  };

  const renderSubtasks = (task: Task, completing?: boolean) => {
    if (task.subtasks.length === 0) return null;
    return (
      <div className="ml-6 pl-3">
        {task.subtasks.map((st) => (
          <div key={st.id} className="flex items-center gap-3 px-4 py-1.5 group">
            <button
              onClick={() => onToggleSubtask?.(task.id, st.id)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                st.isCompleted || completing
                  ? 'bg-green-500 border-green-500'
                  : 'border-[var(--color-border-strong)]'
              }`}
            >
              {(st.isCompleted || completing) && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <button
              onClick={() => onOpenDetail(task.id)}
              className={`flex-1 text-sm min-w-0 truncate text-left ${
                st.isCompleted || completing
                  ? 'line-through text-[var(--color-muted)]'
                  : 'text-[var(--color-ink)]'
              }`}
            >
              {st.title}
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (tasks.length === 0 && !onAddTask) {
    return (
      <div className="fade-in flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-[var(--color-muted)]">No tasks yet. Tap + to add one.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {showInlineInput && onAddTask && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-hairline)]">
          <input
            ref={inputRef}
            type="text"
            value={inlineTitle}
            onChange={(e) => setInlineTitle(e.target.value)}
            placeholder="Task name"
            className="flex-1 h-10 px-3 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInlineAdd();
              if (e.key === 'Escape') { setShowInlineInput(false); setInlineTitle(''); }
            }}
            autoFocus
          />
          <button
            onClick={handleInlineAdd}
            disabled={!inlineTitle.trim()}
            className="h-10 px-4 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      {uncompleted.length === 0 && !showInlineInput && (
        <div className="px-4 py-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-[var(--color-body)]">All done! Great work.</p>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {uncompleted.map((task) => {
          const completing = completingSet.has(task.id);
          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={itemTransition}
            >
              <TaskCard
                task={task}
                completing={completing}
                onToggleComplete={handleToggleComplete}
                onToggleStar={onToggleStar}
                onOpenDetail={onOpenDetail}
              />
              {renderSubtasks(task, completing)}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {onAddTask && !showInlineInput && (
        <motion.button
          onClick={() => { setShowInlineInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="hidden md:flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-body)] w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, ...itemTransition }}
        >
          <GoPlus className="w-4 h-4" />
          Add a task
        </motion.button>
      )}

      {completed.length > 0 && (
        <div className="border-t border-[var(--color-hairline)] mt-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-[var(--color-muted)] w-full"
          >
            {showCompleted ? <GoChevronDown className="w-3 h-3" /> : <GoChevronRight className="w-3 h-3" />}
            Completed ({completed.length})
          </button>
          <AnimatePresence>
            {showCompleted && completed.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                transition={itemTransition}
              >
                <TaskCard
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onToggleStar={onToggleStar}
                  onOpenDetail={onOpenDetail}
                />
                {renderSubtasks(task)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
