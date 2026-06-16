import { enqueueRequest } from './requestQueue';

describe('enqueueRequest', () => {
  it('dedups concurrent identical keys and runs the task once', async () => {
    const task = jest.fn().mockResolvedValue('ok');

    const first = enqueueRequest('same', task);
    const second = enqueueRequest('same', task);

    expect(first).toBe(second);
    await Promise.all([first, second]);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('runs tasks with different keys', async () => {
    const a = jest.fn().mockResolvedValue('a');
    const b = jest.fn().mockResolvedValue('b');

    await Promise.all([enqueueRequest('a', a), enqueueRequest('b', b)]);

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('allows the same key again after completion', async () => {
    const task = jest.fn().mockResolvedValue('ok');

    await enqueueRequest('again', task);
    await enqueueRequest('again', task);

    expect(task).toHaveBeenCalledTimes(2);
  });
});
