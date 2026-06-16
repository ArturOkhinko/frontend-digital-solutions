import { deselectItems, reorderSelected, selectItems } from '../api/selected';
import { ItemId } from '../types';

export type ModifyOp =
  | { type: 'select'; ids: ItemId[] }
  | { type: 'deselect'; ids: ItemId[] }
  | { type: 'reorder'; id: ItemId; afterId: ItemId | null };

export const flushModifications = (ops: ModifyOp[]): Promise<void> => {
  const selects: ItemId[] = [];
  const deselects: ItemId[] = [];
  const reorders: { id: ItemId; afterId: ItemId | null }[] = [];

  ops.forEach((op) => {
    if (op.type === 'select') {
      selects.push(...op.ids);
    } else if (op.type === 'deselect') {
      deselects.push(...op.ids);
    } else {
      reorders.push({ id: op.id, afterId: op.afterId });
    }
  });

  const membership: Promise<unknown>[] = [];
  if (selects.length > 0) {
    membership.push(selectItems(Array.from(new Set(selects))));
  }
  if (deselects.length > 0) {
    membership.push(deselectItems(Array.from(new Set(deselects))));
  }

  return Promise.all(membership).then(() => {
    let chain: Promise<unknown> = Promise.resolve();
    reorders.forEach((op) => {
      chain = chain.then(() => reorderSelected(op.id, op.afterId));
    });
    return chain.then(() => undefined);
  });
};
