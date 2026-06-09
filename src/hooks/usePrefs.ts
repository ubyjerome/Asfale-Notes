import { useEffect } from 'react';
import { usePrefsStore } from '../store/prefsStore';
import { prefsRepo } from '../db/prefsRepo';

export function usePrefs() {
  const store = usePrefsStore();

  useEffect(() => {
    async function load() {
      const theme = await prefsRepo.get<'light' | 'dark' | 'system'>('theme');
      const font = await prefsRepo.get<string>('font');
      const customColors = await prefsRepo.get<string[]>('customColors');
      const localPinHash = await prefsRepo.get<string | null>('localPinHash');
      store.hydrate({
        theme: theme ?? 'system',
        font: font ?? 'system',
        customColors: customColors ?? [],
        localPinHash: localPinHash ?? null,
      });
    }
    load();
  }, []);

  useEffect(() => {
    prefsRepo.set('theme', store.theme);
  }, [store.theme]);

  useEffect(() => {
    prefsRepo.set('font', store.font);
  }, [store.font]);

  useEffect(() => {
    prefsRepo.set('customColors', store.customColors);
  }, [store.customColors]);

  useEffect(() => {
    prefsRepo.set('localPinHash', store.localPinHash);
  }, [store.localPinHash]);

  return store;
}
