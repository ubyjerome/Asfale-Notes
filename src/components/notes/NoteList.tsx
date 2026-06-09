import type { Note } from '../../types/note';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  selectedIds: Set<string>;
  onSelect?: (id: string) => void;
  onClick: (id: string) => void;
}

export function NoteList({ notes, selectedIds, onSelect, onClick }: NoteListProps) {
  return (
    <div>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          variant="list"
          isSelected={selectedIds.has(note.id)}
          onSelect={onSelect}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
