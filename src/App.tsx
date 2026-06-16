import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, ConfigProvider, Divider, message, Typography } from 'antd';
import { v7 as uuidv7 } from 'uuid';
import ItemPanel from './components/ItemPanel';
import { createItems, fetchItems } from './api/items';
import { fetchSelected } from './api/selected';
import { useInfiniteItems } from './hooks/useInfiniteItems';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { createBatcher, Batcher } from './batching/createBatcher';
import { flushModifications, ModifyOp } from './batching/modify';
import { ItemId } from './types';

const { Title } = Typography;
const SEARCH_DEBOUNCE_MS = 300;
const ADD_BATCH_MS = 10000;
const MODIFY_BATCH_MS = 1000;
const READ_INTERVAL_MS = 1000;

function App() {
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const [newId, setNewId] = useState('');
  const [pendingSelect, setPendingSelect] = useState<ItemId[]>([]);
  const [pendingDeselect, setPendingDeselect] = useState<ItemId[]>([]);

  const debouncedAvailableSearch = useDebouncedValue(availableSearch, SEARCH_DEBOUNCE_MS);
  const debouncedSelectedSearch = useDebouncedValue(selectedSearch, SEARCH_DEBOUNCE_MS);

  const available = useInfiniteItems(fetchItems, debouncedAvailableSearch);
  const selected = useInfiniteItems(fetchSelected, debouncedSelectedSearch);

  const availableApi = useRef(available);
  const selectedApi = useRef(selected);
  const pendingMoreAvailable = useRef(false);
  const pendingMoreSelected = useRef(false);
  const addBatcher = useRef<Batcher<ItemId>>();
  const modifyBatcher = useRef<Batcher<ModifyOp>>();

  useEffect(() => {
    availableApi.current = available;
    selectedApi.current = selected;
  });

  useEffect(() => {
    const add = createBatcher<ItemId>(ADD_BATCH_MS, (ids) => {
      createItems(Array.from(new Set(ids))).catch(() => message.error('Failed to add items'));
    });
    const modify = createBatcher<ModifyOp>(MODIFY_BATCH_MS, (ops) => {
      flushModifications(ops).catch(() => {
        setPendingSelect([]);
        setPendingDeselect([]);
        message.error('Failed to update selection');
      });
    });
    addBatcher.current = add;
    modifyBatcher.current = modify;

    const tick = (api: typeof availableApi, pending: typeof pendingMoreAvailable) => {
      if (pending.current) {
        pending.current = false;
        api.current.loadMore();
      } else {
        api.current.refresh();
      }
    };
    const readTimer = setInterval(() => {
      tick(availableApi, pendingMoreAvailable);
      tick(selectedApi, pendingMoreSelected);
    }, READ_INTERVAL_MS);

    const flushOnHide = () => {
      add.flushNow();
      modify.flushNow();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushOnHide();
      }
    };
    window.addEventListener('pagehide', flushOnHide);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      add.stop();
      modify.stop();
      clearInterval(readTimer);
      window.removeEventListener('pagehide', flushOnHide);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const selectItem = (id: ItemId) => {
    modifyBatcher.current?.push({ type: 'select', ids: [id] });
    setPendingDeselect((prev) => prev.filter((item) => item !== id));
    setPendingSelect((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const deselectItem = (id: ItemId) => {
    modifyBatcher.current?.push({ type: 'deselect', ids: [id] });
    setPendingSelect((prev) => prev.filter((item) => item !== id));
    setPendingDeselect((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  useEffect(() => {
    setPendingSelect((prev) => {
      const next = prev.filter((id) => !selected.ids.includes(id));
      return next.length === prev.length ? prev : next;
    });
  }, [selected.ids]);

  useEffect(() => {
    setPendingDeselect((prev) => {
      const next = prev.filter((id) => !available.ids.includes(id));
      return next.length === prev.length ? prev : next;
    });
  }, [available.ids]);

  const availableIds = useMemo(
    () => [
      ...available.ids.filter((id) => !pendingSelect.includes(id)),
      ...pendingDeselect.filter((id) => !available.ids.includes(id)),
    ],
    [available.ids, pendingSelect, pendingDeselect],
  );

  const selectedIds = useMemo(
    () => [
      ...selected.ids.filter((id) => !pendingDeselect.includes(id)),
      ...pendingSelect.filter((id) => !selected.ids.includes(id)),
    ],
    [selected.ids, pendingSelect, pendingDeselect],
  );

  const addItem = (rawId: string) => {
    const trimmed = rawId.trim();
    if (!trimmed) {
      return;
    }
    const asNumber = Number(trimmed);
    const id: ItemId = !Number.isNaN(asNumber) && String(asNumber) === trimmed ? asNumber : trimmed;
    addBatcher.current?.push(id);
    setNewId('');
  };

  const addGeneratedItem = () => {
    addBatcher.current?.push(uuidv7());
  };

  const reorder = (draggedId: ItemId, targetId: ItemId) => {
    const ordered = selectedIds.filter((id) => id !== draggedId);
    const targetIndex = ordered.indexOf(targetId);
    const afterId = targetIndex <= 0 ? null : ordered[targetIndex - 1];
    modifyBatcher.current?.push({ type: 'reorder', id: draggedId, afterId });
  };

  const hasError = available.error || selected.error;

  const retry = () => {
    available.reload();
    selected.reload();
  };

  return (
    <ConfigProvider>
      <main
        style={{
          padding: 24,
          height: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Title level={2}>Split screen</Title>
        {hasError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            message="Connection problem — data may be out of date."
            action={
              <Button size="small" onClick={retry} data-testid="error-retry">
                Retry
              </Button>
            }
            data-testid="error-banner"
          />
        )}
        <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, minHeight: 0 }}>
          <ItemPanel
            title="Available"
            ids={availableIds}
            testId="available-panel"
            itemTestIdPrefix="available-item"
            onItemClick={selectItem}
            searchValue={availableSearch}
            onSearchChange={setAvailableSearch}
            loading={available.loading}
            hasMore={available.hasMore}
            onReachEnd={() => {
              pendingMoreAvailable.current = true;
            }}
            onAddItem={addItem}
            onGenerateItem={addGeneratedItem}
            newId={newId}
            onNewIdChange={setNewId}
          />

          <Divider type="vertical" style={{ height: 'auto', margin: '0 16px' }} />

          <ItemPanel
            title="Selected"
            ids={selectedIds}
            testId="selected-panel"
            itemTestIdPrefix="selected-item"
            onItemClick={deselectItem}
            searchValue={selectedSearch}
            onSearchChange={setSelectedSearch}
            loading={selected.loading}
            hasMore={selected.hasMore}
            onReachEnd={() => {
              pendingMoreSelected.current = true;
            }}
            onReorder={reorder}
          />
        </div>
      </main>
    </ConfigProvider>
  );
}

export default App;
