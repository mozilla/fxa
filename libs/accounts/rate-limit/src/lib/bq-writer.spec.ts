/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/node';
import { RateLimitBqWriter, BqWriterConfig } from './bq-writer';
import { RateLimitCheckEvent } from './models';

const mockCallLog: string[] = [];

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(() => {
    mockCallLog.push('captureException');
  }),
  withIsolationScope: jest.fn(
    (callback: (scope: { clear(): void }) => Promise<void>) => {
      mockCallLog.push('scope:enter');
      return callback({
        clear: () => mockCallLog.push('scope:clear'),
      }).finally(() => mockCallLog.push('scope:exit'));
    }
  ),
}));

describe('RateLimitBqWriter', () => {
  let writer: RateLimitBqWriter;
  let mockTable: { insert: jest.Mock };
  let config: BqWriterConfig;

  const createEvent = (
    overrides?: Partial<RateLimitCheckEvent>
  ): RateLimitCheckEvent => ({
    timestamp: 1700000000000,
    action: 'loginAttempt',
    ip: '127.0.0.1',
    email: 'test@example.com',
    wasBlocked: false,
    wasSkipped: false,
    usedDefaultRule: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCallLog.length = 0;
    jest.useFakeTimers();
    mockTable = {
      insert: jest.fn().mockImplementation(async () => {
        mockCallLog.push('insert');
      }),
    };
    config = {
      projectId: 'test-project',
      dataset: 'fxa',
      table: 'rate_limit_checks_v2',
      flushIntervalMs: 5000,
      batchSize: 3,
    };
    writer = new RateLimitBqWriter(config, mockTable as any);
  });

  // shutdown() clears the setInterval timer started in the constructor.
  // Without it, the timer leaks into the next test and causes flaky failures.
  afterEach(async () => {
    await writer.shutdown();
    jest.useRealTimers();
  });

  it('buffers events without flushing below batch size', () => {
    writer.write(createEvent());
    writer.write(createEvent());

    expect(mockTable.insert).not.toHaveBeenCalled();
  });

  it('flushes when buffer reaches batch size', async () => {
    writer.write(createEvent({ action: 'a' }));
    writer.write(createEvent({ action: 'b' }));
    writer.write(createEvent({ action: 'c' }));

    // write() calls flush() fire-and-forget (no await). Drain one
    // microtask so the async insert resolves.
    await Promise.resolve();

    expect(mockTable.insert).toHaveBeenCalledTimes(1);
    expect(mockTable.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ action: 'a' }),
        expect.objectContaining({ action: 'b' }),
        expect.objectContaining({ action: 'c' }),
      ])
    );
  });

  it('flushes on timer interval', async () => {
    writer.write(createEvent());

    jest.advanceTimersByTime(5000);
    await Promise.resolve();

    expect(mockTable.insert).toHaveBeenCalledTimes(1);
    expect(mockTable.insert).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'loginAttempt' }),
    ]);
  });

  it('does not call insert when buffer is empty', async () => {
    await writer.flush();

    expect(mockTable.insert).not.toHaveBeenCalled();
  });

  it('catches errors, emits statsd metric, reports to Sentry, and never throws', async () => {
    const mockIncrement = jest.fn();
    const statsd = { increment: mockIncrement } as any;
    const insertError = new Error('BQ unavailable');
    mockTable.insert.mockRejectedValue(insertError);

    // Recreate writer with statsd
    await writer.shutdown();
    writer = new RateLimitBqWriter(config, mockTable as any, statsd);

    writer.write(createEvent());
    await writer.flush();

    expect(mockIncrement).toHaveBeenCalledWith(
      'rate_limit.bq_writer.flush_error'
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(insertError);
  });

  it('drains remaining events on shutdown', async () => {
    writer.write(createEvent({ action: 'remaining' }));

    await writer.shutdown();

    expect(mockTable.insert).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'remaining' }),
    ]);
  });

  it('inserts inside a freshly cleared isolation scope', async () => {
    writer.write(createEvent());

    await writer.flush();

    expect(mockCallLog).toEqual([
      'scope:enter',
      'scope:clear',
      'insert',
      'scope:exit',
    ]);
  });

  it('reports insert failures from inside the isolation scope', async () => {
    mockTable.insert.mockImplementation(async () => {
      mockCallLog.push('insert');
      throw new Error('BQ unavailable');
    });
    writer.write(createEvent());

    await writer.flush();

    expect(mockCallLog).toEqual([
      'scope:enter',
      'scope:clear',
      'insert',
      'captureException',
      'scope:exit',
    ]);
  });

  it('never has two inserts in flight at once', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    mockTable.insert.mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      // Yield twice so an unserialized second insert would overlap this one.
      await Promise.resolve();
      await Promise.resolve();
      inFlight -= 1;
    });

    writer.write(createEvent({ action: 'first' }));
    const firstFlush = writer.flush();
    writer.write(createEvent({ action: 'second' }));
    const secondFlush = writer.flush();
    await Promise.all([firstFlush, secondFlush]);

    expect(maxInFlight).toBe(1);
  });

  it('sends events buffered during an in-flight insert on the next flush', async () => {
    let releaseFirstInsert!: () => void;
    mockTable.insert.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          releaseFirstInsert = resolve;
        })
    );

    writer.write(createEvent({ action: 'first' }));
    const firstFlush = writer.flush();
    // Let the chained flush start; the first insert is now pending.
    await Promise.resolve();

    writer.write(createEvent({ action: 'second' }));
    const secondFlush = writer.flush();

    releaseFirstInsert();
    await Promise.all([firstFlush, secondFlush]);

    expect(mockTable.insert).toHaveBeenNthCalledWith(1, [
      expect.objectContaining({ action: 'first' }),
    ]);
    expect(mockTable.insert).toHaveBeenNthCalledWith(2, [
      expect.objectContaining({ action: 'second' }),
    ]);
  });

  it('clears buffer after flush', async () => {
    writer.write(createEvent());
    await writer.flush();

    mockTable.insert.mockClear();
    await writer.flush();

    expect(mockTable.insert).not.toHaveBeenCalled();
  });
});
