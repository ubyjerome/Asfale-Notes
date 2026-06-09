import { GoFile, GoChecklist, GoSearch, GoKebabHorizontal } from 'react-icons/go';
import { useNotesStore } from '../../store/notesStore';

const TABS = [
  { key: 'notes' as const, label: 'Notes', icon: GoFile },
  { key: 'tasks' as const, label: 'Tasks', icon: GoChecklist },
  { key: 'search' as const, label: 'Search', icon: GoSearch },
  { key: 'menu' as const, label: 'Menu', icon: GoKebabHorizontal },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useNotesStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-canvas)] border-t border-[var(--color-hairline)] flex items-center justify-around md:hidden z-40">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`flex flex-col items-center justify-center h-12 min-w-[64px] gap-0.5 ${
            activeTab === key ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
}
