import type { Note } from '../types/note';
import { db } from './db';

export const notesRepo = {
  async getAll(): Promise<Note[]> {
    return db.notes.toArray();
  },

  async getById(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  },

  async save(note: Note): Promise<void> {
    await db.notes.put(note);
  },

  async delete(id: string): Promise<void> {
    await db.notes.delete(id);
  },

  async getActive(): Promise<Note[]> {
    return db.notes.where('isDeleted').equals(0).toArray();
  },

  async getTrashed(): Promise<Note[]> {
    return db.notes.where('isDeleted').equals(1).toArray();
  },

  async getArchived(): Promise<Note[]> {
    return db.notes.where({ isArchived: 1, isDeleted: 0 }).toArray();
  },

  async bulkSave(notes: Note[]): Promise<void> {
    await db.notes.bulkPut(notes);
  },

  async purgeOldTrash(days: number = 30): Promise<void> {
    const cutoff = Date.now() - days * 86400000;
    const oldTrash = await db.notes
      .where('isDeleted')
      .equals(1)
      .and(n => (n.deletedAt ?? 0) < cutoff)
      .toArray();
    await db.notes.bulkDelete(oldTrash.map(n => n.id));
  },
};
