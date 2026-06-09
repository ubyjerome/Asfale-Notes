import { useState, useRef, useEffect, useCallback } from 'react';
import { GoListUnordered, GoCalendar, GoStar, GoStarFill } from 'react-icons/go';

interface NewTaskBottomSheetProps {
  onSave: (title: string, description: string, dueDate?: number, isStarred?: boolean) => void;
  onClose: () => void;
}

export function NewTaskBottomSheet({ onSave, onClose }: NewTaskBottomSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [discardToast, setDiscardToast] = useState(false);
  const discardedTitleRef = useRef('');

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim()) return;
    const due = dueDate ? new Date(dueDate).getTime() : undefined;
    onSave(title.trim(), description.trim(), due, isStarred);
    setTitle('');
    setDescription('');
    setDueDate('');
    setIsStarred(false);
    setShowDescription(false);
    setShowDatePicker(false);
    titleRef.current?.focus();
  }, [title, description, dueDate, isStarred, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleBackdropClick = () => {
    if (title.trim()) {
      discardedTitleRef.current = title.trim();
      setDiscardToast(true);
      setTimeout(() => {
        setDiscardToast(false);
        onClose();
      }, 3000);
    } else {
      onClose();
    }
  };

  const handleUndoDiscard = () => {
    setDiscardToast(false);
    setTitle(discardedTitleRef.current);
    discardedTitleRef.current = '';
    titleRef.current?.focus();
  };

  const handleDragStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleDragMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - startYRef.current;
    if (diff > 0) setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (dragOffset > 100) {
      if (title.trim()) {
        discardedTitleRef.current = title.trim();
        setDiscardToast(true);
        setTimeout(() => {
          setDiscardToast(false);
          onClose();
        }, 3000);
      } else {
        onClose();
      }
    }
    setDragOffset(0);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40" onClick={handleBackdropClick} />

      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[60] bg-[var(--color-canvas)] rounded-t-2xl shadow-xl transition-transform duration-[250ms] ease-out"
        style={{ transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : 'translateY(0)' }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-2 mb-3" />

        <div className="px-4 pb-6">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task"
            className="w-full h-12 text-base text-[var(--color-ink)] bg-transparent outline-none placeholder:text-[var(--color-muted)]"
            onKeyDown={handleKeyDown}
          />

          {showDescription ? (
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details"
              rows={3}
              className="w-full px-0 py-1 text-sm text-[var(--color-body)] bg-transparent outline-none resize-none placeholder:text-[var(--color-muted)]"
            />
          ) : (
            <button
              onClick={() => setShowDescription(true)}
              className="w-full h-12 text-sm text-[var(--color-muted)] text-left px-0"
            >
              Add details
            </button>
          )}

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <button
                onClick={() => setShowDescription(true)}
                className={`w-12 h-12 flex items-center justify-center ${
                  showDescription ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
                }`}
              >
                <GoListUnordered className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  if (dueDate) {
                    setDueDate('');
                    setShowDatePicker(false);
                  } else if (showDatePicker) {
                    setShowDatePicker(false);
                  } else {
                    setShowDatePicker(true);
                    setTimeout(() => dateInputRef.current?.showPicker?.(), 50);
                  }
                }}
                className={`w-12 h-12 flex items-center justify-center ${
                  dueDate ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
                }`}
              >
                <GoCalendar className="w-5 h-5" />
              </button>
              {dueDate && (
                <span className="text-xs text-[var(--color-primary)] mr-2">
                  {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}

              <button
                onClick={() => setIsStarred(!isStarred)}
                className={`w-12 h-12 flex items-center justify-center ${
                  isStarred ? 'text-yellow-500' : 'text-[var(--color-muted)]'
                }`}
              >
                {isStarred ? <GoStarFill className="w-5 h-5" /> : <GoStar className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="text-sm font-semibold text-[var(--color-primary)] disabled:opacity-30 h-12 px-2"
            >
              Save
            </button>
          </div>

          {showDatePicker && (
            <input
              ref={dateInputRef}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-11 px-3 mt-1 text-sm bg-[var(--color-surface-soft)] rounded-radius-sm outline-none text-[var(--color-ink)]"
            />
          )}
        </div>
      </div>

      {discardToast && (
        <div className="fixed bottom-4 left-4 right-4 z-[70] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg shadow-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-[var(--color-body)]">Discard task?</span>
          <button
            onClick={handleUndoDiscard}
            className="text-sm font-medium text-[var(--color-primary)]"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
