import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesStore } from '../store/notesStore';
import { useNotes } from '../hooks/useNotes';
import { useMultiSelect } from '../hooks/useMultiSelect';
import { NoteGrid } from '../components/notes/NoteGrid';
import { NoteList } from '../components/notes/NoteList';
import { NoteDetailed } from '../components/notes/NoteDetailed';
import { ViewToggle } from '../components/notes/ViewToggle';
import { SortMenu } from '../components/notes/SortMenu';
import { MultiSelectBar } from '../components/notes/MultiSelectBar';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { EmptyState } from '../components/ui/EmptyState';
import type { Note } from '../types/note';

export function NotesPage() {
  const navigate = useNavigate();
  const { viewMode, sortOption, setViewMode, setSortOption } = useNotesStore();
  const { notes, loadNotes, bulkDelete, bulkArchive, bulkAssignColor } = useNotes();
  const { selectedNoteIds, isMultiSelecting, toggleNoteSelection, clearSelection } =
    useMultiSelect();

  useEffect(() => {
    document.title = 'Asfale Notes';
    loadNotes();
  }, [loadNotes]);

  const sortedNotes = useMemo(() => {
    const active = notes.filter((n) => !n.isDeleted && !n.isArchived);
    const pinned = active.filter((n) => n.isPinned);
    const unpinned = active.filter((n) => !n.isPinned);

    const sorter = (a: Note, b: Note) => {
      switch (sortOption) {
        case 'color':
          return a.color.localeCompare(b.color);
        case 'created-desc':
          return b.createdAt - a.createdAt;
        case 'created-asc':
          return a.createdAt - b.createdAt;
        case 'updated-desc':
          return b.updatedAt - a.updatedAt;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    };

    pinned.sort(sorter);
    unpinned.sort(sorter);

    return { pinned, unpinned, hasPinned: pinned.length > 0 };
  }, [notes, sortOption]);

  const ViewComponent = viewMode === 'grid' ? NoteGrid : viewMode === 'list' ? NoteList : NoteDetailed;

  const handleNoteClick = (id: string) => {
    if (isMultiSelecting) {
      toggleNoteSelection(id);
    } else {
      navigate(`/note/${id}`);
    }
  };

  if (sortedNotes.pinned.length === 0 && sortedNotes.unpinned.length === 0) {
    return (
      <div className="fade-in">
        <EmptyState />
        <FloatingActionButton onClick={() => navigate('/note/new')} />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {isMultiSelecting && (
        <MultiSelectBar
          count={selectedNoteIds.size}
          onAssignColor={(color) => {
            bulkAssignColor(Array.from(selectedNoteIds), color);
            clearSelection();
          }}
          onArchive={() => {
            bulkArchive(Array.from(selectedNoteIds));
            clearSelection();
          }}
          onDelete={() => {
            bulkDelete(Array.from(selectedNoteIds));
            clearSelection();
          }}
          onCancel={clearSelection}
        />
      )}

      <div className={`flex items-center justify-between px-4 py-3 ${isMultiSelecting ? 'mt-14' : ''}`}>
        <h1 className="text-lg font-medium text-[var(--color-ink)] lg:text-xl">Notes</h1>
        <div className="flex items-center gap-2">
          <ViewToggle current={viewMode} onChange={setViewMode} />
          <SortMenu current={sortOption} onChange={setSortOption} />
        </div>
      </div>

      {sortedNotes.hasPinned && (
        <div>
          <p className="px-4 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">Pinned</p>
          <ViewComponent
            notes={sortedNotes.pinned}
            selectedIds={selectedNoteIds}
            onSelect={isMultiSelecting ? handleNoteClick : undefined}
            onClick={handleNoteClick}
          />
        </div>
      )}

      {sortedNotes.hasPinned && sortedNotes.unpinned.length > 0 && (
        <p className="px-4 pt-4 text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">Notes</p>
      )}

      <ViewComponent
        notes={sortedNotes.unpinned}
        selectedIds={selectedNoteIds}
        onSelect={isMultiSelecting ? handleNoteClick : undefined}
        onClick={handleNoteClick}
      />

      <FloatingActionButton onClick={() => navigate('/note/new')} />
    </div>
  );
}
