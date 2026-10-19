import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ envKeys: { anthropic: false, google: false }, code: 'render(<p/>)' }),
    }),
  );
});

describe('App 상태 영속성', () => {
  it('저장된 Provider를 복원한다', () => {
    localStorage.setItem('rcg:provider', JSON.stringify('anthropic'));
    render(<App />);
    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
  });

  it('저장된 API 키를 Provider별로 복원한다', () => {
    localStorage.setItem('rcg:provider', JSON.stringify('anthropic'));
    localStorage.setItem('rcg:apiKeys', JSON.stringify({ anthropic: 'sk-ant-1', google: 'AIza-2' }));
    render(<App />);
    expect(screen.getByLabelText('API Key')).toHaveValue('sk-ant-1');
  });

  it('API 키를 입력하면 현재 Provider 키로 저장한다', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('API Key'), 'AIza-xyz');
    expect(JSON.parse(localStorage.getItem('rcg:apiKeys')!)).toEqual({ google: 'AIza-xyz' });
  });

  it('Provider를 바꾸면 선택을 저장한다', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');
    expect(JSON.parse(localStorage.getItem('rcg:provider')!)).toBe('anthropic');
  });

  it('생성한 프롬프트를 히스토리에 저장한다', async () => {
    const user = userEvent.setup();
    localStorage.setItem('rcg:apiKeys', JSON.stringify({ google: 'AIza-1' }));
    render(<App />);
    await user.type(screen.getByRole('textbox', { name: '' }), '카드');
    await user.click(screen.getByRole('button', { name: '컴포넌트 생성' }));
    await screen.findByText('카드', { selector: '.card-prompt' });
    expect(JSON.parse(localStorage.getItem('rcg:promptHistory')!)).toEqual(['카드']);
  });
});
