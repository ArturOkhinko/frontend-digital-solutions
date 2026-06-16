import { Card, List } from 'antd';

interface ItemPanelProps {
  title: string;
  ids: number[];
  onItemClick: (id: number) => void;
  testId: string;
  itemTestIdPrefix: string;
}

function ItemPanel({ title, ids, onItemClick, testId, itemTestIdPrefix }: ItemPanelProps) {
  return (
    <Card title={title} style={{ flex: 1 }} data-testid={testId}>
      <List
        dataSource={ids}
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
