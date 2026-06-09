import { GoCheck, GoPlus, GoX } from 'react-icons/go';
import { useState } from 'react';
import { DEFAULT_COLORS } from '../../constants/colors';
import { usePrefsStore } from '../../store/prefsStore';
import { useNotesStore } from '../../store/notesStore';

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
  onClose?: () => void;
}

function CustomColorDialog({ onSave, onCancel }: { onSave: (hex: string) => void; onCancel: () => void }) {
  const [pickerHex, setPickerHex] = useState('#FF6B6B');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-xs bg-[var(--color-canvas)] rounded-radius-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium text-[var(--color-ink)] mb-4">Choose a custom color</h3>
        <div className="flex justify-center mb-6">
          <input
            type="color"
            value={pickerHex}
            onChange={(e) => setPickerHex(e.target.value.toUpperCase())}
            className="w-24 h-24 p-0 border border-[var(--color-hairline)] rounded-full cursor-pointer bg-transparent"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(pickerHex)}
            className="flex-1 h-11 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function ColorPicker({ selectedColor, onSelect, onClose }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const { customColors, addCustomColor } = usePrefsStore();
  const notes = useNotesStore((s) => s.notes);

  const noteColors = [...new Set(notes.map((n) => n.color).filter((c) => c !== '#FFFFFF'))];
  const allColors = [
    ...DEFAULT_COLORS,
    ...customColors.map((hex) => ({ key: hex, hex, label: hex })),
    ...noteColors
      .filter((hex) => !DEFAULT_COLORS.some((dc) => dc.hex === hex) && !customColors.includes(hex))
      .map((hex) => ({ key: hex, hex, label: hex })),
  ];

  const handleCustomSave = (hex: string) => {
    addCustomColor(hex);
    onSelect(hex);
    setShowCustom(false);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--color-ink)]">Color</span>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center">
            <GoX className="w-4 h-4 text-[var(--color-muted)]" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {allColors.map(({ key, hex, label }) => (
          <button
            key={key}
            onClick={() => onSelect(hex)}
            className="relative w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-hairline)]"
            style={{ backgroundColor: hex }}
            aria-label={label}
          >
            {selectedColor === hex && <GoCheck className={`w-5 h-5 ${hex === '#FFFFFF' ? 'text-[var(--color-ink)]' : 'text-white'}`} />}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-dashed border-[var(--color-hairline)]"
        >
          <GoPlus className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
      </div>
      {showCustom && (
        <CustomColorDialog
          onSave={handleCustomSave}
          onCancel={() => setShowCustom(false)}
        />
      )}
    </div>
  );
}
