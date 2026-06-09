import { create } from 'zustand';
import type { Note, SortOption, ViewMode } from '../types/note';

interface NotesState {
  notes: Note[];
  viewMode: ViewMode;
  sortOption: SortOption;
  activeTab: 'notes' | 'tasks' | 'search' | 'menu';
  selectedNoteIds: Set<string>;
  isMultiSelecting: boolean;
  setNotes: (notes: Note[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (option: SortOption) => void;
  setActiveTab: (tab: 'notes' | 'tasks' | 'search' | 'menu') => void;
  setSelectedNoteIds: (ids: Set<string>) => void;
  setIsMultiSelecting: (value: boolean) => void;
  clearSelection: () => void;
  toggleNoteSelection: (id: string) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  viewMode: 'grid',
  sortOption: 'updated-desc',
  activeTab: 'notes',
  selectedNoteIds: new Set(),
  isMultiSelecting: false,
  setNotes: (notes) => set({ notes }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSortOption: (sortOption) => set({ sortOption }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedNoteIds: (selectedNoteIds) => set({ selectedNoteIds }),
  setIsMultiSelecting: (isMultiSelecting) => set({ isMultiSelecting }),
  clearSelection: () => set({ selectedNoteIds: new Set(), isMultiSelecting: false }),
  toggleNoteSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedNoteIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedNoteIds: next, isMultiSelecting: next.size > 0 || state.isMultiSelecting };
    }),
}));
