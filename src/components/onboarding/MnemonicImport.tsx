import { useState } from 'react';

interface MnemonicImportProps {
  onImport: (mnemonic: string) => void;
  validate: (mnemonic: string) => boolean;
}

export function MnemonicImport({ onImport, validate }: MnemonicImportProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const trimmed = input.trim().toLowerCase();

  const handleContinue = () => {
    if (validate(trimmed)) {
      onImport(trimmed);
    } else {
      setError(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-medium text-[var(--color-ink)] mb-2">Import Recovery Phrase</h2>
        <p className="text-sm text-[var(--color-body)]">
          Paste your 12-word recovery phrase below.
        </p>
      </div>

      <textarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError(false);
        }}
        placeholder="Paste your recovery phrase..."
        rows={4}
        className={`w-full p-4 text-sm bg-[var(--color-canvas)] border rounded-radius-lg resize-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)] ${
          error ? 'border-red-500' : 'border-[var(--color-hairline)]'
        }`}
      />

      {error && (
        <p className="text-red-500 text-xs">Invalid recovery phrase. Please check your words and try again.</p>
      )}

      <button
        onClick={handleContinue}
        disabled={trimmed.split(/\s+/).length < 12}
        className="w-full h-12 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
