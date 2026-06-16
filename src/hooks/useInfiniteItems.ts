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

export const useInfiniteItems = (): InfiniteItems => {
  const [ids, setIds] = useState<ItemId[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<ItemId | undefined>(undefined);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);

    fetchItems(cursorRef.current)
      .then((page) => {
        cursorRef.current = page.lastId ?? cursorRef.current;
        const more = page.ids.length === PAGE_SIZE && page.lastId !== null;
        hasMoreRef.current = more;
        setHasMore(more);
        setIds((prev) => {
          const known = new Set(prev);
          return [...prev, ...page.ids.filter((id) => !known.has(id))];
        });
      })
      .catch(() => {
        hasMoreRef.current = false;
        setHasMore(false);
      })
      .finally(() => {
        loadingRef.current = false;
        setLoading(false);
      });
  }, []);

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
    loadMore();
  }, [loadMore]);

  return { ids, loading, hasMore, loadMore, addId };
};
