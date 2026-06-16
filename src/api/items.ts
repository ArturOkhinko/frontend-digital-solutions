import { ItemId } from '../types';
import { API_BASE_URL } from './config';

export interface Item {
  id: ItemId;
}

export interface ItemsPage {
  ids: ItemId[];
  lastId: ItemId | null;
}

export const fetchItems = async (lastId?: ItemId): Promise<ItemsPage> => {
  const url = new URL(`${API_BASE_URL}/items`);
  if (lastId !== undefined) {
    url.searchParams.set('lastId', String(lastId));
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load items (status ${response.status})`);
  }

  const data = (await response.json()) as { items: Item[]; lastId: ItemId | null };
  return { ids: data.items.map((item) => item.id), lastId: data.lastId };
};

export const createItem = async (id: ItemId): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create item (status ${response.status})`);
  }

  return response.json() as Promise<Item>;
};
