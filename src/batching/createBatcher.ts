export interface Batcher<T> {
  push: (item: T) => void;
  flushNow: () => void;
  stop: () => void;
}

export const createBatcher = <T>(
  intervalMs: number,
  flush: (items: T[]) => void,
): Batcher<T> => {
  let buffer: T[] = [];

  const drain = () => {
    if (buffer.length === 0) {
      return;
    }
    const batch = buffer;
    buffer = [];
    flush(batch);
  };

  const timer = setInterval(drain, intervalMs);

  return {
    push: (item: T) => {
      buffer.push(item);
    },
    flushNow: drain,
    stop: () => clearInterval(timer),
  };
};
