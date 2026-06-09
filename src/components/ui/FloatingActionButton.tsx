import { GoPlus } from 'react-icons/go';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:hidden w-14 h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg flex items-center justify-center active:bg-[var(--color-primary-active)]"
      aria-label="New note"
    >
      <GoPlus className="w-6 h-6" />
    </button>
  );
}
