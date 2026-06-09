import type { Note } from '../../types/note';
import { NoteCard } from './NoteCard';

interface NoteGridProps {
  notes: Note[];
  selectedIds: Set<string>;
  onSelect?: (id: string) => void;
  onClick: (id: string) => void;
}

export function NoteGrid({ notes, selectedIds, onSelect, onClick }: NoteGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          variant="grid"
          isSelected={selectedIds.has(note.id)}
          onSelect={onSelect}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
