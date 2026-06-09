import { useEffect, useRef, useState } from 'react';
import { db } from '../../sync/db';
import { useAuthStore } from '../../store/authStore';
import { useTasksStore } from '../../store/tasksStore';
import { decrypt } from '../../crypto/encrypt';
import { tasksRepo } from '../../db/tasksRepo';
import { prefsRepo } from '../../db/prefsRepo';
import type { Task, TaskList, Subtask } from '../../types/task';

export function TaskSyncSubscriber() {
  const cryptoKey = useAuthStore((s) => s.cryptoKey);
  const accountId = useAuthStore((s) => s.accountId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [migrated, setMigrated] = useState(false);
  const migratingRef = useRef(false);
  const prevDataRef = useRef<string>('');

  const query =
    migrated && accountId
      ? ({
          tasks: { $: { where: { accountId } } },
          taskLists: { $: { where: { accountId } } },
        } as any)
      : ({ tasks: {}, taskLists: {} } as any);

  const { data } = !db
    ? { data: undefined }
    : (db.useQuery as any)(query) ?? { data: undefined };

  useEffect(() => {
    prefsRepo.get<boolean>('accountIdMigrated').then((done) => {
      if (done) setMigrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !cryptoKey || !accountId || migratingRef.current || migrated) return;
    if (!data) return;

    migratingRef.current = true;

    const migrate = async () => {
      const syncedTasks: any[] = data.tasks ?? [];
      const syncedLists: any[] = data.taskLists ?? [];

      for (const synced of syncedLists) {
        if (!synced?.id || !synced?.encryptedName) continue;
        if (synced.accountId === accountId) continue;
        try {
          await decrypt(synced.encryptedName, cryptoKey);
          await (db as any).transact(
            (db as any).tx.taskLists[synced.id].update({ accountId }),
          );
        } catch {
          // not our record
        }
      }

      for (const synced of syncedTasks) {
        if (!synced?.id || !synced?.encryptedTitle) continue;
        if (synced.accountId === accountId) continue;
        try {
          await decrypt(synced.encryptedTitle, cryptoKey);
          await (db as any).transact(
            (db as any).tx.tasks[synced.id].update({ accountId }),
          );
        } catch {
          // not our record
        }
      }

      await prefsRepo.set('accountIdMigrated', true);
      setMigrated(true);
    };

    migrate();
  }, [data, cryptoKey, isAuthenticated, migrated, accountId]);

  useEffect(() => {
    if (!isAuthenticated || !cryptoKey || !data) return;

    const raw = JSON.stringify(data);
    if (raw === prevDataRef.current) return;
    prevDataRef.current = raw;

    const syncedTasks: any[] = data.tasks ?? [];
    const syncedLists: any[] = data.taskLists ?? [];

    const process = async () => {
      for (const synced of syncedLists) {
        if (!synced?.id || !synced?.encryptedName) continue;
        try {
          const local = await tasksRepo.getListById(synced.id);
          if (local && synced.updatedAt <= local.updatedAt) continue;

          const list: TaskList = {
            id: synced.id,
            name: await decrypt(synced.encryptedName, cryptoKey),
            color: synced.color,
            order: synced.order,
            isDeleted: synced.isDeleted ?? false,
            createdAt: synced.createdAt,
            updatedAt: synced.updatedAt,
          };

          await tasksRepo.saveList(list);

          const { lists, setLists } = useTasksStore.getState();
          if (list.isDeleted) {
            setLists(lists.filter((l) => l.id !== list.id));
          } else {
            const exists = lists.find((l) => l.id === list.id);
            setLists(
              exists
                ? lists.map((l) => (l.id === list.id ? list : l))
                : [...lists, list],
            );
          }
        } catch {
          // skip unprocessable lists
        }
      }

      for (const synced of syncedTasks) {
        if (!synced?.id || !synced?.encryptedTitle) continue;
        try {
          const local = await tasksRepo.getTaskById(synced.id);
          if (local && synced.updatedAt <= local.updatedAt) continue;

          const subtasksRaw = synced.encryptedSubtasks
            ? await decrypt(synced.encryptedSubtasks, cryptoKey)
            : '[]';
          let subtasks: Subtask[] = [];
          try { subtasks = JSON.parse(subtasksRaw); } catch { subtasks = []; }

          const task: Task = {
            id: synced.id,
            listId: synced.listId,
            title: await decrypt(synced.encryptedTitle, cryptoKey),
            description: synced.encryptedDescription
              ? await decrypt(synced.encryptedDescription, cryptoKey)
              : undefined,
            subtasks,
            isCompleted: synced.isCompleted ?? false,
            isStarred: synced.isStarred ?? false,
            isDeleted: synced.isDeleted ?? false,
            dueDate: synced.dueDate,
            order: synced.order,
            createdAt: synced.createdAt,
            updatedAt: synced.updatedAt,
          };

          await tasksRepo.saveTask(task);

          const { tasks, setTasks } = useTasksStore.getState();
          if (task.isDeleted) {
            setTasks(tasks.filter((t) => t.id !== task.id));
          } else {
            const exists = tasks.find((t) => t.id === task.id);
            setTasks(
              exists
                ? tasks.map((t) => (t.id === task.id ? task : t))
                : [task, ...tasks],
            );
          }
        } catch {
          // skip unprocessable tasks
        }
      }
    };

    process();
  }, [data, cryptoKey, isAuthenticated]);

  return null;
}
