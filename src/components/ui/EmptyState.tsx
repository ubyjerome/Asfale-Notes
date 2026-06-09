import { GoFile } from 'react-icons/go';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'No notes yet',
  message = 'Create a new note to get started.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-surface-soft)] flex items-center justify-center mb-4">
        <GoFile className="w-8 h-8 text-[var(--color-muted)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--color-ink)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-muted)]">{message}</p>
    </div>
  );
}
