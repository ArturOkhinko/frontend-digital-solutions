const inflight = new Map<string, Promise<unknown>>();
let tail: Promise<unknown> = Promise.resolve();

export const enqueueRequest = <T>(key: string, task: () => Promise<T>): Promise<T> => {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const run = tail.then(task, task);
  tail = run.then(
    () => undefined,
    () => undefined,
  );

  const tracked = run.finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, tracked);

  return tracked as Promise<T>;
};
