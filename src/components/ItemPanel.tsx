import { useMemo, useState } from 'react';
import { Card, Input, List } from 'antd';

interface ItemPanelProps {
  title: string;
  ids: number[];
  onItemClick: (id: number) => void;
  testId: string;
  itemTestIdPrefix: string;
}

function ItemPanel({ title, ids, onItemClick, testId, itemTestIdPrefix }: ItemPanelProps) {
  const [filter, setFilter] = useState('');

  const visibleIds = useMemo(() => {
    const query = filter.trim();
    if (!query) {
      return ids;
    }
    return ids.filter((id) => String(id).includes(query));
  }, [ids, filter]);

  return (
    <Card title={title} style={{ flex: 1 }} data-testid={testId}>
      <Input
        allowClear
        placeholder="Filter by id"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        style={{ marginBottom: 12 }}
        data-testid={`${testId}-filter`}
      />
      <List
        dataSource={visibleIds}
        locale={{ emptyText: 'No items' }}
        renderItem={(id) => (
          <List.Item
            onClick={() => onItemClick(id)}
            style={{ cursor: 'pointer' }}
            data-testid={`${itemTestIdPrefix}-${id}`}
          >
            {`id: ${id}`}
          </List.Item>
        )}
      />
    </Card>
  );
}

export default ItemPanel;
