import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GoArrowLeft,
  GoKebabHorizontal,
  GoPin,
  GoStar,
  GoArchive,
  GoCopy,
  GoTrash,
} from 'react-icons/go';
import type { Note } from '../../types/note';
import { deriveTitle } from '../../utils/noteTitle';
import { ColorPicker } from './ColorPicker';
import { TagInput } from './TagInput';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useSync } from '../../hooks/useSync';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function NoteEditor({ note, onSave, onDelete, onArchive, onDuplicate }: NoteEditorProps) {
  const navigate = useNavigate();
  const { pushNote } = useSync();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [color, setColor] = useState(note.color);
  const [tags, setTags] = useState(note.tags);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentNote = useRef(note);

  useEffect(() => {
    currentNote.current = note;
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setTags(note.tags);
    setIsPinned(note.isPinned);
    setIsFavorite(note.isFavorite);
  }, [note.id]);

  const persist = useCallback(
    (t: string, c: string, clr: string, tg: string[], pinned: boolean, fav: boolean) => {
      const updated: Note = {
        ...currentNote.current,
        title: t,
        content: c,
        color: clr,
        tags: tg,
        isPinned: pinned,
        isFavorite: fav,
        updatedAt: Date.now(),
      };
      onSave(updated);
      pushNote(updated);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1500);
    },
    [onSave, pushNote],
  );

  const scheduleSave = useCallback(
    (t: string, c: string, clr: string, tg: string[], pinned: boolean, fav: boolean) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(t, c, clr, tg, pinned, fav), 500);
    },
    [persist],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    scheduleSave(val, content, color, tags, isPinned, isFavorite);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    scheduleSave(title, val, color, tags, isPinned, isFavorite);
  };

  const handleColorSelect = (clr: string) => {
    setColor(clr);
    setShowColorPicker(false);
    scheduleSave(title, content, clr, tags, isPinned, isFavorite);
  };

  const handleTagAdd = (tag: string) => {
    const updated = [...tags, tag];
    setTags(updated);
    scheduleSave(title, content, color, updated, isPinned, isFavorite);
  };

  const handleTagRemove = (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    scheduleSave(title, content, color, updated, isPinned, isFavorite);
  };

  const togglePin = () => {
    const val = !isPinned;
    setIsPinned(val);
    persist(title, content, color, tags, val, isFavorite);
  };

  const toggleFav = () => {
    const val = !isFavorite;
    setIsFavorite(val);
    persist(title, content, color, tags, isPinned, val);
  };

  const docTitle = deriveTitle(title, content) + ' -- Asfale Notes';
  useEffect(() => {
    document.title = docTitle;
  }, [docTitle]);

  const charCount = content.length;

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleDeleteConfirm = async () => {
    await onDelete(note.id);
    setShowDeleteConfirm(false);
    setToast('Note deleted');
    setTimeout(() => navigate('/'), 300);
  };

  return (
    <div
      className="flex flex-col h-full min-h-0"
      style={{ backgroundColor: color !== '#FFFFFF' ? color + '15' : undefined }}
    >

      <div className="relative z-10 flex items-center justify-between px-4 h-14 border-b border-[var(--color-hairline)] bg-[var(--color-canvas)]/80 backdrop-blur-sm flex-shrink-0">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full flex items-center justify-center">
          <GoArrowLeft className="w-5 h-5 text-[var(--color-ink)]" />
        </button>
        <div className="flex items-center gap-1">
          {savedIndicator && (
            <span className="text-xs text-green-600 mr-2">Saved</span>
          )}
          <span className="text-xs text-[var(--color-muted)] mr-1 hidden sm:inline">{charCount} chars</span>
          <button
            onClick={togglePin}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isPinned ? 'text-blue-500' : 'text-[var(--color-muted)]'
            }`}
          >
            <GoPin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={toggleFav}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isFavorite ? 'text-yellow-500' : 'text-[var(--color-muted)]'
            }`}
          >
            <GoStar className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)]"
          >
            <div
              className="w-4 h-4 rounded-full border border-[var(--color-hairline)]"
              style={{ backgroundColor: color }}
            />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)]"
            >
              <GoKebabHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg shadow-lg py-1">
                  <button
                    onClick={() => { onArchive(note.id); navigate('/'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]"
                  >
                    <GoArchive className="w-4 h-4" /> Archive
                  </button>
                  <button
                    onClick={() => { onDuplicate(note.id); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]"
                  >
                    <GoCopy className="w-4 h-4" /> Duplicate
                  </button>
                  <div className="border-t border-[var(--color-hairline)] mt-1 pt-1 pb-2 px-3">
                    <TagInput tags={tags} onAdd={handleTagAdd} onRemove={handleTagRemove} />
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <GoTrash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showColorPicker && (
        <div className="px-5 lg:px-8 py-2 border-b border-[var(--color-hairline)] flex-shrink-0">
          <ColorPicker selectedColor={color} onSelect={handleColorSelect} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="px-5 pt-6 pb-2 lg:px-8 lg:pt-8 flex-shrink-0">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Title"
            className="w-full text-xl lg:text-2xl font-medium bg-transparent outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing..."
          className="flex-1 w-full px-5 lg:px-8 py-2 text-sm leading-relaxed bg-transparent outline-none resize-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)] min-h-0"
        />
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? It will be moved to trash."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm rounded-radius-lg shadow-lg fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
