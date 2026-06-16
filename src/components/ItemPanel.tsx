import { useMemo, useRef, useState } from 'react';
import { Button, Card, Input, List, Space } from 'antd';
import { ItemId } from '../types';

interface ItemPanelProps {
  title: string;
  ids: ItemId[];
  onItemClick: (id: ItemId) => void;
  testId: string;
  itemTestIdPrefix: string;
  onReorder?: (draggedId: ItemId, targetId: ItemId) => void;
  onAddItem?: (rawId: string) => void;
  onGenerateItem?: () => void;
}

function ItemPanel({
  title,
  ids,
  onItemClick,
  testId,
  itemTestIdPrefix,
  onReorder = undefined,
  onAddItem = undefined,
  onGenerateItem = undefined,
}: ItemPanelProps) {
  const [filter, setFilter] = useState('');
  const [newId, setNewId] = useState('');
  const draggedIdRef = useRef<ItemId | null>(null);

  const visibleIds = useMemo(() => {
    const query = filter.trim();
    if (!query) {
      return ids;
    }
    return ids.filter((id) => String(id).includes(query));
  }, [ids, filter]);

  const isDraggable = Boolean(onReorder);
  const canAdd = Boolean(onAddItem);

  const handleAdd = () => {
    if (onAddItem) {
      onAddItem(newId);
      setNewId('');
    }
  };

  const handleDrop = (targetId: ItemId) => {
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
      {canAdd && (
        <Space.Compact style={{ marginBottom: 12, width: '100%' }}>
          <Input
            placeholder="New id (number or string)"
            value={newId}
            onChange={(event) => setNewId(event.target.value)}
            onPressEnter={handleAdd}
            data-testid={`${testId}-new-id`}
          />
          <Button onClick={handleAdd} data-testid={`${testId}-add`}>
            Add
          </Button>
          <Button type="primary" onClick={onGenerateItem} data-testid={`${testId}-generate`}>
            UUID v7
          </Button>
        </Space.Compact>
      )}

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

export default ItemPanel;
