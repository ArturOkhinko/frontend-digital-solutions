import { ItemId } from '../types';
import { API_BASE_URL } from './config';
import { enqueueRequest } from './requestQueue';

export interface Item {
  id: ItemId;
}

export interface ItemsPage {
  ids: ItemId[];
  lastId: ItemId | null;
}

const toPage = (data: { items: Item[]; lastId: ItemId | null }): ItemsPage => ({
  ids: data.items.map((item) => item.id),
  lastId: data.lastId,
});

const buildItemsUrl = (lastId?: ItemId, search?: string, limit?: number): URL => {
  const url = new URL(`${API_BASE_URL}/items`);
  if (lastId !== undefined) {
    url.searchParams.set('lastId', String(lastId));
  }
  if (search) {
    url.searchParams.set('search', search);
  }
  if (limit !== undefined) {
    url.searchParams.set('limit', String(limit));
  }
  return url;
};

export const fetchItems = (
  lastId?: ItemId,
  search?: string,
  limit?: number,
): Promise<ItemsPage> => {
  const url = buildItemsUrl(lastId, search, limit);
  return enqueueRequest(`GET ${url.toString()}`, async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load items (status ${response.status})`);
    }
    return toPage((await response.json()) as { items: Item[]; lastId: ItemId | null });
  });
};

export const createItem = (id: ItemId): Promise<Item> =>
  enqueueRequest(`POST /items ${String(id)}`, async () => {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      keepalive: true,
    });
    if (!response.ok) {
      throw new Error(`Failed to create item (status ${response.status})`);
    }
    return response.json() as Promise<Item>;
  });

const keyForIds = (ids: ItemId[]): string =>
  [...ids]
    .map((id) => String(id))
    .sort()
    .join(',');

export const createItems = (ids: ItemId[]): Promise<{ created: number }> =>
  enqueueRequest(`POST /items/batch ${keyForIds(ids)}`, async () => {
    const response = await fetch(`${API_BASE_URL}/items/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
      keepalive: true,
    });
    if (!response.ok) {
      throw new Error(`Failed to create items (status ${response.status})`);
    }
    return response.json() as Promise<{ created: number }>;
  });
