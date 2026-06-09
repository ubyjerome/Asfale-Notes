export interface TaskList {
  id: string;
  name: string;
  color?: string;
  order: number;
  isDeleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isStarred: boolean;
  dueDate?: number;
  order: number;
  subtasks: Subtask[];
  isDeleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SyncedTaskList {
  id: string;
  encryptedName: string;
  color?: string;
  order: number;
  isDeleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SyncedTask {
  id: string;
  listId: string;
  encryptedTitle: string;
  encryptedDescription?: string;
  encryptedSubtasks: string;
  isCompleted: boolean;
  isStarred: boolean;
  isDeleted?: boolean;
  dueDate?: number;
  order: number;
  createdAt: number;
  updatedAt: number;
}
