import { useCallback } from 'react';
import { tasksRepo } from '../db/tasksRepo';
import { useTasksStore } from '../store/tasksStore';
import type { Task, TaskList } from '../types/task';

export function useTasks() {
  const lists = useTasksStore((s) => s.lists);
  const tasks = useTasksStore((s) => s.tasks);
  const setLists = useTasksStore((s) => s.setLists);
  const setTasks = useTasksStore((s) => s.setTasks);
  const activeListId = useTasksStore((s) => s.activeListId);
  const setActiveListId = useTasksStore((s) => s.setActiveListId);

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
      return list;
    },
    [lists, setLists],
  );

  const updateList = useCallback(
    async (list: TaskList) => {
      await tasksRepo.saveList(list);
      setLists(lists.map((l) => (l.id === list.id ? list : l)));
    },
    [lists, setLists],
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
    },
    [lists, tasks, setLists, setTasks],
  );

  const createTask = useCallback(
    async (task: Task) => {
      console.log('[useTasks] createTask', task.id, task.title, 'listId:', task.listId);
      await tasksRepo.saveTask(task);
      console.log('[useTasks] createTask saved to Dexie, store had', tasks.length, 'tasks');
      setTasks([task, ...tasks]);
      console.log('[useTasks] createTask store updated, now has', tasks.length + 1, 'tasks');
    },
    [tasks, setTasks],
  );

  const updateTask = useCallback(
    async (task: Task) => {
      await tasksRepo.saveTask(task);
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    },
    [tasks, setTasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await tasksRepo.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    },
    [tasks, setTasks],
  );

  const toggleTaskComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const updated = { ...task, isCompleted: !task.isCompleted, updatedAt: Date.now() };
      await tasksRepo.saveTask(updated);
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    },
    [tasks, setTasks],
  );

  const toggleTaskStar = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const updated = { ...task, isStarred: !task.isStarred, updatedAt: Date.now() };
      await tasksRepo.saveTask(updated);
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    },
    [tasks, setTasks],
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
    },
    [tasks, setTasks],
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
