import { useMemo, useState } from 'react';
import { ConfigProvider, Divider, Typography } from 'antd';
import ItemPanel from './components/ItemPanel';

const { Title } = Typography;

const TOTAL_ITEMS = 21; // ids from 0 to 20 inclusive
const ALL_IDS = Array.from({ length: TOTAL_ITEMS }, (_, index) => index);

function App() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const deselectItem = (id: number) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  // Reorder by anchoring to the target id in the full list,
  // so it stays correct even when the panel is filtered.
  const reorderSelected = (draggedId: number, targetId: number) => {
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
      // Moving down: drop after the target. Moving up: drop before it.
      const insertIndex = fromIndex < toIndex ? targetIndex + 1 : targetIndex;

      next.splice(insertIndex, 0, draggedId);
      return next;
    });
  };

  const availableIds = useMemo(
    () => ALL_IDS.filter((id) => !selectedIds.includes(id)),
    [selectedIds],
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
