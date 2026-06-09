import type { Note } from '../../types/note';
import { deriveTitle } from '../../utils/noteTitle';
import { formatRelativeDate } from '../../utils/dateFormat';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onClick: (id: string) => void;
  variant?: 'grid' | 'list' | 'detailed';
}

export function NoteCard({ note, isSelected, onSelect, onClick, variant = 'grid' }: NoteCardProps) {
  const title = deriveTitle(note.title, note.content);

  const cardStyle = note.color !== '#FFFFFF' ? { backgroundColor: note.color + '20' } : {};

  const handleClick = () => {
    if (onSelect && isSelected !== undefined) {
      onSelect(note.id);
    } else {
      onClick(note.id);
    }
  };

  if (variant === 'list') {
    return (
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--color-hairline)] text-left hover:bg-[var(--color-surface-soft)] ${
          isSelected ? 'bg-[var(--color-surface-soft)]' : ''
        }`}
        style={cardStyle}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: note.color }} />
        <span className="flex-1 text-sm font-medium text-[var(--color-ink)] truncate">{title}</span>
        <span className="text-xs text-[var(--color-muted)] flex-shrink-0">{formatRelativeDate(note.updatedAt)}</span>
      </button>
    );
  }

  if (variant === 'detailed') {
    return (
      <button
        onClick={handleClick}
        className={`w-full text-left p-4 rounded-radius-lg border border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)] ${
          isSelected ? 'ring-2 ring-[var(--color-link)]' : ''
        }`}
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-[var(--color-ink)] line-clamp-1">{title}</h3>
          {note.isPinned && <span className="text-xs text-[var(--color-muted)]">Pinned</span>}
        </div>
        <p className="text-xs text-[var(--color-body)] line-clamp-2 mb-2">{note.content}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--color-muted)]">{formatRelativeDate(note.updatedAt)}</span>
          {note.tags.length > 0 && (
            <div className="flex gap-1">
              {note.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-[var(--color-surface-soft)] rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-4 rounded-radius-lg border border-[var(--color-hairline)] min-h-[100px] hover:bg-[var(--color-surface-soft)] ${
        isSelected ? 'ring-2 ring-[var(--color-link)]' : ''
      }`}
      style={cardStyle}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium text-[var(--color-ink)] line-clamp-2">{title}</h3>
        {note.isPinned && <span className="text-[10px] text-[var(--color-muted)]">Pinned</span>}
      </div>
      <p className="text-xs text-[var(--color-body)] line-clamp-3 mb-2">{note.content}</p>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-[var(--color-surface-soft)] text-[var(--color-muted)] rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
