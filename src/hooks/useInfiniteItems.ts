import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchItems } from '../api/items';
import { compareIds } from '../utils/compareIds';
import { ItemId } from '../types';

const PAGE_SIZE = 20;

export interface InfiniteItems {
  ids: ItemId[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  addId: (id: ItemId) => void;
}

export const useInfiniteItems = (search: string): InfiniteItems => {
  const [ids, setIds] = useState<ItemId[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<ItemId | undefined>(undefined);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const searchRef = useRef(search);
  const requestIdRef = useRef(0);

  const load = useCallback((reset: boolean) => {
    if (!reset && (loadingRef.current || !hasMoreRef.current)) {
      return;
    }
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    loadingRef.current = true;
    setLoading(true);

    const cursor = reset ? undefined : cursorRef.current;
    fetchItems(cursor, searchRef.current || undefined)
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
        if (requestId !== requestIdRef.current) {
          return;
        }
        hasMoreRef.current = false;
        setHasMore(false);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false;
          setLoading(false);
        }
      });
  }, []);

  const loadMore = useCallback(() => load(false), [load]);

  const addId = useCallback((id: ItemId) => {
    setIds((prev) => {
      if (prev.includes(id)) {
        return prev;
      }
      const next = [...prev];
      const index = next.findIndex((existing) => compareIds(existing, id) > 0);
      if (index === -1) {
        next.push(id);
      } else {
        next.splice(index, 0, id);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    searchRef.current = search;
    cursorRef.current = undefined;
    hasMoreRef.current = true;
    load(true);
  }, [search, load]);

  return { ids, loading, hasMore, loadMore, addId };
};
