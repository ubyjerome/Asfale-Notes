import { useState } from 'react';
import { GoEye, GoKey, GoAlert, GoCopy, GoCheck, GoX, GoSignOut } from 'react-icons/go';
import { PinEntryModal } from '../ui/PinEntryModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { usePrefsStore } from '../../store/prefsStore';
import { prefsRepo } from '../../db/prefsRepo';

interface PrivacySettingsProps {
  onClearAllData: () => void;
  onLogout: () => void;
}

export function PrivacySettings({ onClearAllData, onLogout }: PrivacySettingsProps) {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [copied, setCopied] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'new' | 'confirm'>('new');

  const localPinHash = usePrefsStore((s) => s.localPinHash);
  const setLocalPinHash = usePrefsStore((s) => s.setLocalPinHash);

  const handleViewMnemonic = () => {
    if (localPinHash) {
      setShowPinModal(true);
    } else {
      revealMnemonic();
    }
  };

  const revealMnemonic = async () => {
    const storedMnemonic = await prefsRepo.get<string>('mnemonic');
    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
      setShowMnemonic(true);
    }
  };

  const handlePinVerify = (pin: string) => {
    if (btoa(pin) === localPinHash) {
      revealMnemonic();
      setShowPinModal(false);
      return true;
    }
    return false;
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinStep === 'new') {
      if (newPin.length === 6) {
        setPinStep('confirm');
      }
    } else {
      if (newPin === confirmPin) {
        const hash = btoa(newPin);
        await prefsRepo.set('localPinHash', hash);
        setLocalPinHash(hash);
        setShowSetPin(false);
        setPinStep('new');
        setNewPin('');
        setConfirmPin('');
      }
    }
  };

  const copyMnemonic = async () => {
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
    <div className="p-4 space-y-4">
      <button
        onClick={handleViewMnemonic}
        className="w-full flex items-center justify-between px-4 py-3 rounded-radius-lg hover:bg-[var(--color-surface-soft)]"
      >
        <div className="flex items-center gap-3">
          <GoEye className="w-5 h-5 text-[var(--color-muted)]" />
          <span className="text-sm text-[var(--color-body)]">View Recovery Phrase</span>
        </div>
      </button>

      <button
        onClick={() => setShowSetPin(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-radius-lg hover:bg-[var(--color-surface-soft)]"
      >
        <div className="flex items-center gap-3">
          <GoKey className="w-5 h-5 text-[var(--color-muted)]" />
          <span className="text-sm text-[var(--color-body)]">{localPinHash ? 'Change PIN' : 'Set PIN'}</span>
        </div>
      </button>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-radius-lg hover:bg-[var(--color-surface-soft)]"
      >
        <div className="flex items-center gap-3">
          <GoSignOut className="w-5 h-5 text-[var(--color-muted)]" />
          <span className="text-sm text-[var(--color-body)]">Logout</span>
        </div>
      </button>

      <button
        onClick={() => setShowClearConfirm(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-radius-lg hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <div className="flex items-center gap-3">
          <GoAlert className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-500">Clear All Data</span>
        </div>
      </button>

      {showMnemonic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-[var(--color-canvas)] rounded-radius-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[var(--color-ink)]">Recovery Phrase</h3>
              <button onClick={() => setShowMnemonic(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-soft)]">
                <GoX className="w-5 h-5 text-[var(--color-muted)]" />
              </button>
            </div>
            <p className="text-sm text-[var(--color-body)] mb-4">
              This is your recovery phrase. <span className="text-red-500 font-medium">Never share it with anyone.</span> Anyone with this phrase has full access to your account.
            </p>
            <div className="p-4 rounded-radius-lg bg-[var(--color-surface-soft)] mb-4">
              <p className="text-sm font-mono text-[var(--color-ink)] leading-relaxed break-all select-all">{mnemonic}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyMnemonic}
                className="flex items-center justify-center gap-2 flex-1 h-11 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg"
              >
                {copied ? <GoCheck className="w-4 h-4" /> : <GoCopy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy to clipboard'}
              </button>
              <button
                onClick={() => setShowMnemonic(false)}
                className="h-11 px-4 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <PinEntryModal
        open={showPinModal}
        onVerify={handlePinVerify}
        onClose={() => setShowPinModal(false)}
      />

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear All Data"
        message="This will permanently delete all notes and reset the app — on this device and in the cloud sync. This action cannot be undone."
        confirmLabel="DELETE"
        destructive
        requireTyping="DELETE"
        onConfirm={() => {
          onClearAllData();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout"
        message="This will clear all local data on this device. Your notes will remain in the cloud and can be restored by importing your recovery phrase on another device. Cloud data is retained for 20 days."
        confirmLabel="Logout"
        onConfirm={() => {
          onLogout();
          setShowLogoutConfirm(false);
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {showSetPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs bg-[var(--color-canvas)] rounded-radius-lg p-6 shadow-xl">
            <form onSubmit={handleSetPin}>
              <h3 className="text-lg font-medium text-[var(--color-ink)] mb-4">
                {pinStep === 'new' ? 'Set PIN' : 'Confirm PIN'}
              </h3>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinStep === 'new' ? newPin : confirmPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  if (pinStep === 'new') setNewPin(val);
                  else setConfirmPin(val);
                }}
                className="w-full h-12 text-center text-2xl tracking-widest bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-sm"
                autoFocus
                placeholder="------"
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => { setShowSetPin(false); setPinStep('new'); setNewPin(''); setConfirmPin(''); }}
                  className="flex-1 h-11 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pinStep === 'new' ? newPin.length < 6 : confirmPin.length < 6 || newPin !== confirmPin}
                  className="flex-1 h-11 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
                >
                  {pinStep === 'new' ? 'Next' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
