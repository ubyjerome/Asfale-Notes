import { useEffect, useRef } from 'react';
import { db } from '../../sync/db';
import { useAuthStore } from '../../store/authStore';
import { useNotesStore } from '../../store/notesStore';
import { decrypt } from '../../crypto/encrypt';
import { notesRepo } from '../../db/notesRepo';
import type { Note } from '../../types/note';

export function SyncSubscriber() {
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevDataRef = useRef<string>('');

  const { data } = !db ? { data: undefined } : (db.useQuery as any)({ notes: {} }) ?? { data: undefined };

  useEffect(() => {
    if (!isAuthenticated || !cryptoKey || !data) return;

    const raw = JSON.stringify(data);
    if (raw === prevDataRef.current) return;
    prevDataRef.current = raw;

    const syncedNotes: any[] = Array.isArray(data) ? data : data.notes ?? [];

    const processNotes = async () => {
      for (const synced of syncedNotes) {
        if (!synced?.id || !synced?.encryptedTitle || !synced?.encryptedContent) continue;

        try {
          const local = await notesRepo.getById(synced.id);
          if (local && synced.updatedAt <= local.updatedAt) continue;

          const note: Note = {
            id: synced.id,
            title: await decrypt(synced.encryptedTitle, cryptoKey),
            content: await decrypt(synced.encryptedContent, cryptoKey),
            color: synced.color ?? '#FFFFFF',
            tags: synced.tags ?? [],
            isPinned: synced.isPinned ?? false,
            isFavorite: synced.isFavorite ?? false,
            isArchived: synced.isArchived ?? false,
            isDeleted: synced.isDeleted ?? false,
            deletedAt: synced.deletedAt,
            createdAt: synced.createdAt,
            updatedAt: synced.updatedAt,
          };

          await notesRepo.save(note);

          const { notes, setNotes } = useNotesStore.getState();
          const exists = notes.find((n) => n.id === note.id);
          setNotes(
            exists
              ? notes.map((n) => (n.id === note.id ? note : n))
              : [note, ...notes],
          );
        } catch {
          // skip unprocessable notes
        }
      }
    };

    processNotes();
  }, [data, cryptoKey, isAuthenticated]);

  return null;
}
