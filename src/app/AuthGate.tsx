import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { prefsRepo } from '../db/prefsRepo';
import { notesRepo } from '../db/notesRepo';
import { importCryptoKey, deriveKeyFromMnemonic, exportCryptoKey } from '../crypto/keygen';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const navigate = useNavigate();
  const { isAuthenticated, setCryptoKey, setIsAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [showMnemonicEntry, setShowMnemonicEntry] = useState(false);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    async function check() {
      if (isAuthenticated) {
        setChecking(false);
        return;
      }

      try {
        const jwk = await prefsRepo.get<JsonWebKey>('cryptoKeyJwk');
        if (jwk) {
          const key = await importCryptoKey(jwk);
          const storedMnemonic = await prefsRepo.get<string>('mnemonic');
          if (!storedMnemonic) {
            setChecking(false);
            setShowMnemonicEntry(true);
            return;
          }
          setCryptoKey(key);
          setIsAuthenticated(true);
          setChecking(false);
          return;
        }
      } catch {
        console.warn('Failed to restore crypto key, requiring mnemonic');
      }

      const allNotes = await notesRepo.getAll();
      if (allNotes.length === 0) {
        navigate('/onboarding');
        return;
      }

      setChecking(false);
      setShowMnemonicEntry(true);
    }
    check();
  }, [isAuthenticated, setCryptoKey, setIsAuthenticated, navigate]);

  const handleUnlock = async () => {
    try {
      const phrase = mnemonicInput.trim().toLowerCase();
      const key = await deriveKeyFromMnemonic(phrase);
      const jwk = await exportCryptoKey(key);
      await prefsRepo.set('cryptoKeyJwk', jwk);
      await prefsRepo.set('mnemonic', phrase);
      setCryptoKey(key);
      setIsAuthenticated(true);
      setShowMnemonicEntry(false);
    } catch {
      setError(true);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showMnemonicEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-xl font-medium text-[var(--color-ink)] mb-2">Welcome Back</h1>
            <p className="text-sm text-[var(--color-body)]">
              Enter your recovery phrase to unlock your notes.
            </p>
          </div>
          <textarea
            value={mnemonicInput}
            onChange={(e) => {
              setMnemonicInput(e.target.value);
              setError(false);
            }}
            placeholder="Enter your recovery phrase..."
            rows={3}
            className={`w-full p-4 text-sm bg-[var(--color-canvas)] border rounded-radius-lg resize-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)] ${
              error ? 'border-red-500' : 'border-[var(--color-hairline)]'
            }`}
          />
          {error && <p className="text-red-500 text-xs">Invalid phrase. Try again.</p>}
          <button
            onClick={handleUnlock}
            disabled={mnemonicInput.trim().split(/\s+/).length < 12}
            className="w-full h-12 text-sm font-medium text-[var(--color-on-primary)] bg-[var(--color-primary)] rounded-radius-lg disabled:opacity-50"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
