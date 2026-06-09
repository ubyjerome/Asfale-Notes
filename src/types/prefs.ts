export interface UserPrefs {
  theme: 'light' | 'dark' | 'system';
  font: string;
  customColors: string[];
  localPinHash?: string;
}
