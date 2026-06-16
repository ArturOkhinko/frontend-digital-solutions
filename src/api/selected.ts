import { ItemId } from '../types';
import { API_BASE_URL } from './config';
import { Item, ItemsPage } from './items';

const toPage = (data: { items: Item[]; lastId: ItemId | null }): ItemsPage => ({
  ids: data.items.map((item) => item.id),
  lastId: data.lastId,
});

export const fetchSelected = async (lastId?: ItemId, search?: string): Promise<ItemsPage> => {
  const url = new URL(`${API_BASE_URL}/selected`);
  if (lastId !== undefined) {
    url.searchParams.set('lastId', String(lastId));
  }
  if (search) {
    url.searchParams.set('search', search);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load selected (status ${response.status})`);
  }

  return toPage((await response.json()) as { items: Item[]; lastId: ItemId | null });
};

export const selectItems = async (ids: ItemId[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/selected`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error(`Failed to select items (status ${response.status})`);
  }
};

export const deselectItems = async (ids: ItemId[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/selected`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error(`Failed to deselect items (status ${response.status})`);
  }
};

export const reorderSelected = async (id: ItemId, afterId: ItemId | null): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/selected/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, afterId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to reorder (status ${response.status})`);
  }
};
