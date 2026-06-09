import { usePrefsStore } from '../../store/prefsStore';
import { FONT_OPTIONS } from '../../constants/fonts';

export function AppearanceSettings() {
  const { theme, font, setTheme, setFont } = usePrefsStore();

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-[var(--color-ink)] mb-3">Theme</h3>
        <div className="flex rounded-radius-lg border border-[var(--color-hairline)] overflow-hidden">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 h-11 text-sm font-medium ${
                theme === t
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-body)]'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-[var(--color-ink)] mb-3">Font</h3>
        <div className="space-y-1">
          {FONT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFont(opt.key)}
              className={`w-full text-left px-4 py-3 rounded-radius-lg text-sm ${
                font === opt.key
                  ? 'bg-[var(--color-surface-soft)] text-[var(--color-ink)] font-medium'
                  : 'text-[var(--color-body)]'
              }`}
              style={{ fontFamily: opt.family }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
