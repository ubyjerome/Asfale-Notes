import { GoListUnordered } from 'react-icons/go';

export function TaskDragHandle() {
  return (
    <span className="w-8 h-8 flex items-center justify-center text-[var(--color-muted)] cursor-grab active:cursor-grabbing touch-none">
      <GoListUnordered className="w-4 h-4 rotate-90" />
    </span>
  );
}
