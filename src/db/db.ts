import Dexie, { type Table } from 'dexie';
import type { Note } from '../types/note';
import type { Task, TaskList } from '../types/task';

interface SyncMeta {
  key: string;
  value: unknown;
}

export class AsfaleNotesDB extends Dexie {
  notes!: Table<Note, string>;
  prefs!: Table<{ key: string; value: unknown }, string>;
  syncMeta!: Table<SyncMeta, string>;
  taskLists!: Table<TaskList, string>;
  tasks!: Table<Task, string>;

  constructor() {
    super('AsfaleNotesDB');
    this.version(1).stores({
      notes: 'id, updatedAt, createdAt, isDeleted, isArchived, isPinned, color',
      prefs: 'key',
      syncMeta: 'key',
    });
    this.version(2).stores({
      notes: 'id, updatedAt, createdAt, isDeleted, isArchived, isPinned, color',
      prefs: 'key',
      syncMeta: 'key',
      taskLists: 'id, order, updatedAt',
      tasks: 'id, listId, order, isCompleted, isStarred, updatedAt, createdAt',
    });
  }
}

export const db = new AsfaleNotesDB();
