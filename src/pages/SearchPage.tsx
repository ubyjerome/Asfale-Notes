import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useNotesStore } from '../store/notesStore';
import { useTasksStore } from '../store/tasksStore';
import { useSearch } from '../hooks/useSearch';
import { SearchBar } from '../components/search/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import { deriveTitle } from '../utils/noteTitle';
import type { Note } from '../types/note';
import type { Task } from '../types/task';
import type { FuseResult, FuseResultMatch } from 'fuse.js';

type SearchResultItem = (
  | { type: 'note'; item: Note }
  | { type: 'task'; item: Task }
);

export function SearchPage() {
  const navigate = useNavigate();
  const notes = useNotesStore((s) => s.notes).filter((n) => !n.isDeleted && !n.isArchived);
  const tasks = useTasksStore((s) => s.tasks);
  const { query, setQuery } = useSearch(notes);

  const combinedResults = useMemo((): FuseResult<SearchResultItem>[] => {
    if (!query.trim()) return [];

    const noteFuse = new Fuse(notes.map((n) => ({ type: 'note' as const, item: n })), {
      keys: ['item.title', 'item.content', 'item.tags'],
      threshold: 0.35,
      includeMatches: true,
    });

    const taskFuse = new Fuse(tasks.map((t) => ({ type: 'task' as const, item: t })), {
      keys: ['item.title', 'item.description', 'item.subtasks.title'],
      threshold: 0.35,
      includeMatches: true,
    });

    const noteResults = noteFuse.search(query);
    const taskResults = taskFuse.search(query);

    return [...noteResults, ...taskResults];
  }, [notes, tasks, query]);

  const handleSelect = (id: string, type: string) => {
    if (type === 'task') {
      return;
    }
    navigate(`/note/${id}`);
  };

  if (!query.trim()) {
    return (
      <div className="fade-in">
        <SearchBar value={query} onChange={setQuery} autoFocus />
        <EmptyState title="Search your notes" message="Start typing to search across notes and tasks." />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <SearchBar value={query} onChange={setQuery} autoFocus />
      {combinedResults.length === 0 ? (
        <EmptyState title="No results found" message={`Nothing matches "${query}".`} />
      ) : (
        <div className="px-4 pb-4">
          {combinedResults.map(({ item: result, matches }: FuseResult<SearchResultItem>) => {
            if (result.type === 'note') {
              const note = result.item;
              const title = deriveTitle(note.title, note.content);
              const titleMatch = matches?.find((m) => m.key === 'item.title');
              const contentMatch = matches?.find((m) => m.key === 'item.content');

              return (
                <button
                  key={`note-${note.id}`}
                  onClick={() => handleSelect(note.id, 'note')}
                  className="w-full text-left flex gap-3 px-4 py-3 border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]"
                >
                  <span className="w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: note.color }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[var(--color-ink)] line-clamp-1">
                      {highlightText(title, titleMatch)}
                    </h3>
                    <p className="text-xs text-[var(--color-body)] line-clamp-2 mt-0.5">
                      {highlightText(note.content, contentMatch)}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {note.tags.map((tag: string) => (
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

            const task = result.item;
            const taskTitleMatch = matches?.find((m) => m.key === 'item.title');

            return (
              <button
                key={`task-${task.id}`}
                className="w-full text-left flex gap-3 px-4 py-3 border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]"
              >
                <span className="w-1 flex-shrink-0 rounded-full bg-[var(--color-muted)]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      task.isCompleted ? 'bg-green-500 border-green-500' : 'border-[var(--color-border-strong)]'
                    }`}>
                      {task.isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <h3 className={`text-sm font-medium line-clamp-1 ${
                      task.isCompleted ? 'line-through text-[var(--color-muted)]' : 'text-[var(--color-ink)]'
                    }`}>
                      {highlightText(task.title, taskTitleMatch)}
                    </h3>
                  </div>
                  {task.description && (
                    <p className="text-xs text-[var(--color-body)] line-clamp-1 mt-1 ml-6">
                      {task.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function highlightText(text: string, match?: FuseResultMatch) {
  if (!match || !match.indices?.length) return text;

  const parts: { text: string; highlighted: boolean }[] = [];
  let lastEnd = 0;

  for (const [start, end] of match.indices as [number, number][]) {
    if (start > lastEnd) {
      parts.push({ text: text.slice(lastEnd, start), highlighted: false });
    }
    parts.push({ text: text.slice(start, end + 1), highlighted: true });
    lastEnd = end + 1;
  }

  if (lastEnd < text.length) {
    parts.push({ text: text.slice(lastEnd), highlighted: false });
  }

  return parts.map((part, i) =>
    part.highlighted ? (
      <mark key={i} className="bg-yellow-200 text-[var(--color-ink)] rounded-sm px-0.5">
        {part.text}
      </mark>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  );
}
