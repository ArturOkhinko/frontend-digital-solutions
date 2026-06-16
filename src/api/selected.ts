import { ItemId } from '../types';
import { API_BASE_URL } from './config';
import { Item, ItemsPage } from './items';
import { enqueueRequest } from './requestQueue';

const toPage = (data: { items: Item[]; lastId: ItemId | null }): ItemsPage => ({
  ids: data.items.map((item) => item.id),
  lastId: data.lastId,
});

const keyForIds = (ids: ItemId[]): string =>
  [...ids].map((id) => String(id)).sort().join(',');

export const fetchSelected = (
  lastId?: ItemId,
  search?: string,
  limit?: number,
): Promise<ItemsPage> => {
  const url = new URL(`${API_BASE_URL}/selected`);
  if (lastId !== undefined) {
    url.searchParams.set('lastId', String(lastId));
  }
  if (search) {
    url.searchParams.set('search', search);
  }
  if (limit !== undefined) {
    url.searchParams.set('limit', String(limit));
  }

  return enqueueRequest(`GET ${url.toString()}`, async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load selected (status ${response.status})`);
    }
    return toPage((await response.json()));
  });
};

export const selectItems = (ids: ItemId[]): Promise<void> =>
  enqueueRequest(`POST /selected ${keyForIds(ids)}`, async () => {
    const response = await fetch(`${API_BASE_URL}/selected`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
      keepalive: true,
    });
    if (!response.ok) {
      throw new Error(`Failed to select items (status ${response.status})`);
    }
  });

export const deselectItems = (ids: ItemId[]): Promise<void> =>
  enqueueRequest(`DELETE /selected ${keyForIds(ids)}`, async () => {
    const response = await fetch(`${API_BASE_URL}/selected`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
      keepalive: true,
    });
    if (!response.ok) {
      throw new Error(`Failed to deselect items (status ${response.status})`);
    }
  });

export const reorderSelected = (id: ItemId, afterId: ItemId | null): Promise<void> =>
  enqueueRequest(`PATCH /selected/reorder ${String(id)}:${String(afterId)}`, async () => {
    const response = await fetch(`${API_BASE_URL}/selected/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, afterId }),
      keepalive: true,
    });
    if (!response.ok) {
      throw new Error(`Failed to reorder (status ${response.status})`);
    }
  });
