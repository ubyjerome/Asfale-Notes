import { useEffect, useRef, useState } from 'react';

interface ToastProps {
  message: string | null;
  onDone?: () => void;
  duration?: number;
}

export function Toast({ message, onDone, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (message) {
      clearTimeout(timerRef.current);
      setVisible(true);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, duration);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [message, duration, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-sm px-4 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm text-center rounded-radius-lg shadow-xl fade-in">
      {message}
    </div>
  );
}
