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

  const availableIds = useMemo(
    () => ALL_IDS.filter((id) => !selectedIds.includes(id)),
    [selectedIds],
  );

  return (
    <ConfigProvider>
      <main style={{ padding: 24 }}>
        <Title level={2}>Split screen</Title>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
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
          />
        </div>
      </main>
    </ConfigProvider>
  );
}

export default App;
