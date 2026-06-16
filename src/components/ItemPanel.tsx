import { useMemo, useRef, useState } from 'react';
import { Card, Input, List } from 'antd';

interface ItemPanelProps {
  title: string;
  ids: number[];
  onItemClick: (id: number) => void;
  testId: string;
  itemTestIdPrefix: string;
  onReorder?: (draggedId: number, targetId: number) => void;
}

function ItemPanel({
  title,
  ids,
  onItemClick,
  testId,
  itemTestIdPrefix,
  onReorder = undefined,
}: ItemPanelProps) {
  const [filter, setFilter] = useState('');
  const draggedIdRef = useRef<number | null>(null);

  const visibleIds = useMemo(() => {
    const query = filter.trim();
    if (!query) {
      return ids;
    }
    return ids.filter((id) => String(id).includes(query));
  }, [ids, filter]);

  const isDraggable = Boolean(onReorder);

  const handleDrop = (targetId: number) => {
    const draggedId = draggedIdRef.current;
    draggedIdRef.current = null;
    if (onReorder && draggedId !== null) {
      onReorder(draggedId, targetId);
    }
  };

  return (
    <Card
      title={title}
      style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{
        body: {
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
      data-testid={testId}
    >
      <Input
        allowClear
        placeholder="Filter by id"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        style={{ marginBottom: 12 }}
        data-testid={`${testId}-filter`}
      />
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <List
          dataSource={visibleIds}
          locale={{ emptyText: 'No items' }}
          renderItem={(id) => (
            <List.Item
              onClick={() => onItemClick(id)}
              style={{ cursor: isDraggable ? 'grab' : 'pointer' }}
              data-testid={`${itemTestIdPrefix}-${id}`}
              draggable={isDraggable}
              onDragStart={() => {
                draggedIdRef.current = id;
              }}
              onDragOver={(event) => {
                if (isDraggable) {
                  event.preventDefault();
                }
              }}
              onDrop={(event) => {
                if (isDraggable) {
                  event.preventDefault();
                  handleDrop(id);
                }
              }}
            >
              {`id: ${id}`}
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
}

ItemPanel.defaultProps = {
  onReorder: undefined,
};

export default ItemPanel;
