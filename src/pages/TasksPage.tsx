import { useEffect, useState, useCallback, useRef } from 'react';
import { generateId } from '../utils/uuid';
import { tasksRepo } from '../db/tasksRepo';
import { useTasks } from '../hooks/useTasks';
import { useTasksStore } from '../store/tasksStore';
import { TasksShell } from '../components/tasks/TasksShell';
import { DesktopTasksGrid } from '../components/tasks/DesktopTasksGrid';
import { NewTaskBottomSheet } from '../components/tasks/NewTaskBottomSheet';
import { NewTaskPage } from '../components/tasks/NewTaskPage';
import { NewListDialog } from '../components/tasks/NewListDialog';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { EmptyState } from '../components/ui/EmptyState';
import type { Task } from '../types/task';
import type { TaskList } from '../types/task';

export function TasksPage() {
  const {
    lists, tasks, activeListId,
    createList, updateList, deleteList, createTask, updateTask,
    toggleTaskComplete, toggleTaskStar, setActiveListId,
  } = useTasks();
  const storeSetLists = useTasksStore((s) => s.setLists);

  const [showNewTask, setShowNewTask] = useState<'sheet' | 'modal' | false>(false);
  const [showNewList, setShowNewList] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(lists.length > 0);
  const initRef = useRef(lists.length > 0);
  const pendingNewTask = useTasksStore((s) => s.pendingNewTask);
  const setPendingNewTask = useTasksStore((s) => s.setPendingNewTask);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      const all = await tasksRepo.getAllLists();
      if (all.length === 0) {
        const defaultList: TaskList = {
          id: generateId(),
          name: 'My Tasks',
          order: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await createList(defaultList);
        setActiveListId(defaultList.id);
      } else {
        storeSetLists(all);
        if (!activeListId) {
          setActiveListId(all[0].id);
        }
      }
      const allTasks = await tasksRepo.getAllTasks();
      useTasksStore.getState().setTasks(allTasks);
      setInitialized(true);
    })();
  }, [storeSetLists, activeListId, setActiveListId, createList]);

  useEffect(() => {
    if (initialized && pendingNewTask) {
      setPendingNewTask(false);
      setShowNewTask('modal');
    }
  }, [initialized, pendingNewTask, setPendingNewTask]);

  const detailTask = detailTaskId ? tasks.find((t) => t.id === detailTaskId) ?? null : null;

  const handleNewTask = useCallback(
    (title: string, description: string, dueDate?: number, listId?: string, isStarred?: boolean) => {
      const targetListId = listId ?? activeListId;
      if (!targetListId) return;
      const task: Task = {
        id: generateId(),
        listId: targetListId,
        title,
        description: description || undefined,
        isCompleted: false,
        isStarred: isStarred ?? false,
        dueDate,
        order: 0,
        subtasks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      createTask(task);
      setShowNewTask(false);
    },
    [activeListId, createTask],
  );

  const handleNewList = useCallback(
    (name: string) => {
      const list: TaskList = {
        id: generateId(),
        name,
        order: lists.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      createList(list).then(() => {
        setActiveListId(list.id);
        setShowNewList(false);
      });
    },
    [lists, createList, setActiveListId],
  );

  const handleAddTaskInline = useCallback(
    (title: string) => {
      if (!activeListId) return;
      const task: Task = {
        id: generateId(),
        listId: activeListId,
        title,
        description: undefined,
        isCompleted: false,
        isStarred: false,
        dueDate: undefined,
        order: 0,
        subtasks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      createTask(task);
    },
    [activeListId, createTask],
  );

  const handleToggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const updated = {
        ...task,
        subtasks: task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        ),
        updatedAt: Date.now(),
      };
      updateTask(updated);
    },
    [tasks, updateTask],
  );

  const handleRenameList = useCallback(
    (listId: string, name: string) => {
      const list = lists.find((l) => l.id === listId);
      if (!list) return;
      updateList({ ...list, name, updatedAt: Date.now() });
    },
    [lists, updateList],
  );

  const handleDeleteList = useCallback(
    (listId: string) => {
      deleteList(listId);
      if (activeListId === listId) {
        const remaining = lists.filter((l) => l.id !== listId);
        if (remaining.length > 0) setActiveListId(remaining[0].id);
        else setActiveListId(null);
      }
    },
    [deleteList, activeListId, lists, setActiveListId],
  );

  const handleDesktopAddTask = useCallback(
    (listId: string, title: string) => {
      const task: Task = {
        id: generateId(),
        listId,
        title,
        description: undefined,
        isCompleted: false,
        isStarred: false,
        dueDate: undefined,
        order: 0,
        subtasks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      createTask(task);
    },
    [createTask],
  );

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="fade-in">
        <EmptyState
          title="No lists yet"
          message="Create your first list to get started."
        />
        <div className="flex justify-center px-4">
          <button
            onClick={() => setShowNewList(true)}
            className="h-12 px-6 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg"
          >
            New List
          </button>
        </div>
        {showNewList && (
          <NewListDialog
            onSave={handleNewList}
            onClose={() => setShowNewList(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <DesktopTasksGrid
        lists={lists}
        tasks={tasks}
        activeListId={activeListId}
        onSelectList={setActiveListId}
        onToggleComplete={toggleTaskComplete}
        onToggleStar={toggleTaskStar}
        onToggleSubtask={handleToggleSubtask}
        onOpenDetail={(id) => setDetailTaskId(id)}
        onAddTask={handleDesktopAddTask}
        onRenameList={handleRenameList}
        onDeleteList={handleDeleteList}
      />

      <div className="md:hidden">
        <TasksShell
          lists={lists}
          activeListId={activeListId}
          tasks={tasks}
          onSelectList={setActiveListId}
          onNewList={() => setShowNewList(true)}
          onToggleComplete={toggleTaskComplete}
          onToggleStar={toggleTaskStar}
          onToggleSubtask={handleToggleSubtask}
          onOpenDetail={(id) => setDetailTaskId(id)}
          onAddTask={handleAddTaskInline}
          onRenameList={handleRenameList}
          onDeleteList={handleDeleteList}
        />

        <FloatingActionButton onClick={() => setShowNewTask('sheet')} />
      </div>

      {showNewTask === 'sheet' && (
        <NewTaskBottomSheet
          onSave={(title, desc, due, starred) => {
            handleNewTask(title, desc, due, undefined, starred);
          }}
          onClose={() => setShowNewTask(false)}
        />
      )}

      {showNewTask === 'modal' && (
        <NewTaskPage
          lists={lists}
          activeListId={activeListId}
          onSave={(title, desc, due, listId) => handleNewTask(title, desc, due, listId)}
          onClose={() => setShowNewTask(false)}
        />
      )}

      {showNewList && (
        <NewListDialog
          onSave={handleNewList}
          onClose={() => setShowNewList(false)}
        />
      )}

      {detailTask && (
        <TaskDetailSheet
          task={detailTask}
          lists={lists}
          onUpdate={updateTask}
          onClose={() => setDetailTaskId(null)}
        />
      )}
    </div>
  );
}
