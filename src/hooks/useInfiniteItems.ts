import { useCallback, useEffect, useRef, useState } from 'react';
import { ItemsPage } from '../api/items';
import { ItemId } from '../types';

const PAGE_SIZE = 20;

export type ItemsFetcher = (lastId?: ItemId, search?: string) => Promise<ItemsPage>;

export interface InfiniteItems {
  ids: ItemId[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reload: () => void;
}

export const useInfiniteItems = (fetcher: ItemsFetcher, search: string): InfiniteItems => {
  const [ids, setIds] = useState<ItemId[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<ItemId | undefined>(undefined);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);

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

  useEffect(() => {
    cursorRef.current = undefined;
    hasMoreRef.current = true;
    load(true);
  }, [load]);

  return { ids, loading, hasMore, loadMore, reload };
};
