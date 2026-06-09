import { useState, useRef } from 'react';
import { GoX, GoLock } from 'react-icons/go';

interface PinEntryModalProps {
  open: boolean;
  title?: string;
  onVerify: (pin: string) => boolean;
  onClose: () => void;
}

export function PinEntryModal({ open, title = 'Enter PIN', onVerify, onClose }: PinEntryModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = onVerify(pin);
    if (valid) {
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xs bg-[var(--color-canvas)] rounded-radius-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GoLock className="w-5 h-5 text-[var(--color-muted)]" />
            <h3 className="text-lg font-medium text-[var(--color-ink)]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-soft)]"
          >
            <GoX className="w-5 h-5 text-[var(--color-muted)]" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setPin(val);
              setError(false);
            }}
            className={`w-full h-12 text-center text-2xl tracking-widest bg-[var(--color-canvas)] border-2 rounded-radius-sm ${
              error ? 'border-red-500' : 'border-[var(--color-hairline)]'
            }`}
            autoFocus
            placeholder="------"
          />
          {error && <p className="text-red-500 text-xs mt-2 text-center">Incorrect PIN</p>}
          <button
            type="submit"
            disabled={pin.length < 6}
            className="w-full h-11 mt-4 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
