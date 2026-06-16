import { UIEvent, useMemo, useRef, useState } from 'react';
import { Button, Card, Input, List, Space, Spin } from 'antd';
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
  onReachEnd?: () => void;
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const SCROLL_THRESHOLD = 48;

function ItemPanel({
  title,
  ids,
  onItemClick,
  testId,
  itemTestIdPrefix,
  onReorder = undefined,
  onAddItem = undefined,
  onGenerateItem = undefined,
  onReachEnd = undefined,
  loading = false,
  searchValue = undefined,
  onSearchChange = undefined,
}: ItemPanelProps) {
  const [localFilter, setLocalFilter] = useState('');
  const [newId, setNewId] = useState('');
  const draggedIdRef = useRef<ItemId | null>(null);

  const isServerSearch = Boolean(onSearchChange);
  const filterValue = isServerSearch ? searchValue ?? '' : localFilter;

  const visibleIds = useMemo(() => {
    if (isServerSearch) {
      return ids;
    }
    const query = localFilter.trim();
    if (!query) {
      return ids;
    }
    return ids.filter((id) => String(id).includes(query));
  }, [ids, localFilter, isServerSearch]);

  const handleFilterChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalFilter(value);
    }
  };

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

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!onReachEnd) {
      return;
    }
    const element = event.currentTarget;
    const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceToBottom <= SCROLL_THRESHOLD) {
      onReachEnd();
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
        value={filterValue}
        onChange={(event) => handleFilterChange(event.target.value)}
        style={{ marginBottom: 12 }}
        data-testid={`${testId}-filter`}
      />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }} onScroll={handleScroll}>
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
        {loading && (
          <div style={{ padding: 8, textAlign: 'center' }} data-testid={`${testId}-loading`}>
            <Spin size="small" />
          </div>
        )}
      </div>
    </Card>
  );
}

export default ItemPanel;
