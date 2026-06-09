import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import type { Note } from '../types/note';

export function useSearch(notes: Note[]) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(notes, {
        keys: ['title', 'content', 'tags'],
        threshold: 0.35,
        includeMatches: true,
      }),
    [notes],
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query);
  }, [fuse, query]);

  return { query, setQuery, results };
}
