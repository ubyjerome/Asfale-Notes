import { entropyToMnemonic, validateMnemonic, mnemonicToSeed } from 'bip39';

export async function generateMnemonic(strength: number = 128): Promise<string> {
  const entropy = crypto.getRandomValues(new Uint8Array(strength / 8));
  const hex = Array.from(entropy).map((b) => b.toString(16).padStart(2, '0')).join('');
  return entropyToMnemonic(hex);
}

export { validateMnemonic };

export async function deriveKeyFromMnemonic(mnemonic: string): Promise<CryptoKey> {
  const seed = await mnemonicToSeed(mnemonic);
  const keyMaterial = seed.slice(0, 32);
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  );
  return key;
}

export async function exportCryptoKey(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key);
}

export async function deriveAccountId(mnemonic: string): Promise<string> {
  const encoded = new TextEncoder().encode(mnemonic.normalize('NFKD'));
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function importCryptoKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  );
}
