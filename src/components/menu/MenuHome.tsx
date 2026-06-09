import { useState, useCallback } from 'react';
import { GoSun, GoEye, GoTrash, GoArchive, GoPencil, GoX, GoArrowLeft } from 'react-icons/go';
import { AppearanceSettings } from './AppearanceSettings';
import { PrivacySettings } from './PrivacySettings';
import { TrashView } from './TrashView';
import { ArchiveView } from './ArchiveView';
import { usePrefsStore } from '../../store/prefsStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

type MenuSection = 'main' | 'appearance' | 'privacy' | 'trash' | 'archive' | 'colors';

interface MenuHomeProps {
  onClearAllData: () => void;
  onLogout: () => void;
  onRestoreNote: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onArchiveSelect: (id: string) => void;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-4 py-3 text-sm text-[var(--color-link)]"
    >
      <GoArrowLeft className="w-5 h-5" /> Back
    </button>
  );
}

export function MenuHome({ onClearAllData, onLogout, onRestoreNote, onPermanentDelete, onArchiveSelect }: MenuHomeProps) {
  const [section, setSection] = useState<MenuSection>('main');
  const [animState, setAnimState] = useState<{
    from: MenuSection;
    to: MenuSection;
    direction: 'forward' | 'back';
  } | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { customColors, removeCustomColor } = usePrefsStore();

  const navigate = useCallback((next: MenuSection) => {
    if (next === section || animState) return;
    if (next === 'main') {
      setAnimState({ from: section, to: 'main', direction: 'back' });
      setSection('main');
    } else {
      setAnimState({ from: section, to: next, direction: 'forward' });
      setSection(next);
    }
  }, [section, animState]);

  const handleAnimEnd = useCallback(() => {
    setAnimState(null);
  }, []);

  const renderSection = (s: MenuSection, showBack: boolean) => {
    if (s === 'main') {
      return (
        <div className="p-4 space-y-1">
          <button onClick={() => navigate('appearance')} className="w-full flex items-center gap-3 px-4 py-3 rounded-radius-lg text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]">
            <GoSun className="w-5 h-5 text-[var(--color-muted)]" /> Appearance
          </button>
          <button onClick={() => navigate('privacy')} className="w-full flex items-center gap-3 px-4 py-3 rounded-radius-lg text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]">
            <GoEye className="w-5 h-5 text-[var(--color-muted)]" /> Privacy
          </button>
          <button onClick={() => navigate('colors')} className="w-full flex items-center gap-3 px-4 py-3 rounded-radius-lg text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]">
            <GoPencil className="w-5 h-5 text-[var(--color-muted)]" /> Colors
          </button>
          <button onClick={() => navigate('trash')} className="w-full flex items-center gap-3 px-4 py-3 rounded-radius-lg text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]">
            <GoTrash className="w-5 h-5 text-[var(--color-muted)]" /> Trash
          </button>
          <button onClick={() => navigate('archive')} className="w-full flex items-center gap-3 px-4 py-3 rounded-radius-lg text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]">
            <GoArchive className="w-5 h-5 text-[var(--color-muted)]" /> Archive
          </button>
        </div>
      );
    }

    const content = (() => {
      switch (s) {
        case 'appearance':
          return <AppearanceSettings />;
        case 'privacy':
          return <PrivacySettings onClearAllData={onClearAllData} onLogout={onLogout} />;
        case 'trash':
          return <TrashView onRestore={onRestoreNote} onPermanentDelete={onPermanentDelete} />;
        case 'archive':
          return <ArchiveView onRestore={onRestoreNote} onSelect={onArchiveSelect} />;
        case 'colors':
          return (
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--color-muted)]">
                Custom colors you've added appear here. Delete ones you no longer want in the color picker.
              </p>
              {customColors.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">No custom colors saved yet.</p>
              ) : (
                customColors.map((hex) => (
                  <div key={hex} className="flex items-center gap-3 px-4 py-3 rounded-radius-lg border border-[var(--color-hairline)]">
                    <div className="w-8 h-8 rounded-full border border-[var(--color-hairline)] shrink-0" style={{ backgroundColor: hex }} />
                    <span className="text-sm text-[var(--color-body)] font-mono flex-1">{hex}</span>
                    <button onClick={() => removeCustomColor(hex)} className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <GoX className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          );
        default:
          return null;
      }
    })();

    return (
      <div>
        {showBack && <BackButton onClick={() => navigate('main')} />}
        {content}
      </div>
    );
  };

  const getAnimClass = (which: 'from' | 'to') => {
    if (!animState) return '';
    const { direction } = animState;
    if (which === 'from') {
      if (direction === 'forward') return isMobile ? 'animate-push-from' : 'animate-cross-fade-out';
      return isMobile ? 'animate-pop-from' : 'animate-cross-fade-out';
    }
    if (direction === 'forward') return isMobile ? 'animate-push-to' : 'animate-cross-fade-in';
    return isMobile ? 'animate-pop-to' : 'animate-cross-fade-in';
  };

  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-1 [&>*]:col-start-1 [&>*]:row-start-1">
        {animState && (
          <div key="from" className={`bg-[var(--color-canvas)] ${getAnimClass('from')}`}
            onAnimationEnd={handleAnimEnd}
          >
            {renderSection(animState.from, animState.from !== 'main')}
          </div>
        )}
        <div key="current" className={`bg-[var(--color-canvas)] ${animState ? getAnimClass('to') : ''}`}>
          {renderSection(animState ? animState.to : section, animState ? animState.to !== 'main' : section !== 'main')}
        </div>
      </div>
    </div>
  );
}
