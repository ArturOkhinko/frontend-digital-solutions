import { ItemId } from '../types';
import { API_BASE_URL } from './config';

export interface Item {
  id: ItemId;
}

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
