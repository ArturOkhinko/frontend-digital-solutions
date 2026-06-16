import { compareIds } from './compareIds';

describe('compareIds', () => {
  it('orders numbers numerically', () => {
    expect([10, 2, 1].sort(compareIds)).toEqual([1, 2, 10]);
  });

  it('places numbers before strings', () => {
    expect(['b', 2, 'a', 1].sort(compareIds)).toEqual([1, 2, 'a', 'b']);
  });

  it('orders strings lexicographically', () => {
    expect(['c', 'a', 'b'].sort(compareIds)).toEqual(['a', 'b', 'c']);
  });
});
