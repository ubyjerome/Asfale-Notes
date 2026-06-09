import { useState } from 'react';
import { GoFile, GoChecklist, GoSearch, GoKebabHorizontal, GoPlus } from 'react-icons/go';
import { useNotesStore } from '../../store/notesStore';

interface SidebarProps {
  onNewNote: () => void;
  onNewTask: () => void;
}

export function Sidebar({ onNewNote, onNewTask }: SidebarProps) {
  const { activeTab, setActiveTab } = useNotesStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const LINKS = [
    { key: 'notes' as const, label: 'Notes', icon: GoFile },
    { key: 'tasks' as const, label: 'Tasks', icon: GoChecklist },
    { key: 'search' as const, label: 'Search', icon: GoSearch },
    { key: 'menu' as const, label: 'Menu', icon: GoKebabHorizontal },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen bg-[var(--color-canvas)] border-r border-[var(--color-hairline)] fixed left-0 top-0 z-40">
      <div className="flex items-center gap-3 px-6 py-5">
        <img src="/icon/icon_black.png" alt="Asfale" className="w-6 h-6 dark:hidden" />
        <img src="/icon/icon_white.png" alt="Asfale" className="w-6 h-6 hidden dark:block" />
        <span className="text-lg font-medium text-[var(--color-ink)]">Asfale Notes</span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {LINKS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`w-full flex items-center gap-3 h-12 px-3 rounded-radius-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-[var(--color-surface-soft)] text-[var(--color-ink)]'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)]'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--color-hairline)] relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 h-12 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-radius-lg text-sm font-medium active:bg-[var(--color-primary-active)]"
        >
          <GoPlus className="w-5 h-5" />
          Add New
        </button>

        {showAddMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
            <div className="absolute bottom-full mb-2 left-3 right-3 z-20 bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg shadow-lg py-1">
              <button
                onClick={() => { setShowAddMenu(false); onNewNote(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]"
              >
                <GoFile className="w-4 h-4" />
                Note
              </button>
              <button
                onClick={() => { setShowAddMenu(false); onNewTask(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]"
              >
                <GoChecklist className="w-4 h-4" />
                Task
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
