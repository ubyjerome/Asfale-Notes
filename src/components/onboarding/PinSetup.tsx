import { useState } from 'react';

interface PinSetupProps {
  onSkip: () => void;
  onConfirm: (pin: string) => void;
  finalizing?: boolean;
}

export function PinSetup({ onSkip, onConfirm, finalizing }: PinSetupProps) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [error, setError] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'set' && pin.length === 6) {
      setStep('confirm');
    } else if (step === 'confirm') {
      if (pin === confirm) {
        onConfirm(pin);
      } else {
        setError(true);
        setConfirm('');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-medium text-[var(--color-ink)] mb-2">
          {step === 'set' ? 'Set a PIN (Optional)' : 'Confirm PIN'}
        </h2>
        <p className="text-sm text-[var(--color-body)]">
          Set a PIN to protect viewing your recovery phrase in the app.
        </p>
      </div>

      <form onSubmit={handleNext}>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={step === 'set' ? pin : confirm}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            if (step === 'set') setPin(val);
            else setConfirm(val);
            setError(false);
          }}
          className="w-full h-12 text-center text-2xl tracking-widest bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-sm text-[var(--color-ink)]"
          autoFocus
          placeholder="------"
        />

        {error && <p className="text-red-500 text-xs mt-2">PINs do not match</p>}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onSkip}
            disabled={finalizing}
            className="flex-1 h-12 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg disabled:opacity-50 active:bg-[var(--color-surface-soft)]"
          >
            {finalizing ? 'Saving...' : 'Skip'}
          </button>
          <button
            type="submit"
            disabled={finalizing || (step === 'set' ? pin.length < 6 : confirm.length < 6)}
            className="flex-1 h-12 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50 active:bg-[var(--color-primary-active)]"
          >
            {finalizing ? 'Saving...' : step === 'set' ? 'Next' : 'Confirm'}
          </button>
        </div>
      </form>
    </div>
  );
}
