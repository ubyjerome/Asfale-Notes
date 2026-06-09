import { GoAlert, GoX } from 'react-icons/go';
import { useState } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  requireTyping?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  requireTyping,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');

  if (!open) return null;

  const canConfirm = requireTyping ? typed === requireTyping : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm bg-[var(--color-canvas)] rounded-radius-lg p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {destructive && <GoAlert className="w-5 h-5 text-red-500" />}
            <h3 className="text-lg font-medium text-[var(--color-ink)]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-soft)]"
          >
            <GoX className="w-5 h-5 text-[var(--color-muted)]" />
          </button>
        </div>
        <p className="text-sm text-[var(--color-body)] mb-4">{message}</p>
        {requireTyping && (
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={`Type "${requireTyping}" to confirm`}
            className="w-full h-11 px-3 text-sm bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-sm mb-4"
            autoFocus
          />
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="h-11 px-4 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className={`h-11 px-4 text-sm font-medium text-[var(--color-on-primary)] rounded-radius-lg ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--color-primary)]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
