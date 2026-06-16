import { Button, Card, Input, Space } from 'antd';
import VirtualList from './VirtualList';
import { ItemId } from '../types';

interface ItemPanelProps {
  title: string;
  ids: ItemId[];
  testId: string;
  itemTestIdPrefix: string;
  onItemClick: (id: ItemId) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
  hasMore?: boolean;
  onReachEnd?: () => void;
  onReorder?: (draggedId: ItemId, targetId: ItemId) => void;
  onAddItem?: (rawId: string) => void;
  onGenerateItem?: () => void;
  newId?: string;
  onNewIdChange?: (value: string) => void;
}

function ItemPanel({
  title,
  ids,
  testId,
  itemTestIdPrefix,
  onItemClick,
  searchValue,
  onSearchChange,
  loading = false,
  hasMore = true,
  onReachEnd = undefined,
  onReorder = undefined,
  onAddItem = undefined,
  onGenerateItem = undefined,
  newId = '',
  onNewIdChange = undefined,
}: ItemPanelProps) {
  const canAdd = Boolean(onAddItem);

  const handleAdd = () => {
    if (onAddItem) {
      onAddItem(newId);
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
            onChange={(event) => onNewIdChange?.(event.target.value)}
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
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        style={{ marginBottom: 12 }}
        data-testid={`${testId}-filter`}
      />

      <VirtualList
        ids={ids}
        onItemClick={onItemClick}
        itemTestIdPrefix={itemTestIdPrefix}
        loading={loading}
        hasMore={hasMore}
        onReachEnd={onReachEnd}
        sortable={Boolean(onReorder)}
        onReorder={onReorder}
      />
    </Card>
  );
}

export default ItemPanel;
