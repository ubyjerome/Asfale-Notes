import { useEffect, useRef, useState } from 'react';
import { db } from '../../sync/db';
import { useAuthStore } from '../../store/authStore';
import { useNotesStore } from '../../store/notesStore';
import { decrypt } from '../../crypto/encrypt';
import { notesRepo } from '../../db/notesRepo';
import { prefsRepo } from '../../db/prefsRepo';
import type { Note } from '../../types/note';

export function SyncSubscriber() {
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const accountId = useAuthStore((s) => s.accountId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [migrated, setMigrated] = useState(false);
  const migratingRef = useRef(false);
  const prevDataRef = useRef<string>('');

  const query =
    migrated && accountId
      ? ({ notes: { $: { where: { accountId } } }, profile: { $: { where: { accountId } } } } as any)
      : ({ notes: {}, profile: {} } as any);

  const { data } = !db
    ? { data: undefined }
    : (db.useQuery as any)(query) ?? { data: undefined };

  console.log('[sync] query mode:', migrated && accountId ? 'filtered' : 'unfiltered', 'migrated:', migrated, 'accountId present:', !!accountId);

  useEffect(() => {
    prefsRepo.get<boolean>('notesAccountIdMigrated').then((done) => {
      console.log('[sync] migration flag from prefsRepo:', done);
      if (done) setMigrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !cryptoKey || !accountId || migratingRef.current || migrated) return;
    if (!data) return;

    migratingRef.current = true;

    const migrate = async () => {
      const syncedNotes: any[] = Array.isArray(data) ? data : data.notes ?? [];

      for (const synced of syncedNotes) {
        if (!synced?.id || !synced?.encryptedTitle || !synced?.encryptedContent) continue;
        if (synced.accountId === accountId) continue;
        try {
          await decrypt(synced.encryptedTitle, cryptoKey);
          await (db as any).transact(
            (db as any).tx.notes[synced.id].update({ accountId }),
          );
        } catch {
          // not our record
        }
      }

      const syncedProfiles: any[] = data.profile ?? [];
      for (const synced of syncedProfiles) {
        if (!synced?.id || !synced?.encryptedLabel) continue;
        if (synced.accountId === accountId) continue;
        try {
          await decrypt(synced.encryptedLabel, cryptoKey);
          await (db as any).transact(
            (db as any).tx.profile[synced.id].update({ accountId }),
          );
        } catch {
          // not our record
        }
      }

      await prefsRepo.set('notesAccountIdMigrated', true);
      setMigrated(true);
    };

    migrate();
  }, [data, cryptoKey, isAuthenticated, migrated, accountId]);

  useEffect(() => {
    if (!isAuthenticated || !cryptoKey || !data) return;

    const raw = JSON.stringify(data);
    if (raw === prevDataRef.current) return;
    prevDataRef.current = raw;

    console.log('[sync] data effect fired, has profile:', 'profile' in data, 'profile entries:', data.profile?.length ?? 'N/A', 'migrated:', migrated, 'accountId:', accountId?.slice(0, 8));

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

    (async () => {
      const syncedProfiles: any[] = data.profile ?? [];
      for (const synced of syncedProfiles) {
        if (!synced?.id || !synced?.encryptedLabel) continue;
        try {
          const label = await decrypt(synced.encryptedLabel, cryptoKey);
          const { accountLabel, setAccountLabel } = useAuthStore.getState();
          if (label !== accountLabel) {
            setAccountLabel(label);
            await prefsRepo.set('accountLabel', label);
          }
        } catch { /* skip */ }
      }
    })();
  }, [data, cryptoKey, isAuthenticated]);

  return null;
}
