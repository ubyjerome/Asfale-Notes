import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NoteEditor } from '../components/notes/NoteEditor';
import { useNotes } from '../hooks/useNotes';
import { notesRepo } from '../db/notesRepo';
import { generateId } from '../utils/uuid';
import type { Note } from '../types/note';

export function NotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateNote, deleteNote, archiveNote, duplicateNote, createNote } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const created = useRef(false);
  const loaded = useRef(false);

  useEffect(() => {
    const noteId = id ?? '';
    if (noteId === 'new') {
      if (created.current) return;
      created.current = true;
      const newNote: Note = {
        id: generateId(),
        title: '',
        content: '',
        color: '#FFFFFF',
        tags: [],
        isPinned: false,
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      createNote(newNote);
      setNote(newNote);
      setLoading(false);
      return;
    }
    if (loaded.current) return;
    loaded.current = true;

    notesRepo.getById(noteId).then((found) => {
      if (found && !found.isDeleted) {
        console.log('[NotePage] loaded note from Dexie:', found.id, 'title:', found.title, 'content length:', found.content.length);
        setNote(found);
      } else {
        console.warn('[NotePage] note not found or deleted:', noteId);
        navigate('/');
      }
      setLoading(false);
    });
  }, [id, navigate, createNote]);

  if (loading || !note) return null;

  return (
    <div className="h-screen overflow-hidden page-slide-in">
      <NoteEditor
        note={note}
        onSave={updateNote}
        onDelete={deleteNote}
        onArchive={archiveNote}
        onDuplicate={duplicateNote}
      />
    </div>
  );
}
