import { renderHook, act, waitFor } from '@testing-library/react';
import { useInfiniteItems } from './useInfiniteItems';

const page = (ids: number[], lastId: number | null) =>
  ({
    ok: true,
    json: async () => ({ items: ids.map((id) => ({ id })), lastId }),
  }) as unknown as Response;

const range = (from: number, count: number) =>
  Array.from({ length: count }, (_, index) => from + index);

describe('useInfiniteItems', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads the first page on mount', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(page(range(1, 20), 20));

    const { result } = renderHook(() => useInfiniteItems());

    await waitFor(() => expect(result.current.ids).toHaveLength(20));
    expect(result.current.ids[0]).toBe(1);
  });

  it('appends the next page when loadMore is called', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(page(range(1, 20), 20))
      .mockResolvedValueOnce(page([21, 22], 22));

    const { result } = renderHook(() => useInfiniteItems());
    await waitFor(() => expect(result.current.ids).toHaveLength(20));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.ids).toHaveLength(22));
    expect(result.current.hasMore).toBe(false);
  });

  it('inserts an added id at its sorted position', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(page([1, 3, 5], null));

    const { result } = renderHook(() => useInfiniteItems());
    await waitFor(() => expect(result.current.ids).toHaveLength(3));

    act(() => {
      result.current.addId(4);
    });

    expect(result.current.ids).toEqual([1, 3, 4, 5]);
  });
});
