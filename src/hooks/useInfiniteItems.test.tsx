import { renderHook, act, waitFor } from '@testing-library/react';
import { useInfiniteItems } from './useInfiniteItems';
import { ItemsPage } from '../api/items';

const range = (from: number, count: number) =>
  Array.from({ length: count }, (_, index) => from + index);

const pageOf = (ids: number[], lastId: number | null): ItemsPage => ({ ids, lastId });

describe('useInfiniteItems', () => {
  it('loads the first page on mount', async () => {
    const fetcher = jest.fn().mockResolvedValueOnce(pageOf(range(1, 20), 20));

    const { result } = renderHook(() => useInfiniteItems(fetcher, ''));

    await waitFor(() => expect(result.current.ids).toHaveLength(20));
    expect(result.current.ids[0]).toBe(1);
  });

  it('appends the next page when loadMore is called', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(pageOf(range(1, 20), 20))
      .mockResolvedValueOnce(pageOf([21, 22], 22));

    const { result } = renderHook(() => useInfiniteItems(fetcher, ''));
    await waitFor(() => expect(result.current.ids).toHaveLength(20));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.ids).toHaveLength(22));
    expect(result.current.hasMore).toBe(false);
  });

  it('resets and reloads when the search term changes', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(pageOf(range(1, 20), 20))
      .mockResolvedValueOnce(pageOf([12, 123], 123));

    const { result, rerender } = renderHook(({ search }) => useInfiniteItems(fetcher, search), {
      initialProps: { search: '' },
    });
    await waitFor(() => expect(result.current.ids).toHaveLength(20));

    rerender({ search: '12' });

    await waitFor(() => expect(result.current.ids).toEqual([12, 123]));
    expect(fetcher).toHaveBeenLastCalledWith(undefined, '12');
  });
});
