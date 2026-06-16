import { ItemId } from '../types';

export const compareIds = (a: ItemId, b: ItemId): number => {
  const aIsNumber = typeof a === 'number';
  const bIsNumber = typeof b === 'number';
  if (aIsNumber && bIsNumber) {
    return a - b;
  }
  if (aIsNumber) {
    return -1;
  }
  if (bIsNumber) {
    return 1;
  }
  return String(a).localeCompare(String(b));
};
