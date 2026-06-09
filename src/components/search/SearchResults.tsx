import type { FuseResult, FuseResultMatch } from 'fuse.js';
import type { Note } from '../../types/note';
import { deriveTitle } from '../../utils/noteTitle';
import { EmptyState } from '../ui/EmptyState';

interface SearchResultsProps {
  results: FuseResult<Note>[];
  query: string;
  onSelect: (id: string) => void;
}

export function SearchResults({ results, query, onSelect }: SearchResultsProps) {
  if (!query.trim()) {
    return <EmptyState title="Search your notes" message="Start typing to search across titles, content, and tags." />;
  }

  if (results.length === 0) {
    return <EmptyState title="No results found" message={`No notes match "${query}".`} />;
  }

  return (
    <div className="px-4 pb-4">
      {results.map(({ item, matches }: FuseResult<Note>) => {
        const title = deriveTitle(item.title, item.content);
        const titleMatch = matches?.find((m) => m.key === 'title');
        const contentMatch = matches?.find((m) => m.key === 'content');

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full text-left flex gap-3 px-4 py-3 border-b border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]"
          >
            <span className="w-1 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-[var(--color-ink)] line-clamp-1">
                {highlightMatches(title, titleMatch)}
              </h3>
              <p className="text-xs text-[var(--color-body)] line-clamp-2 mt-0.5">
                {highlightMatches(item.content, contentMatch)}
              </p>
              {item.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                    {item.tags.map((tag: string) => (
                    <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-[var(--color-surface-soft)] rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function highlightMatches(text: string, match?: FuseResultMatch) {
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
