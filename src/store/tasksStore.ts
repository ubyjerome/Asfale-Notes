import { create } from 'zustand';
import type { Task, TaskList } from '../types/task';

interface TasksState {
  lists: TaskList[];
  tasks: Task[];
  activeListId: string | null;
  pendingNewTask: boolean;
  setLists: (lists: TaskList[]) => void;
  setTasks: (tasks: Task[]) => void;
  setActiveListId: (id: string | null) => void;
  setPendingNewTask: (v: boolean) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  lists: [],
  tasks: [],
  activeListId: null,
  pendingNewTask: false,
  setLists: (lists) => set({ lists }),
  setTasks: (tasks) => set({ tasks }),
  setActiveListId: (activeListId) => set({ activeListId }),
  setPendingNewTask: (pendingNewTask) => set({ pendingNewTask }),
}));
