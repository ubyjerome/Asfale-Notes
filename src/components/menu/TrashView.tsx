import { useState } from 'react';
import { GoSync, GoTrash } from 'react-icons/go';
import { useNotesStore } from '../../store/notesStore';
import { deriveTitle } from '../../utils/noteTitle';
import { formatRelativeDate } from '../../utils/dateFormat';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Toast } from '../ui/Toast';

interface TrashViewProps {
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export function TrashView({ onRestore, onPermanentDelete }: TrashViewProps) {
  const notes = useNotesStore((s) => s.notes);
  const trashedNotes = notes.filter((n) => n.isDeleted);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    type: 'delete' | 'restore';
  } | null>(null);

  if (trashedNotes.length === 0) {
    return <EmptyState title="Trash is empty" message="Deleted notes appear here." />;
  }

  return (
    <div className="p-4">
      <p className="text-xs text-[var(--color-muted)] mb-4">
        Notes in trash are permanently deleted after 30 days.
      </p>
      <div className="space-y-2">
        {trashedNotes.map((note) => (
          <div
            key={note.id}
            className="flex items-center gap-3 px-4 py-3 rounded-radius-lg border border-[var(--color-hairline)]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                {deriveTitle(note.title, note.content)}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                Deleted {note.deletedAt ? formatRelativeDate(note.deletedAt) : ''}
              </p>
            </div>
            <button
              onClick={() => setConfirmAction({ id: note.id, type: 'restore' })}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]"
            >
              <GoSync className="w-4 h-4" />
            </button>
            <button
              onClick={() => setConfirmAction({ id: note.id, type: 'delete' })}
              className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10"
            >
              <GoTrash className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Toast message={toastMessage} onDone={() => setToastMessage(null)} />

      <ConfirmDialog
        open={confirmAction?.type === 'delete'}
        title="Permanently delete?"
        message="This note will be permanently deleted and cannot be recovered."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!confirmAction) return;
          await onPermanentDelete(confirmAction.id);
          setConfirmAction(null);
          setToastMessage('Note permanently deleted');
        }}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={confirmAction?.type === 'restore'}
        title="Restore note?"
        message="This note will be restored to your active notes."
        confirmLabel="Restore"
        onConfirm={async () => {
          if (!confirmAction) return;
          await onRestore(confirmAction.id);
          setConfirmAction(null);
          setToastMessage('Note restored');
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
