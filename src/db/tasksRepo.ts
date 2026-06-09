import type { Task, TaskList } from '../types/task';
import { db } from './db';

export const tasksRepo = {
  // TaskLists
  async getAllLists(): Promise<TaskList[]> {
    const all = await db.taskLists.orderBy('order').toArray();
    return all.filter((l) => !l.isDeleted);
  },

  async getListById(id: string): Promise<TaskList | undefined> {
    return db.taskLists.get(id);
  },

  async saveList(list: TaskList): Promise<void> {
    await db.taskLists.put(list);
  },

  async deleteList(id: string): Promise<void> {
    await db.taskLists.delete(id);
  },

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    const all = await db.tasks.toArray();
    return all.filter((t) => !t.isDeleted);
  },

  async getTasksByList(listId: string): Promise<Task[]> {
    return db.tasks.where('listId').equals(listId).toArray();
  },

  async getTaskById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id);
  },

  async saveTask(task: Task): Promise<void> {
    await db.tasks.put(task);
  },

  async deleteTask(id: string): Promise<void> {
    await db.tasks.delete(id);
  },

  async bulkSaveTasks(tasks: Task[]): Promise<void> {
    await db.tasks.bulkPut(tasks);
  },
};
