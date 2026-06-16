import { CSSProperties } from 'react';
import { FixedSizeList as List, ListChildComponentProps, ListOnItemsRenderedProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Spin } from 'antd';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemId } from '../types';

const ROW_HEIGHT = 40;
const LOAD_THRESHOLD = 5;

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  borderBottom: '1px solid #f0f0f0',
  boxSizing: 'border-box',
};

interface RowData {
  ids: ItemId[];
  onItemClick: (id: ItemId) => void;
  itemTestIdPrefix: string;
  sortable: boolean;
}

function PlainRow({ id, style, data }: { id: ItemId; style: CSSProperties; data: RowData }) {
  return (
    <div
      style={{ ...style, ...rowStyle, cursor: 'pointer' }}
      data-testid={`${data.itemTestIdPrefix}-${id}`}
      role="button"
      tabIndex={0}
      onClick={() => data.onItemClick(id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          data.onItemClick(id);
        }
      }}
    >
      {`id: ${id}`}
    </div>
  );
}

function SortableRow({ id, style, data }: { id: ItemId; style: CSSProperties; data: RowData }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const composed: CSSProperties = {
    ...style,
    ...rowStyle,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    background: isDragging ? '#fafafa' : undefined,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={composed}
      data-testid={`${data.itemTestIdPrefix}-${id}`}
      role="button"
      tabIndex={0}
      onClick={() => data.onItemClick(id)}
      {...attributes}
      {...listeners}
      onKeyDown={(event) => {
        listeners?.onKeyDown?.(event);
        if (event.key === 'Enter') {
          data.onItemClick(id);
        }
      }}
    >
      {`id: ${id}`}
    </div>
  );
}

function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  const id = data.ids[index];
  return data.sortable ? (
    <SortableRow id={id} style={style} data={data} />
  ) : (
    <PlainRow id={id} style={style} data={data} />
  );
}

interface VirtualListProps {
  ids: ItemId[];
  onItemClick: (id: ItemId) => void;
  itemTestIdPrefix: string;
  loading?: boolean;
  hasMore?: boolean;
  onReachEnd?: () => void;
  sortable?: boolean;
  onReorder?: (draggedId: ItemId, targetId: ItemId) => void;
}

function VirtualList({
  ids,
  onItemClick,
  itemTestIdPrefix,
  loading = false,
  hasMore = true,
  onReachEnd = undefined,
  sortable = false,
  onReorder = undefined,
}: VirtualListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const rowData: RowData = { ids, onItemClick, itemTestIdPrefix, sortable };

  const handleItemsRendered = ({ visibleStopIndex }: ListOnItemsRenderedProps) => {
    if (onReachEnd && hasMore && !loading && visibleStopIndex >= ids.length - LOAD_THRESHOLD) {
      onReachEnd();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorder) {
      onReorder(active.id as ItemId, over.id as ItemId);
    }
  };

  if (ids.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}
      >
        {loading ? <Spin size="small" /> : 'No items'}
      </div>
    );
  }

  const list = (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          itemCount={ids.length}
          itemSize={ROW_HEIGHT}
          itemData={rowData}
          onItemsRendered={handleItemsRendered}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );

  if (!sortable) {
    return <div style={{ flex: 1, minHeight: 0 }}>{list}</div>;
  }

  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {list}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default VirtualList;
