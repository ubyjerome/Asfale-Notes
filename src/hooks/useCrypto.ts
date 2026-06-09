import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePrefsStore } from '../store/prefsStore';
import { generateMnemonic, validateMnemonic, deriveKeyFromMnemonic, exportCryptoKey, deriveAccountId } from '../crypto/keygen';
import { prefsRepo } from '../db/prefsRepo';

export function useCrypto() {
  const { setMnemonic, setCryptoKey, setAccountId, setIsAuthenticated } = useAuthStore();

  const createNewIdentity = useCallback(async () => {
    const mnemonic = await generateMnemonic();
    setMnemonic(mnemonic);
    return mnemonic;
  }, [setMnemonic]);

  const importIdentity = useCallback(
    async (mnemonic: string) => {
      if (!validateMnemonic(mnemonic)) {
        throw new Error('Invalid recovery phrase');
      }
      setMnemonic(mnemonic);
    },
    [setMnemonic],
  );

  const finalizeIdentity = useCallback(
    async (pin?: string) => {
      const { mnemonic } = useAuthStore.getState();
      if (!mnemonic) throw new Error('No mnemonic in store');
      if (pin) {
        const hash = btoa(pin);
        await prefsRepo.set('localPinHash', hash);
        usePrefsStore.getState().setLocalPinHash(hash);
      }
      await prefsRepo.set('mnemonic', mnemonic);
      const key = await deriveKeyFromMnemonic(mnemonic);
      const jwk = await exportCryptoKey(key);
      await prefsRepo.set('cryptoKeyJwk', jwk);
      setMnemonic(null);
      const accId = await deriveAccountId(mnemonic);
      setAccountId(accId);
      setCryptoKey(key);
      setIsAuthenticated(true);
    },
    [setMnemonic, setCryptoKey, setIsAuthenticated],
  );

  return { createNewIdentity, importIdentity, finalizeIdentity, validateMnemonic };
}
