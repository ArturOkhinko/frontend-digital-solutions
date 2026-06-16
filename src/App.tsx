import { useMemo, useState } from 'react';
import { ConfigProvider, Divider, message, Typography } from 'antd';
import { v7 as uuidv7 } from 'uuid';
import ItemPanel from './components/ItemPanel';
import { createItem } from './api/items';
import { ItemId } from './types';

const { Title } = Typography;

const TOTAL_ITEMS = 21;
const INITIAL_IDS: ItemId[] = Array.from({ length: TOTAL_ITEMS }, (_, index) => index);

function App() {
  const [allIds, setAllIds] = useState<ItemId[]>(INITIAL_IDS);
  const [selectedIds, setSelectedIds] = useState<ItemId[]>([]);

  const selectItem = (id: ItemId) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const deselectItem = (id: ItemId) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const persistAndAdd = async (id: ItemId) => {
    if (allIds.some((item) => item === id)) {
      return;
    }
    try {
      await createItem(id);
      setAllIds((prev) => (prev.some((item) => item === id) ? prev : [...prev, id]));
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
    void persistAndAdd(id);
  };

  const addGeneratedItem = () => {
    void persistAndAdd(uuidv7());
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
    () => allIds.filter((id) => !selectedIds.includes(id)),
    [allIds, selectedIds],
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
