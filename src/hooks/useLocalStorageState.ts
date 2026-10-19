import { useState, useEffect, useRef } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

export function useLocalStorageState<T>(key: string, initial: T, revive?: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, revive));
  const skipNextWrite = useRef(true);
  const reviveRef = useRef(revive);

  useEffect(() => {
    reviveRef.current = revive;
  });

  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    writeStorage(key, value);
  }, [key, value]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        const parsed: unknown = JSON.parse(e.newValue);
        setValue(reviveRef.current ? reviveRef.current(parsed) : (parsed as T));
      } catch {
        // 손상된 값은 무시한다.
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue] as const;
}
