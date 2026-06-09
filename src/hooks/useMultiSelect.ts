import { useCallback } from 'react';
import { useNotesStore } from '../store/notesStore';

export function useMultiSelect() {
  const { selectedNoteIds, isMultiSelecting, toggleNoteSelection, clearSelection, setIsMultiSelecting } =
    useNotesStore();

  const startMultiSelect = useCallback(
    (id: string) => {
      setIsMultiSelecting(true);
      toggleNoteSelection(id);
    },
    [setIsMultiSelecting, toggleNoteSelection],
  );

  return { selectedNoteIds, isMultiSelecting, toggleNoteSelection, clearSelection, startMultiSelect };
}
