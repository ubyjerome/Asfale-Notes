import { useCallback } from 'react';
import { notesRepo } from '../db/notesRepo';
import { useNotesStore } from '../store/notesStore';
import { useAuthStore } from '../store/authStore';
import { db as syncDb } from '../sync/db';
import { encrypt } from '../crypto/encrypt';
import type { Note } from '../types/note';
import type { SyncedNote } from '../types/sync';

export function useNotes() {
  const notes = useNotesStore((s) => s.notes);
  const setNotes = useNotesStore((s) => s.setNotes);
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const accountId = useAuthStore((s) => s.accountId);

  const loadNotes = useCallback(async () => {
    const all = await notesRepo.getAll();
    console.log('[useNotes] loaded', all.length, 'notes from Dexie');
    setNotes(all);
  }, [setNotes]);

  const createNote = useCallback(
    async (note: Note) => {
      console.log('[useNotes] createNote', note.id, note.title);
      await notesRepo.save(note);
      setNotes([note, ...notes]);
      return note;
    },
    [notes, setNotes],
  );

  const updateNote = useCallback(
    async (note: Note) => {
      console.log('[useNotes] updateNote', note.id, 'content length:', note.content.length);
      await notesRepo.save(note);
      setNotes(notes.map((n) => (n.id === note.id ? note : n)));
    },
    [notes, setNotes],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (note) {
        const updated = { ...note, isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() };
        await notesRepo.save(updated);
        setNotes(notes.filter((n) => n.id !== id));
        if (syncDb && cryptoKey) {
          try {
            const { title, content, ...meta } = updated;
            const synced: SyncedNote = {
              ...meta,
              accountId: accountId!,
              encryptedTitle: await encrypt(updated.title, cryptoKey),
              encryptedContent: await encrypt(updated.content, cryptoKey),
            };
            await (syncDb as any).transact((syncDb as any).tx.notes[id].update(synced));
          } catch (e) { console.error('[sync] deleteNote push failed', e); }
        }
      }
    },
    [notes, setNotes, cryptoKey, accountId],
  );

  const permanentlyDeleteNote = useCallback(
    async (id: string) => {
      await notesRepo.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
      if (syncDb) {
        try {
          await (syncDb as any).transact((syncDb as any).tx.notes[id].delete());
        } catch (e) { console.error('[sync] permanentlyDeleteNote push failed', e); }
      }
    },
    [notes, setNotes],
  );

  const archiveNote = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (note) {
        const updated = { ...note, isArchived: true, updatedAt: Date.now() };
        await notesRepo.save(updated);
        setNotes(notes.filter((n) => n.id !== id));
        if (syncDb && cryptoKey) {
          try {
            const { title, content, ...meta } = updated;
            const synced: SyncedNote = {
              ...meta,
              accountId: accountId!,
              encryptedTitle: await encrypt(updated.title, cryptoKey),
              encryptedContent: await encrypt(updated.content, cryptoKey),
            };
            await (syncDb as any).transact((syncDb as any).tx.notes[id].update(synced));
          } catch { /* best-effort */ }
        }
      }
    },
    [notes, setNotes, cryptoKey, accountId],
  );

  const restoreNote = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (note) {
        const updated = { ...note, isDeleted: false, isArchived: false, deletedAt: undefined, updatedAt: Date.now() };
        await notesRepo.save(updated);
        setNotes([updated, ...notes]);
        if (syncDb && cryptoKey) {
          try {
            const { title, content, ...meta } = updated;
            const synced: SyncedNote = {
              ...meta,
              accountId: accountId!,
              encryptedTitle: await encrypt(updated.title, cryptoKey),
              encryptedContent: await encrypt(updated.content, cryptoKey),
            };
            await (syncDb as any).transact((syncDb as any).tx.notes[id].update(synced));
          } catch { /* best-effort */ }
        }
      }
    },
    [notes, setNotes, cryptoKey, accountId],
  );

  const duplicateNote = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (note) {
        const duplicate: Note = {
          ...note,
          id: crypto.randomUUID(),
          title: note.title + ' (copy)',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
        };
        await notesRepo.save(duplicate);
        setNotes([duplicate, ...notes]);
      }
    },
    [notes, setNotes],
  );

  const bulkDelete = useCallback(
    async (ids: string[]) => {
      for (const id of ids) {
        const note = notes.find((n) => n.id === id);
        if (note) {
          const updated = { ...note, isDeleted: true, deletedAt: Date.now(), updatedAt: Date.now() };
          await notesRepo.save(updated);
          if (syncDb && cryptoKey) {
            try {
            const { title, content, ...meta } = updated;
            const synced: SyncedNote = {
              ...meta,
              accountId: accountId!,
              encryptedTitle: await encrypt(updated.title, cryptoKey),
              encryptedContent: await encrypt(updated.content, cryptoKey),
            };
            await (syncDb as any).transact((syncDb as any).tx.notes[id].update(synced));
          } catch { /* best-effort */ }
          }
        }
      }
      setNotes(notes.filter((n) => !ids.includes(n.id)));
    },
    [notes, setNotes, cryptoKey, accountId],
  );

  const bulkArchive = useCallback(
    async (ids: string[]) => {
      for (const id of ids) {
        const note = notes.find((n) => n.id === id);
        if (note) {
          const updated = { ...note, isArchived: true, updatedAt: Date.now() };
          await notesRepo.save(updated);
          if (syncDb && cryptoKey) {
            try {
              const { title, content, ...meta } = updated;
              const synced: SyncedNote = {
                ...meta,
                accountId: accountId!,
                encryptedTitle: await encrypt(updated.title, cryptoKey),
                encryptedContent: await encrypt(updated.content, cryptoKey),
              };
              await (syncDb as any).transact((syncDb as any).tx.notes[id].update(synced));
            } catch { /* best-effort */ }
          }
        }
      }
      setNotes(notes.filter((n) => !ids.includes(n.id)));
    },
    [notes, setNotes, cryptoKey, accountId],
  );

  const bulkAssignColor = useCallback(
    async (ids: string[], color: string) => {
      for (const id of ids) {
        const note = notes.find((n) => n.id === id);
        if (note) {
          const updated = { ...note, color };
          await notesRepo.save(updated);
        }
      }
      setNotes(notes.map((n) => (ids.includes(n.id) ? { ...n, color } : n)));
    },
    [notes, setNotes],
  );

  return {
    notes,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    permanentlyDeleteNote,
    archiveNote,
    restoreNote,
    duplicateNote,
    bulkDelete,
    bulkArchive,
    bulkAssignColor,
  };
}
