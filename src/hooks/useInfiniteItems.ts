import { useCallback, useEffect, useRef, useState } from 'react';
import { ItemsPage } from '../api/items';
import { ItemId } from '../types';

const PAGE_SIZE = 20;
const MAX_REFRESH = 1000;

export type ItemsFetcher = (
  lastId?: ItemId,
  search?: string,
  limit?: number,
) => Promise<ItemsPage>;

export interface InfiniteItems {
  ids: ItemId[];
  loading: boolean;
  hasMore: boolean;
  error: boolean;
  loadMore: () => void;
  reload: () => void;
  refresh: () => void;
}

export const useInfiniteItems = (fetcher: ItemsFetcher, search: string): InfiniteItems => {
  const [ids, setIds] = useState<ItemId[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const cursorRef = useRef<ItemId | undefined>(undefined);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);
  const loadedCountRef = useRef(0);

  useEffect(() => {
    loadedCountRef.current = ids.length;
  }, [ids]);

  const load = useCallback(
    (reset: boolean) => {
      if (!reset && (loadingRef.current || !hasMoreRef.current)) {
        return;
      }
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      loadingRef.current = true;
      setLoading(true);

      const cursor = reset ? undefined : cursorRef.current;
      fetcher(cursor, search || undefined)
        .then((page) => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          cursorRef.current = page.lastId ?? cursorRef.current;
          const more = page.ids.length === PAGE_SIZE && page.lastId !== null;
          hasMoreRef.current = more;
          setHasMore(more);
          setError(false);
          setIds((prev) => {
            const base = reset ? [] : prev;
            const known = new Set(base);
            return [...base, ...page.ids.filter((id) => !known.has(id))];
          });
        })
        .catch(() => {
          if (requestId === requestIdRef.current) {
            hasMoreRef.current = false;
            setHasMore(false);
            setError(true);
          }
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            loadingRef.current = false;
            setLoading(false);
          }
        });
    },
    [fetcher, search],
  );

  const loadMore = useCallback(() => load(false), [load]);

  const reload = useCallback(() => {
    cursorRef.current = undefined;
    hasMoreRef.current = true;
    load(true);
  }, [load]);

  const refresh = useCallback(() => {
    if (loadingRef.current) {
      return;
    }
    const limit = Math.min(Math.max(loadedCountRef.current, PAGE_SIZE), MAX_REFRESH);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    fetcher(undefined, search || undefined, limit)
      .then((page) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        cursorRef.current = page.lastId ?? undefined;
        const more = page.ids.length === limit && page.lastId !== null;
        hasMoreRef.current = more;
        setHasMore(more);
        setError(false);
        setIds(page.ids);
      })
      .catch(() => setError(true));
  }, [fetcher, search]);

  useEffect(() => {
    cursorRef.current = undefined;
    hasMoreRef.current = true;
    load(true);
  }, [load]);

  return { ids, loading, hasMore, error, loadMore, reload, refresh };
};
