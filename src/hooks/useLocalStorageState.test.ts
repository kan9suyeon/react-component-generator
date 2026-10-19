import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorageState } from './useLocalStorageState';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorageState', () => {
  it('저장된 값이 없으면 초기값을 사용한다', () => {
    const { result } = renderHook(() => useLocalStorageState('k', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 마운트 시 복원한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => useLocalStorageState('k', 'init'));
    expect(result.current[0]).toBe('saved');
  });

  it('값을 바꾸면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => useLocalStorageState('k', 'init'));
    act(() => result.current[1]('next'));
    expect(localStorage.getItem('k')).toBe(JSON.stringify('next'));
  });
});
