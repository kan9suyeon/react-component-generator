import type { GeneratedComponent } from '../types';

export function readStorage<T>(key: string, fallback: T, revive?: (raw: unknown) => T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const parsed: unknown = JSON.parse(stored);
    return revive ? revive(parsed) : (parsed as T);
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 용량 초과나 저장소 차단 시에도 앱은 동작해야 한다.
  }
}

export function reviveComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (
      item === null ||
      typeof item !== 'object' ||
      typeof item.id !== 'string' ||
      typeof item.prompt !== 'string' ||
      typeof item.code !== 'string'
    ) {
      return [];
    }
    const createdAt = new Date(item.createdAt);
    if (Number.isNaN(createdAt.getTime())) return [];
    return [{ id: item.id, prompt: item.prompt, code: item.code, createdAt }];
  });
}

export function addToHistory(history: string[], prompt: string, max = 20): string[] {
  return [prompt, ...history.filter((p) => p !== prompt)].slice(0, max);
}
