import { useState } from 'react';
import { ConfigProvider, Divider, message, Typography } from 'antd';
import { v7 as uuidv7 } from 'uuid';
import ItemPanel from './components/ItemPanel';
import { createItem, fetchItems } from './api/items';
import { deselectItems, fetchSelected, reorderSelected, selectItems } from './api/selected';
import { useInfiniteItems } from './hooks/useInfiniteItems';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { ItemId } from './types';

const { Title } = Typography;
const SEARCH_DEBOUNCE_MS = 300;

function App() {
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const [checkedAvailable, setCheckedAvailable] = useState<ItemId[]>([]);
  const [checkedSelected, setCheckedSelected] = useState<ItemId[]>([]);
  const [newId, setNewId] = useState('');

  const debouncedAvailableSearch = useDebouncedValue(availableSearch, SEARCH_DEBOUNCE_MS);
  const debouncedSelectedSearch = useDebouncedValue(selectedSearch, SEARCH_DEBOUNCE_MS);

  const available = useInfiniteItems(fetchItems, debouncedAvailableSearch);
  const selected = useInfiniteItems(fetchSelected, debouncedSelectedSearch);

  const toggle = (setChecked: typeof setCheckedAvailable) => (id: ItemId) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const reloadBoth = () => {
    available.reload();
    selected.reload();
  };

  const addToSelection = async () => {
    if (checkedAvailable.length === 0) {
      return;
    }
    try {
      await selectItems(checkedAvailable);
      setCheckedAvailable([]);
      reloadBoth();
    } catch {
      message.error('Failed to select items');
    }
  };

  const removeFromSelection = async () => {
    if (checkedSelected.length === 0) {
      return;
    }
    try {
      await deselectItems(checkedSelected);
      setCheckedSelected([]);
      reloadBoth();
    } catch {
      message.error('Failed to remove items');
    }
  };

  const persistAndAdd = async (id: ItemId) => {
    try {
      await createItem(id);
      setNewId('');
      available.reload();
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

  const reorder = async (draggedId: ItemId, targetId: ItemId) => {
    const ordered = selected.ids.filter((id) => id !== draggedId);
    const targetIndex = ordered.indexOf(targetId);
    const afterId = targetIndex <= 0 ? null : ordered[targetIndex - 1];
    try {
      await reorderSelected(draggedId, afterId);
      selected.reload();
    } catch {
      message.error('Failed to reorder');
    }
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
        <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, minHeight: 0 }}>
          <ItemPanel
            title="Available"
            ids={available.ids}
            testId="available-panel"
            itemTestIdPrefix="available-item"
            checkedIds={checkedAvailable}
            onToggleCheck={toggle(setCheckedAvailable)}
            searchValue={availableSearch}
            onSearchChange={setAvailableSearch}
            loading={available.loading}
            onReachEnd={available.loadMore}
            actionLabel="Add to selected"
            onAction={addToSelection}
            onAddItem={addItem}
            onGenerateItem={addGeneratedItem}
            newId={newId}
            onNewIdChange={setNewId}
          />

          <Divider type="vertical" style={{ height: 'auto', margin: '0 16px' }} />

          <ItemPanel
            title="Selected"
            ids={selected.ids}
            testId="selected-panel"
            itemTestIdPrefix="selected-item"
            checkedIds={checkedSelected}
            onToggleCheck={toggle(setCheckedSelected)}
            searchValue={selectedSearch}
            onSearchChange={setSelectedSearch}
            loading={selected.loading}
            onReachEnd={selected.loadMore}
            actionLabel="Remove"
            onAction={removeFromSelection}
            onReorder={reorder}
          />
        </div>
      </main>
    </ConfigProvider>
  );
}

export default App;
