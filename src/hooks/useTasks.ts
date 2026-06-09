import { useCallback } from 'react';
import { tasksRepo } from '../db/tasksRepo';
import { useTasksStore } from '../store/tasksStore';
import { useAuthStore } from '../store/authStore';
import { db as syncDb } from '../sync/db';
import { encrypt } from '../crypto/encrypt';
import type { Task, TaskList, SyncedTask, SyncedTaskList } from '../types/task';

export function useTasks() {
  const lists = useTasksStore((s) => s.lists);
  const tasks = useTasksStore((s) => s.tasks);
  const setLists = useTasksStore((s) => s.setLists);
  const setTasks = useTasksStore((s) => s.setTasks);
  const activeListId = useTasksStore((s) => s.activeListId);
  const setActiveListId = useTasksStore((s) => s.setActiveListId);
  const cryptoKey = useAuthStore((s) => s.cryptoKey);

  const loadLists = useCallback(async () => {
    const all = await tasksRepo.getAllLists();
    setLists(all);
    return all;
  }, [setLists]);

  const loadTasks = useCallback(async () => {
    const all = await tasksRepo.getAllTasks();
    setTasks(all);
    return all;
  }, [setTasks]);

  const createList = useCallback(
    async (list: TaskList) => {
      await tasksRepo.saveList(list);
      setLists([...lists, list]);
      if (syncDb && cryptoKey) {
        try {
          const synced: SyncedTaskList = {
            id: list.id,
            encryptedName: await encrypt(list.name, cryptoKey),
            color: list.color,
            order: list.order,
            isDeleted: false,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
          };
          await (syncDb as any).transact((syncDb as any).tx.taskLists[list.id].update(synced));
        } catch (e) { console.error('[sync] createList push failed', e, list); }
      }
      return list;
    },
    [lists, setLists, cryptoKey],
  );

  const updateList = useCallback(
    async (list: TaskList) => {
      await tasksRepo.saveList(list);
      setLists(lists.map((l) => (l.id === list.id ? list : l)));
      if (syncDb && cryptoKey) {
        try {
          const synced: SyncedTaskList = {
            id: list.id,
            encryptedName: await encrypt(list.name, cryptoKey),
            color: list.color,
            order: list.order,
            isDeleted: list.isDeleted ?? false,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
          };
          await (syncDb as any).transact((syncDb as any).tx.taskLists[list.id].update(synced));
        } catch { /* best-effort */ }
      }
    },
    [lists, setLists, cryptoKey],
  );

  const deleteList = useCallback(
    async (id: string) => {
      const list = lists.find((l) => l.id === id);
      if (!list) return;
      const deletedList = { ...list, isDeleted: true, updatedAt: Date.now() };
      await tasksRepo.saveList(deletedList);
      setLists(lists.filter((l) => l.id !== id));

      const listTasks = tasks.filter((t) => t.listId === id);
      const deletedTasks = listTasks.map((t) => ({ ...t, isDeleted: true, updatedAt: Date.now() }));
      for (const t of deletedTasks) {
        await tasksRepo.saveTask(t);
      }
      setTasks(tasks.filter((t) => t.listId !== id));

      if (syncDb && cryptoKey) {
        try {
          const synced: SyncedTaskList = {
            id: deletedList.id,
            encryptedName: await encrypt(deletedList.name, cryptoKey),
            color: deletedList.color,
            order: deletedList.order,
            isDeleted: true,
            createdAt: deletedList.createdAt,
            updatedAt: deletedList.updatedAt,
          };
          await (syncDb as any).transact((syncDb as any).tx.taskLists[id].update(synced));
          for (const t of deletedTasks) {
            const syncedTask: SyncedTask = {
              id: t.id,
              listId: t.listId,
              encryptedTitle: await encrypt(t.title, cryptoKey),
              encryptedDescription: t.description ? await encrypt(t.description, cryptoKey) : undefined,
              encryptedSubtasks: await encrypt(JSON.stringify(t.subtasks), cryptoKey),
              isCompleted: t.isCompleted,
              isStarred: t.isStarred,
              isDeleted: true,
              dueDate: t.dueDate,
              order: t.order,
              createdAt: t.createdAt,
              updatedAt: t.updatedAt,
            };
            await (syncDb as any).transact((syncDb as any).tx.tasks[t.id].update(syncedTask));
          }
        } catch { /* best-effort */ }
      }
    },
    [lists, tasks, setLists, setTasks, cryptoKey],
  );

  const createTask = useCallback(
    async (task: Task) => {
      await tasksRepo.saveTask(task);
      setTasks([task, ...tasks]);
      if (syncDb && cryptoKey) {
        try {
          const synced: SyncedTask = {
            id: task.id,
            listId: task.listId,
            encryptedTitle: await encrypt(task.title, cryptoKey),
            encryptedDescription: task.description ? await encrypt(task.description, cryptoKey) : undefined,
            encryptedSubtasks: await encrypt(JSON.stringify(task.subtasks), cryptoKey),
            isCompleted: task.isCompleted,
            isStarred: task.isStarred,
            isDeleted: false,
            dueDate: task.dueDate,
            order: task.order,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          };
          await (syncDb as any).transact((syncDb as any).tx.tasks[task.id].update(synced));
        } catch { /* best-effort */ }
      }
    },
    [tasks, setTasks, cryptoKey],
  );

  const updateTask = useCallback(
    async (task: Task) => {
      await tasksRepo.saveTask(task);
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
      if (syncDb && cryptoKey) {
        try {
          const synced: SyncedTask = {
            id: task.id,
            listId: task.listId,
            encryptedTitle: await encrypt(task.title, cryptoKey),
            encryptedDescription: task.description ? await encrypt(task.description, cryptoKey) : undefined,
            encryptedSubtasks: await encrypt(JSON.stringify(task.subtasks), cryptoKey),
            isCompleted: task.isCompleted,
            isStarred: task.isStarred,
            isDeleted: task.isDeleted ?? false,
            dueDate: task.dueDate,
            order: task.order,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          };
          await (syncDb as any).transact((syncDb as any).tx.tasks[task.id].update(synced));
        } catch { /* best-effort */ }
      }
    },
    [tasks, setTasks, cryptoKey],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const updated = { ...task, isDeleted: true, updatedAt: Date.now() };
      await tasksRepo.saveTask(updated);
      setTasks(tasks.filter((t) => t.id !== id));
      if (syncDb && cryptoKey) {
        try {
          const synced: SyncedTask = {
            id: updated.id,
            listId: updated.listId,
            encryptedTitle: await encrypt(updated.title, cryptoKey),
            encryptedDescription: updated.description ? await encrypt(updated.description, cryptoKey) : undefined,
            encryptedSubtasks: await encrypt(JSON.stringify(updated.subtasks), cryptoKey),
            isCompleted: updated.isCompleted,
            isStarred: updated.isStarred,
            isDeleted: true,
            dueDate: updated.dueDate,
            order: updated.order,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          };
          await (syncDb as any).transact((syncDb as any).tx.tasks[id].update(synced));
        } catch { /* best-effort */ }
      }
    },
    [tasks, setTasks, cryptoKey],
  );

  const toggleTaskComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const completing = !task.isCompleted;
      const updated = {
        ...task,
        isCompleted: completing,
        subtasks: completing && task.subtasks.length > 0
          ? task.subtasks.map((st) => ({ ...st, isCompleted: true }))
          : task.subtasks,
        updatedAt: Date.now(),
      };
      await tasksRepo.saveTask(updated);
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      if (syncDb && cryptoKey) {
        try {
          const synced: SyncedTask = {
            id: updated.id,
            listId: updated.listId,
            encryptedTitle: await encrypt(updated.title, cryptoKey),
            encryptedDescription: updated.description ? await encrypt(updated.description, cryptoKey) : undefined,
            encryptedSubtasks: await encrypt(JSON.stringify(updated.subtasks), cryptoKey),
            isCompleted: updated.isCompleted,
            isStarred: updated.isStarred,
            isDeleted: false,
            dueDate: updated.dueDate,
            order: updated.order,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          };
          await (syncDb as any).transact((syncDb as any).tx.tasks[id].update(synced));
        } catch (e) { console.error('[sync] toggleTaskComplete push failed', e); }
      }
    },
    [tasks, setTasks, cryptoKey],
  );

  const toggleTaskStar = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const updated = { ...task, isStarred: !task.isStarred, updatedAt: Date.now() };
      await tasksRepo.saveTask(updated);
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
      if (syncDb && cryptoKey) {
        try {
          const synced: SyncedTask = {
            id: updated.id,
            listId: updated.listId,
            encryptedTitle: await encrypt(updated.title, cryptoKey),
            encryptedDescription: updated.description ? await encrypt(updated.description, cryptoKey) : undefined,
            encryptedSubtasks: await encrypt(JSON.stringify(updated.subtasks), cryptoKey),
            isCompleted: updated.isCompleted,
            isStarred: updated.isStarred,
            isDeleted: false,
            dueDate: updated.dueDate,
            order: updated.order,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          };
          await (syncDb as any).transact((syncDb as any).tx.tasks[id].update(synced));
        } catch { /* best-effort */ }
      }
    },
    [tasks, setTasks, cryptoKey],
  );

  const reorderTasks = useCallback(
    async (listId: string, orderedIds: string[]) => {
      const listTasks = tasks.filter((t) => t.listId === listId);
      const updated = listTasks.map((t) => ({
        ...t,
        order: orderedIds.indexOf(t.id),
        updatedAt: Date.now(),
      }));
      await tasksRepo.bulkSaveTasks(updated);
      setTasks(tasks.map((t) => {
        const found = updated.find((u) => u.id === t.id);
        return found ?? t;
      }));
      if (syncDb && cryptoKey) {
        for (const u of updated) {
          try {
            const synced: SyncedTask = {
              id: u.id,
              listId: u.listId,
              encryptedTitle: await encrypt(u.title, cryptoKey),
              encryptedDescription: u.description ? await encrypt(u.description, cryptoKey) : undefined,
              encryptedSubtasks: await encrypt(JSON.stringify(u.subtasks), cryptoKey),
              isCompleted: u.isCompleted,
              isStarred: u.isStarred,
              isDeleted: false,
              dueDate: u.dueDate,
              order: u.order,
              createdAt: u.createdAt,
              updatedAt: u.updatedAt,
            };
            await (syncDb as any).transact((syncDb as any).tx.tasks[u.id].update(synced));
          } catch { /* best-effort */ }
        }
      }
    },
    [tasks, setTasks, cryptoKey],
  );

  return {
    lists,
    tasks,
    activeListId,
    loadLists,
    loadTasks,
    createList,
    updateList,
    deleteList,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleTaskStar,
    reorderTasks,
    setActiveListId,
  };
}
