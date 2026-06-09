import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePrefsStore } from '../store/prefsStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = usePrefsStore((s) => s.theme);
  const font = usePrefsStore((s) => s.font);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  useEffect(() => {
    function updateMeta() {
      const dark = document.documentElement.classList.contains('dark');
      const appleIcon = document.getElementById('apple-touch-icon') as HTMLLinkElement | null;
      if (appleIcon) {
        appleIcon.href = dark ? '/icon-192-white.png' : '/icon-192-black.png';
      }
      const themeColor = document.getElementById('theme-color-meta') as HTMLMetaElement | null;
      if (themeColor) {
        themeColor.content = dark ? '#1c1c1e' : '#ffffff';
      }
    }
    updateMeta();
    const observer = new MutationObserver(updateMeta);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fontMap: Record<string, string> = {
      'dm-sans': '"DM Sans", sans-serif',
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      mono: '"Courier New", Consolas, monospace',
      rounded: '"Nunito", "Segoe UI", sans-serif',
    };
    document.documentElement.style.setProperty(
      '--font-family',
      fontMap[font] ?? fontMap['dm-sans'],
    );
  }, [font]);

  return <>{children}</>;
}
