import { useMemo, useState } from 'react';
import { ConfigProvider, Divider, message, Typography } from 'antd';
import { v7 as uuidv7 } from 'uuid';
import ItemPanel from './components/ItemPanel';
import { createItem } from './api/items';
import { useInfiniteItems } from './hooks/useInfiniteItems';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { usePersistedState } from './hooks/usePersistedState';
import { ItemId } from './types';

const { Title } = Typography;
const SEARCH_DEBOUNCE_MS = 300;
const SELECTED_STORAGE_KEY = 'split-screen.selected';

function App() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { ids: loadedIds, loading, loadMore, addId } = useInfiniteItems(debouncedSearch);
  const [selectedIds, setSelectedIds] = usePersistedState<ItemId[]>(SELECTED_STORAGE_KEY, []);

  const selectItem = (id: ItemId) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const deselectItem = (id: ItemId) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const persistAndAdd = async (id: ItemId) => {
    try {
      await createItem(id);
      addId(id);
    } catch {
      message.error(`Failed to add item "${String(id)}"`);
    }
  };

  const addItem = (rawId: string) => {
    const trimmed = rawId.trim();
    if (!trimmed) {
      return;
    }
    const asNumber = Number(trimmed);
    const id: ItemId = !Number.isNaN(asNumber) && String(asNumber) === trimmed ? asNumber : trimmed;
    persistAndAdd(id);
  };

  const addGeneratedItem = () => {
    persistAndAdd(uuidv7());
  };

  const reorderSelected = (draggedId: ItemId, targetId: ItemId) => {
    setSelectedIds((prev) => {
      if (draggedId === targetId) {
        return prev;
      }
      const fromIndex = prev.indexOf(draggedId);
      const toIndex = prev.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }

      const next = prev.filter((id) => id !== draggedId);
      const targetIndex = next.indexOf(targetId);
      const insertIndex = fromIndex < toIndex ? targetIndex + 1 : targetIndex;

      next.splice(insertIndex, 0, draggedId);
      return next;
    });
  };

  const availableIds = useMemo(
    () => loadedIds.filter((id) => !selectedIds.includes(id)),
    [loadedIds, selectedIds],
  );

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
        <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, minHeight: 0 }}>
          <ItemPanel
            title="Available"
            ids={availableIds}
            onItemClick={selectItem}
            testId="available-panel"
            itemTestIdPrefix="available-item"
            onAddItem={addItem}
            onGenerateItem={addGeneratedItem}
            onReachEnd={loadMore}
            loading={loading}
            searchValue={search}
            onSearchChange={setSearch}
          />

          <Divider type="vertical" style={{ height: 'auto', margin: '0 16px' }} />

          <ItemPanel
            title="Selected"
            ids={selectedIds}
            onItemClick={deselectItem}
            testId="selected-panel"
            itemTestIdPrefix="selected-item"
            onReorder={reorderSelected}
          />
        </div>
      </main>
    </ConfigProvider>
  );
}

export default App;
