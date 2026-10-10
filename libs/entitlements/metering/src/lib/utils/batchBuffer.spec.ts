/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BatchBuffer } from './batchBuffer';

describe('BatchBuffer', () => {
  let onFlush: jest.Mock;
  let onError: jest.Mock;

  function build(
    overrides: { maxSize?: number; flushIntervalMs?: number } = {}
  ) {
    return new BatchBuffer<string>({
      maxSize: overrides.maxSize ?? 3,
      flushIntervalMs: overrides.flushIntervalMs ?? 5_000,
      onFlush,
      onError,
    });
  }

  beforeEach(() => {
    jest.useFakeTimers();
    onFlush = jest.fn().mockResolvedValue(undefined);
    onError = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('flushes as soon as the batch reaches maxSize', () => {
    const buffer = build();

    buffer.push('a');
    buffer.push('b');
    expect(onFlush).not.toHaveBeenCalled();

    buffer.push('c');
    expect(onFlush).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('flushes a partial batch once the interval elapses', () => {
    const buffer = build();

    buffer.push('a');
    jest.advanceTimersByTime(5_000);

    expect(onFlush).toHaveBeenCalledWith(['a']);
  });

  it('does not schedule a second timer while one is pending', () => {
    const buffer = build({ maxSize: 10 });

    buffer.push('a');
    jest.advanceTimersByTime(3_000);
    buffer.push('b');
    jest.advanceTimersByTime(2_000);

    expect(onFlush).toHaveBeenCalledTimes(1);
    expect(onFlush).toHaveBeenCalledWith(['a', 'b']);
  });

  it('starts a fresh batch after a size-triggered flush', () => {
    const buffer = build({ maxSize: 2 });

    buffer.push('a');
    buffer.push('b');
    buffer.push('c');
    jest.advanceTimersByTime(5_000);

    expect(onFlush).toHaveBeenNthCalledWith(1, ['a', 'b']);
    expect(onFlush).toHaveBeenNthCalledWith(2, ['c']);
  });

  describe('drain', () => {
    it('flushes whatever is buffered and cancels the timer', async () => {
      const buffer = build();

      buffer.push('a');
      await buffer.drain();

      expect(onFlush).toHaveBeenCalledWith(['a']);
      jest.advanceTimersByTime(10_000);
      expect(onFlush).toHaveBeenCalledTimes(1);
    });

    it('waits for an in-flight flush to settle', async () => {
      let settle = () => {};
      onFlush.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            settle = resolve;
          })
      );
      const buffer = build({ maxSize: 1 });

      buffer.push('a');
      let drained = false;
      const draining = buffer.drain().then(() => {
        drained = true;
      });

      await Promise.resolve();
      expect(drained).toBe(false);

      settle();
      await draining;
      expect(drained).toBe(true);
    });

    it('does nothing when the buffer is empty', async () => {
      const buffer = build();

      await buffer.drain();

      expect(onFlush).not.toHaveBeenCalled();
    });
  });

  it('reports a rejected flush through onError', async () => {
    const failure = new Error('insert failed');
    onFlush.mockRejectedValue(failure);
    const buffer = build({ maxSize: 1 });

    buffer.push('a');
    await buffer.drain();

    expect(onError).toHaveBeenCalledWith(failure);
  });
});
