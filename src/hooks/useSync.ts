import { db } from '../sync/db';
import { useAuthStore } from '../store/authStore';
import { encrypt } from '../crypto/encrypt';
import type { Note } from '../types/note';
import type { SyncedNote } from '../types/sync';

export function useSync() {
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const accountId = useAuthStore((s) => s.accountId);

  const pushNote = async (note: Note) => {
    if (!cryptoKey || !db || !accountId) return;

    try {
      const synced: SyncedNote = {
        id: note.id,
        accountId,
        encryptedTitle: await encrypt(note.title, cryptoKey),
        encryptedContent: await encrypt(note.content, cryptoKey),
        color: note.color,
        tags: note.tags,
        isPinned: note.isPinned,
        isFavorite: note.isFavorite,
        isArchived: note.isArchived,
        isDeleted: note.isDeleted,
        deletedAt: note.deletedAt,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };
      await (db as any).transact((db as any).tx.notes[synced.id].update(synced));
    } catch {
      // sync is best-effort
    }
  };

  return { pushNote };
}
