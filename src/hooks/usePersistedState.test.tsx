import { renderHook, act } from '@testing-library/react';
import { usePersistedState } from './usePersistedState';

const KEY = 'test.key';

describe('usePersistedState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses the initial value when storage is empty', () => {
    const { result } = renderHook(() => usePersistedState<number[]>(KEY, [1, 2]));
    expect(result.current[0]).toEqual([1, 2]);
  });

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => usePersistedState<number[]>(KEY, []));

    act(() => {
      result.current[1]([3, 1, 2]);
    });

    expect(JSON.parse(window.localStorage.getItem(KEY) as string)).toEqual([3, 1, 2]);
  });

  it('restores the persisted value on a fresh mount', () => {
    window.localStorage.setItem(KEY, JSON.stringify(['a', 'b']));
    const { result } = renderHook(() => usePersistedState<string[]>(KEY, []));
    expect(result.current[0]).toEqual(['a', 'b']);
  });
});
