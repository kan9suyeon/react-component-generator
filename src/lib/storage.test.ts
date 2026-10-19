import { describe, it, expect, beforeEach } from 'vitest';
import { readStorage, writeStorage, reviveComponents, addToHistory } from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('readStorage / writeStorage', () => {
  it('저장한 값을 다시 읽는다', () => {
    writeStorage('k', { a: 1 });
    expect(readStorage('k', { a: 0 })).toEqual({ a: 1 });
  });

  it('값이 없으면 fallback을 반환한다', () => {
    expect(readStorage('missing', 'fallback')).toBe('fallback');
  });

  it('JSON이 깨져 있으면 fallback을 반환한다', () => {
    localStorage.setItem('k', '{broken');
    expect(readStorage('k', 'fallback')).toBe('fallback');
  });

  it('revive 함수가 있으면 파싱 결과를 변환한다', () => {
    writeStorage('k', 5);
    expect(readStorage('k', 0, (raw) => Number(raw) * 2)).toBe(10);
  });
});

describe('reviveComponents', () => {
  it('createdAt 문자열을 Date로 복원한다', () => {
    const iso = '2026-01-02T03:04:05.000Z';
    const [c] = reviveComponents([{ id: '1', prompt: 'p', code: 'c', createdAt: iso }]);
    expect(c.createdAt).toBeInstanceOf(Date);
    expect(c.createdAt.toISOString()).toBe(iso);
  });

  it('배열이 아니면 빈 배열을 반환한다', () => {
    expect(reviveComponents({ foo: 1 })).toEqual([]);
  });

  it('필드가 잘못된 항목은 버린다', () => {
    const iso = '2026-01-02T03:04:05.000Z';
    const result = reviveComponents([
      { id: '1', prompt: 'p', code: 'c', createdAt: iso },
      { id: 2, prompt: 'p' },
      null,
    ]);
    expect(result).toHaveLength(1);
  });
});

describe('addToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('중복 프롬프트는 맨 앞으로 옮기고 하나만 남긴다', () => {
    expect(addToHistory(['a', 'b'], 'b')).toEqual(['b', 'a']);
  });

  it('최대 개수를 넘으면 오래된 것부터 버린다', () => {
    expect(addToHistory(['a', 'b'], 'c', 2)).toEqual(['c', 'a']);
  });
});
