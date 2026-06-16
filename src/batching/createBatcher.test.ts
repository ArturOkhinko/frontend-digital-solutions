import { createBatcher } from './createBatcher';

describe('createBatcher', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('flushes buffered items once per interval', () => {
    const flush = jest.fn();
    const batcher = createBatcher<number>(1000, flush);

    batcher.push(1);
    batcher.push(2);
    jest.advanceTimersByTime(1000);

    expect(flush).toHaveBeenCalledTimes(1);
    expect(flush).toHaveBeenCalledWith([1, 2]);
    batcher.stop();
  });

  it('does not flush when the buffer is empty', () => {
    const flush = jest.fn();
    const batcher = createBatcher<number>(1000, flush);

    jest.advanceTimersByTime(3000);

    expect(flush).not.toHaveBeenCalled();
    batcher.stop();
  });

  it('flushes immediately on flushNow without waiting for the interval', () => {
    const flush = jest.fn();
    const batcher = createBatcher<number>(10000, flush);

    batcher.push(7);
    batcher.flushNow();

    expect(flush).toHaveBeenCalledWith([7]);
    batcher.stop();
  });
});
