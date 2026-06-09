import { useState, useRef } from 'react';
import { GoPlus, GoKebabHorizontal, GoChevronDown, GoChevronRight } from 'react-icons/go';
import type { Task, TaskList } from '../../types/task';
import { TaskCard } from './TaskCard';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface DesktopTasksGridProps {
  lists: TaskList[];
  tasks: Task[];
  activeListId: string | null;
  onSelectList: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onOpenDetail: (id: string) => void;
  onAddTask: (listId: string, title: string) => void;
  onRenameList: (listId: string, name: string) => void;
  onDeleteList: (listId: string) => void;
}

export function DesktopTasksGrid({
  lists,
  tasks,
  activeListId,
  onToggleComplete,
  onToggleStar,
  onToggleSubtask,
  onOpenDetail,
  onAddTask,
  onRenameList,
  onDeleteList,
}: DesktopTasksGridProps) {
  return (
    <div className="hidden md:grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 p-4">
      {lists.map((list) => (
        <TaskListPanel
          key={list.id}
          list={list}
          tasks={tasks.filter((t) => t.listId === list.id)}
          onToggleComplete={onToggleComplete}
          onToggleStar={onToggleStar}
          onToggleSubtask={onToggleSubtask}
          onOpenDetail={onOpenDetail}
          onAddTask={onAddTask}
          onRenameList={onRenameList}
          onDeleteList={onDeleteList}
        />
      ))}
    </div>
  );
}

interface TaskListPanelProps {
  list: TaskList;
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onOpenDetail: (id: string) => void;
  onAddTask: (listId: string, title: string) => void;
  onRenameList: (listId: string, name: string) => void;
  onDeleteList: (listId: string) => void;
}

function TaskListPanel({
  list,
  tasks,
  onToggleComplete,
  onToggleStar,
  onToggleSubtask,
  onOpenDetail,
  onAddTask,
  onRenameList,
  onDeleteList,
}: TaskListPanelProps) {
  const [showInlineInput, setShowInlineInput] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(list.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const uncompleted = tasks.filter((t) => !t.isCompleted).sort((a, b) => a.order - b.order);
  const completed = tasks.filter((t) => t.isCompleted).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleAdd = () => {
    if (!inlineTitle.trim()) return;
    onAddTask(list.id, inlineTitle.trim());
    setInlineTitle('');
    setShowInlineInput(false);
  };

  const handleStartRename = () => {
    setRenameValue(list.name);
    setRenaming(true);
    setShowMenu(false);
    setTimeout(() => renameRef.current?.focus(), 50);
  };

  const handleCommitRename = () => {
    if (renameValue.trim() && renameValue.trim() !== list.name) {
      onRenameList(list.id, renameValue.trim());
    }
    setRenaming(false);
  };

  const handleCancelRename = () => {
    setRenameValue(list.name);
    setRenaming(false);
  };

  return (
    <div className="bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-hairline)]">
        {renaming ? (
          <input
            ref={renameRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="flex-1 text-sm font-semibold text-[var(--color-ink)] bg-transparent outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommitRename();
              if (e.key === 'Escape') handleCancelRename();
              if (e.key === 'Tab') handleCommitRename();
            }}
            onBlur={handleCommitRename}
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-semibold text-[var(--color-ink)] cursor-pointer"
            onClick={handleStartRename}
          >
            {list.name}
          </h3>
        )}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]"
          >
            <GoKebabHorizontal className="w-4 h-4 rotate-90" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg shadow-lg py-1 min-w-[140px]">
              <button
                onClick={handleStartRename}
                className="w-full text-left px-4 py-2 text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]"
              >
                Rename list
              </button>
              <button
                onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[var(--color-surface-soft)]"
              >
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      {showInlineInput && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-hairline)]">
          <input
            ref={inputRef}
            type="text"
            value={inlineTitle}
            onChange={(e) => setInlineTitle(e.target.value)}
            placeholder="Task name"
            className="flex-1 h-10 px-3 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setShowInlineInput(false); setInlineTitle(''); }
            }}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!inlineTitle.trim()}
            className="h-10 px-4 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}

      <div>
        {uncompleted.map((task) => (
          <div key={task.id}>
            <TaskCard
              task={task}
              onToggleComplete={onToggleComplete}
              onToggleStar={onToggleStar}
              onOpenDetail={onOpenDetail}
            />
            {task.subtasks.length > 0 && (
              <div className="ml-6 pl-3">
                {task.subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-3 px-4 py-1.5 group">
                    <button
                      onClick={() => onToggleSubtask?.(task.id, st.id)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        st.isCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-[var(--color-border-strong)]'
                      }`}
                    >
                      {st.isCompleted && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => onOpenDetail(task.id)}
                      className={`flex-1 text-xs min-w-0 truncate text-left ${
                        st.isCompleted
                          ? 'line-through text-[var(--color-muted)]'
                          : 'text-[var(--color-ink)]'
                      }`}
                    >
                      {st.title}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => { setShowInlineInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--color-muted)] hover:text-[var(--color-body)] w-full border-b border-[var(--color-hairline)]"
      >
        <GoPlus className="w-4 h-4" />
        Add a task
      </button>

      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-[var(--color-muted)] w-full"
          >
            {showCompleted ? <GoChevronDown className="w-3 h-3" /> : <GoChevronRight className="w-3 h-3" />}
            Completed ({completed.length})
          </button>
          {showCompleted && completed.map((task) => (
            <div key={task.id}>
              <TaskCard
                task={task}
                onToggleComplete={onToggleComplete}
                onToggleStar={onToggleStar}
                onOpenDetail={onOpenDetail}
              />
              {task.subtasks.length > 0 && (
                <div className="ml-6 pl-3">
                  {task.subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-3 px-4 py-1.5 group">
                      <button
                        onClick={() => onToggleSubtask?.(task.id, st.id)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          st.isCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-[var(--color-border-strong)]'
                        }`}
                      >
                        {st.isCompleted && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => onOpenDetail(task.id)}
                        className={`flex-1 text-xs min-w-0 truncate text-left ${
                          st.isCompleted
                            ? 'line-through text-[var(--color-muted)]'
                            : 'text-[var(--color-ink)]'
                        }`}
                      >
                        {st.title}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title={`Delete "${list.name}"?`}
        message={
          tasks.length > 0
            ? `This list has ${tasks.length} task${tasks.length === 1 ? '' : 's'}. Deleting it will also remove all its tasks.`
            : 'Are you sure you want to delete this list?'
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => { setShowDeleteConfirm(false); onDeleteList(list.id); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
