import { GoDeviceDesktop, GoPencil } from 'react-icons/go';

interface ImportMethodPickerProps {
  onScan: () => void;
  onPaste: () => void;
  onBack: () => void;
}

export function ImportMethodPicker({ onScan, onPaste, onBack }: ImportMethodPickerProps) {
  return (
    <div className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-medium text-[var(--color-ink)] mb-2 text-center">
          Add Existing Account
        </h2>
        <p className="text-sm text-[var(--color-body)] mb-8 text-center">
          Choose how to import your recovery phrase.
        </p>
        <div className="space-y-3">
          <button
            onClick={onScan}
            className="w-full flex items-center gap-3 p-4 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <GoDeviceDesktop className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <div className="font-medium">Scan QR code</div>
              <div className="text-xs text-[var(--color-muted)] font-normal mt-0.5">
                Use your camera to scan
              </div>
            </div>
          </button>
          <button
            onClick={onPaste}
            className="w-full flex items-center gap-3 p-4 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <GoPencil className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <div className="font-medium">Import recovery phrase</div>
              <div className="text-xs text-[var(--color-muted)] font-normal mt-0.5">
                Paste your 12-word phrase
              </div>
            </div>
          </button>
        </div>
        <button
          onClick={onBack}
          className="w-full h-12 mt-6 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
        >
          Back
        </button>
      </div>
    </div>
  );
}
