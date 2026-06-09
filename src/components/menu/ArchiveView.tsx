import { GoSync } from 'react-icons/go';
import { useNotesStore } from '../../store/notesStore';
import { deriveTitle } from '../../utils/noteTitle';
import { formatRelativeDate } from '../../utils/dateFormat';
import { EmptyState } from '../ui/EmptyState';

interface ArchiveViewProps {
  onRestore: (id: string) => void;
  onSelect: (id: string) => void;
}

export function ArchiveView({ onRestore, onSelect }: ArchiveViewProps) {
  const notes = useNotesStore((s) => s.notes);
  const archivedNotes = notes.filter((n) => n.isArchived && !n.isDeleted);

  if (archivedNotes.length === 0) {
    return <EmptyState title="Archive is empty" message="Archived notes appear here." />;
  }

  return (
    <div className="p-4 space-y-2">
      {archivedNotes.map((note) => (
        <div
          key={note.id}
          className="flex items-center gap-3 px-4 py-3 rounded-radius-lg border border-[var(--color-hairline)]"
        >
          <button
            onClick={() => onSelect(note.id)}
            className="flex-1 min-w-0 text-left"
          >
            <p className="text-sm font-medium text-[var(--color-ink)] truncate">
              {deriveTitle(note.title, note.content)}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Archived {formatRelativeDate(note.updatedAt)}
            </p>
          </button>
          <button
            onClick={() => onRestore(note.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]"
          >
            <GoSync className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
