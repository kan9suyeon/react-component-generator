import { useState, useEffect } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

export function useLocalStorageState<T>(key: string, initial: T, revive?: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, revive));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
