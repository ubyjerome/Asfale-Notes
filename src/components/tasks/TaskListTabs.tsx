import { useRef, useEffect, useState } from 'react';
import { GoPlus } from 'react-icons/go';
import type { TaskList } from '../../types/task';

interface TaskListTabsProps {
  lists: TaskList[];
  activeListId: string | null;
  onSelect: (id: string) => void;
  onNewList: () => void;
  taskCounts?: Record<string, number>;
}

export function TaskListTabs({ lists, activeListId, onSelect, onNewList, taskCounts }: TaskListTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = () => {
    if (!activeListId) return;
    const btn = btnRefs.current.get(activeListId);
    const container = tabsRef.current;
    if (!btn || !container) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    setIndicatorStyle({
      left: btnRect.left - containerRect.left + container.scrollLeft,
      width: btnRect.width,
    });
  };

  useEffect(() => {
    updateIndicator();
  }, [activeListId, lists, taskCounts]);

  useEffect(() => {
    if (!activeListId) return;
    const btn = btnRefs.current.get(activeListId);
    if (!btn) return;

    const ro = new ResizeObserver(updateIndicator);
    ro.observe(btn);
    return () => ro.disconnect();
  }, [activeListId]);

  const getBtnRef = (id: string, el: HTMLButtonElement | null) => {
    if (el) {
      btnRefs.current.set(id, el);
    } else {
      btnRefs.current.delete(id);
    }
  };

  return (
    <div ref={tabsRef} className="relative flex items-center gap-1 px-4 py-3 overflow-x-auto scrollbar-none">
      {lists.map((list) => {
        const count = taskCounts?.[list.id] ?? 0;
        return (
          <button
            key={list.id}
            ref={(el) => getBtnRef(list.id, el)}
            onClick={() => onSelect(list.id)}
            className={`relative z-10 flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              activeListId === list.id
                ? 'text-[var(--color-on-primary)]'
                : 'text-[var(--color-body)] hover:bg-[var(--color-hairline)]'
            }`}
          >
            {list.name}
            {count > 0 && (
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            )}
          </button>
        );
      })}
      <button
        onClick={onNewList}
        className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full text-[var(--color-muted)] flex items-center justify-center hover:bg-[var(--color-hairline)]"
        aria-label="New list"
      >
        <GoPlus className="w-4 h-4" />
      </button>
      <div
        className="absolute bottom-3 h-9 rounded-full bg-[var(--color-primary)] transition-all duration-250 ease-out pointer-events-none"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
}
