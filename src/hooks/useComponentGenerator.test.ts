import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';

const KEY = 'rcg:components';
const saved = [
  { id: '1', prompt: '카드', code: 'render(<div/>)', createdAt: '2026-01-02T03:04:05.000Z' },
];

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useComponentGenerator 영속성', () => {
  it('저장된 컴포넌트 목록을 마운트 시 복원한다', () => {
    localStorage.setItem(KEY, JSON.stringify(saved));
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('생성에 성공하면 목록을 localStorage에 저장한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<p/>)' }) }),
    );
    const { result } = renderHook(() => useComponentGenerator());
    await act(() => result.current.generate('새 프롬프트', undefined, 'google'));
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].prompt).toBe('새 프롬프트');
  });

  it('전체 삭제하면 저장된 목록도 비운다', () => {
    localStorage.setItem(KEY, JSON.stringify(saved));
    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.clearAll());
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([]);
  });
});
