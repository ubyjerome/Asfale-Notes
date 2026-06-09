import { useState } from 'react';
import { GoCopy, GoCheck } from 'react-icons/go';

interface MnemonicDisplayProps {
  mnemonic: string;
  onConfirmed: () => void;
}

export function MnemonicDisplay({ mnemonic, onConfirmed }: MnemonicDisplayProps) {
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);
  const words = mnemonic.split(' ');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = mnemonic;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-medium text-[var(--color-ink)] mb-2">Your Recovery Phrase</h2>
        <p className="text-sm text-[var(--color-body)]">
          Write these words down and keep them safe. If you lose them, your notes cannot be recovered. We cannot help you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 rounded-radius-lg border border-[var(--color-hairline)] bg-[var(--color-surface-soft)]">
        {words.map((word, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-[10px] text-[var(--color-muted)] w-5 text-right">{i + 1}.</span>
            <span className="font-mono text-[var(--color-ink)]">{word}</span>
          </div>
        ))}
      </div>

      <button
        onClick={copyToClipboard}
        className="flex items-center gap-2 text-sm text-[var(--color-link)]"
      >
        {copied ? <GoCheck className="w-4 h-4" /> : <GoCopy className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy phrase'}
      </button>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 w-4 h-4"
        />
        <span className="text-sm text-[var(--color-body)]">
          I have saved my recovery phrase
        </span>
      </label>

      <button
        onClick={onConfirmed}
        disabled={!checked}
        className="w-full h-12 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
