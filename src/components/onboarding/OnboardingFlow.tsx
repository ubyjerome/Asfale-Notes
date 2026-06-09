import { useState } from 'react';

import { MnemonicDisplay } from './MnemonicDisplay';
import { MnemonicImport } from './MnemonicImport';
import { PinSetup } from './PinSetup';
import { useCrypto } from '../../hooks/useCrypto';
import { Toast } from '../ui/Toast';

type Step = 'welcome' | 'create' | 'import' | 'pin' | 'done';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [prevStep, setPrevStep] = useState<Step | null>(null);
  const [mnemonic, setMnemonic] = useState('');
  const [finalizing, setFinalizing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { createNewIdentity, importIdentity, finalizeIdentity, validateMnemonic } = useCrypto();

  const goTo = (s: Step) => {
    setPrevStep(step);
    setStep(s);
  };

  const handleCreate = async () => {
    try {
      const phrase = await createNewIdentity();
      setMnemonic(phrase);
      setStep('create');
      setError(null);
    } catch {
      setError('Failed to create identity. Make sure you are using a secure connection (HTTPS).');
    }
  };

  const handleImport = () => {
    goTo('import');
  };

  const handleImportConfirm = async (phrase: string) => {
    try {
      await importIdentity(phrase);
      setStep('pin');
    } catch {
      setToast('Invalid recovery phrase. Please check and try again.');
    }
  };

  const handleMnemonicConfirmed = () => {
    setStep('pin');
  };

  const handlePinConfirm = async (pin: string) => {
    if (finalizing) return;
    setFinalizing(true);
    try {
      await finalizeIdentity(pin);
      onComplete();
    } catch (e) {
      console.error('Failed to finalize identity with PIN', e);
      setToast('Could not save your identity. Make sure you are using a secure connection (HTTPS).');
    } finally {
      setFinalizing(false);
    }
  };

  const handleSkipPin = async () => {
    if (finalizing) return;
    setFinalizing(true);
    try {
      await finalizeIdentity();
      onComplete();
    } catch (e) {
      console.error('Failed to finalize identity', e);
      setToast('Could not save your identity. Make sure you are using a secure connection (HTTPS).');
    } finally {
      setFinalizing(false);
    }
  };

  const content = (() => {
    switch (step) {
      case 'welcome':
        return (
          <div className="flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm text-center space-y-8">
              <div className="flex justify-center">
                <img src="/icon/icon_black.png" alt="Asfale" className="w-12 h-12 dark:hidden" />
                <img src="/icon/icon_white.png" alt="Asfale" className="w-12 h-12 hidden dark:block" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-[var(--color-ink)] mb-2">
                  Asfale Notes
                </h1>
                <p className="text-sm text-[var(--color-body)]">
                  Your notes. Private. Always.
                </p>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="space-y-3">
                <button
                  onClick={handleCreate}
                  className="w-full h-12 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg"
                >
                  Create new account
                </button>
                <button
                  onClick={handleImport}
                  className="w-full h-12 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
                >
                  Import existing account
                </button>
              </div>
            </div>
          </div>
        );
      case 'create':
        return (
          <div className="flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md space-y-3">
              <MnemonicDisplay mnemonic={mnemonic} onConfirmed={handleMnemonicConfirmed} />
              <div className="px-6">
                <button
                  onClick={() => setStep('welcome')}
                  className="w-full h-12 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      case 'import':
        return (
          <div className="flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md space-y-3">
              <MnemonicImport onImport={handleImportConfirm} validate={validateMnemonic} />
              <div className="px-6">
                <button
                  onClick={() => setStep('welcome')}
                  className="w-full h-12 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      case 'pin':
        return (
          <div className="flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-sm space-y-3">
              <PinSetup onSkip={handleSkipPin} onConfirm={handlePinConfirm} finalizing={finalizing} />
              <div className="px-6">
                <button
                  onClick={() => setStep(prevStep ?? 'welcome')}
                  className="w-full h-12 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <>
      {content}
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
