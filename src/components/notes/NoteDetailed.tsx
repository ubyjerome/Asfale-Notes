import type { Note } from '../../types/note';
import { NoteCard } from './NoteCard';

interface NoteDetailedProps {
  notes: Note[];
  selectedIds: Set<string>;
  onSelect?: (id: string) => void;
  onClick: (id: string) => void;
}

export function NoteDetailed({ notes, selectedIds, onSelect, onClick }: NoteDetailedProps) {
  return (
    <div className="grid grid-cols-1 gap-3 p-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          variant="detailed"
          isSelected={selectedIds.has(note.id)}
          onSelect={onSelect}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
