import { useState } from 'react';
import { GoKebabHorizontal } from 'react-icons/go';
import type { Task, TaskList } from '../../types/task';
import { TaskListTabs } from './TaskListTabs';
import { TaskListView } from './TaskListView';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface TasksShellProps {
  lists: TaskList[];
  activeListId: string | null;
  tasks: Task[];
  onSelectList: (id: string) => void;
  onNewList: () => void;
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenDetail: (id: string) => void;
  onAddTask?: (title: string) => void;
  onRenameList: (listId: string, name: string) => void;
  onDeleteList: (listId: string) => void;
}

export function TasksShell({
  lists,
  activeListId,
  tasks,
  onSelectList,
  onNewList,
  onToggleComplete,
  onToggleStar,
  onToggleSubtask,
  onOpenDetail,
  onAddTask,
  onRenameList,
  onDeleteList,
}: TasksShellProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activeList = lists.find((l) => l.id === activeListId);
  const listTasks = tasks.filter((t) => t.listId === activeListId);
  const listTaskCount = tasks.filter((t) => t.listId === activeListId).length;

  const handleStartRename = () => {
    if (!activeList) return;
    setRenameValue(activeList.name);
    setRenaming(true);
    setShowMenu(false);
  };

  const handleCommitRename = () => {
    if (!activeList) return;
    if (renameValue.trim() && renameValue.trim() !== activeList.name) {
      onRenameList(activeList.id, renameValue.trim());
    }
    setRenaming(false);
  };

  const handleCancelRename = () => {
    setRenaming(false);
  };

  return (
    <div>
      <TaskListTabs
        lists={lists}
        activeListId={activeListId}
        onSelect={onSelectList}
        onNewList={onNewList}
      />

      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        {activeList && renaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            className="flex-1 text-lg font-medium text-[var(--color-ink)] bg-transparent outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommitRename();
              if (e.key === 'Escape') handleCancelRename();
              if (e.key === 'Tab') handleCommitRename();
            }}
            onBlur={handleCommitRename}
            autoFocus
          />
        ) : (
          <h2
            className="text-lg font-medium text-[var(--color-ink)] cursor-pointer"
            onClick={activeList ? handleStartRename : undefined}
          >
            {activeList?.name ?? 'Tasks'}
          </h2>
        )}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]"
          >
            <GoKebabHorizontal className="w-5 h-5 rotate-90" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg shadow-lg py-1 min-w-[140px]">
              <button
                onClick={handleStartRename}
                className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]"
              >
                Rename list
              </button>
              <button
                onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--color-surface-soft)]"
              >
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      <TaskListView
        tasks={listTasks}
        onToggleComplete={onToggleComplete}
        onToggleStar={onToggleStar}
        onToggleSubtask={onToggleSubtask}
        onOpenDetail={onOpenDetail}
        onAddTask={onAddTask}
      />

      {activeList && (
        <ConfirmDialog
          open={showDeleteConfirm}
          title={`Delete "${activeList.name}"?`}
          message={
            listTaskCount > 0
              ? `This list has ${listTaskCount} task${listTaskCount === 1 ? '' : 's'}. Deleting it will also remove all its tasks.`
              : 'Are you sure you want to delete this list?'
          }
          confirmLabel="Delete"
          destructive
          onConfirm={() => { setShowDeleteConfirm(false); onDeleteList(activeList.id); }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
