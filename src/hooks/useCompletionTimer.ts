import { useRef, useCallback, useState } from 'react';

export function useCompletionTimer(onComplete: (id: string) => void, delay = 2000) {
  const [completingSet, setCompletingSet] = useState<Set<string>>(new Set());
  const completingRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleToggle = useCallback((id: string) => {
    if (completingRef.current.has(id)) {
      const timer = timersRef.current.get(id);
      if (timer) clearTimeout(timer);
      timersRef.current.delete(id);
      completingRef.current.delete(id);
      setCompletingSet(new Set(completingRef.current));
      return;
    }
    completingRef.current.add(id);
    setCompletingSet(new Set(completingRef.current));
    timersRef.current.set(id, setTimeout(() => {
      timersRef.current.delete(id);
      completingRef.current.delete(id);
      setCompletingSet(new Set(completingRef.current));
      onCompleteRef.current(id);
    }, delay));
  }, [delay]);

  return { completingSet, handleToggle };
}
