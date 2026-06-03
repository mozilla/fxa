/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  RateLimitBqWriter,
  BqWriterConfig,
  RATE_LIMIT_CHECK_SCHEMA,
} from './bq-writer';
import { RateLimitCheckEvent } from './models';

describe('RateLimitBqWriter', () => {
  let writer: RateLimitBqWriter;
  let mockTable: { insert: jest.Mock; exists: jest.Mock; create: jest.Mock };
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
    jest.useFakeTimers();
    mockTable = {
      insert: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue([true]),
      create: jest.fn().mockResolvedValue(undefined),
    };
    config = {
      projectId: 'test-project',
      dataset: 'fxa',
      table: 'rate_limit_checks',
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

    // write() calls flush() fire-and-forget. flush() has two async hops
    // (await tableReady, await insert), so we drain two microtasks.
    await Promise.resolve();
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

  it('catches errors, emits statsd metric, and never throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockIncrement = jest.fn();
    const statsd = { increment: mockIncrement } as any;
    mockTable.insert.mockRejectedValue(new Error('BQ unavailable'));

    // Recreate writer with statsd
    await writer.shutdown();
    writer = new RateLimitBqWriter(config, mockTable as any, statsd);

    writer.write(createEvent());
    await writer.flush();

    expect(mockIncrement).toHaveBeenCalledWith(
      'rate_limit.bq_writer.flush_error'
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      'rate_limit.bq_writer.flush_error',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('drains remaining events on shutdown', async () => {
    writer.write(createEvent({ action: 'remaining' }));

    await writer.shutdown();

    expect(mockTable.insert).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'remaining' }),
    ]);
  });

  it('clears buffer after flush', async () => {
    writer.write(createEvent());
    await writer.flush();

    mockTable.insert.mockClear();
    await writer.flush();

    expect(mockTable.insert).not.toHaveBeenCalled();
  });

  describe('ensureTable', () => {
    it('does not create table when it already exists', async () => {
      mockTable.exists.mockResolvedValue([true]);
      await writer.shutdown();
      writer = new RateLimitBqWriter(config, mockTable as any);

      writer.write(createEvent());
      await writer.flush();

      expect(mockTable.exists).toHaveBeenCalled();
      expect(mockTable.create).not.toHaveBeenCalled();
    });

    it('creates table when it does not exist', async () => {
      mockTable.exists.mockResolvedValue([false]);
      await writer.shutdown();
      writer = new RateLimitBqWriter(config, mockTable as any);

      writer.write(createEvent());
      await writer.flush();

      expect(mockTable.create).toHaveBeenCalledWith({
        schema: RATE_LIMIT_CHECK_SCHEMA,
      });
    });

    it('handles ensureTable errors without affecting inserts', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockTable.exists.mockRejectedValue(new Error('permission denied'));
      await writer.shutdown();
      writer = new RateLimitBqWriter(config, mockTable as any);

      writer.write(createEvent());
      await writer.flush();

      expect(consoleSpy).toHaveBeenCalledWith(
        'rate_limit.bq_writer.ensure_table_error',
        expect.any(Error)
      );
      expect(mockTable.insert).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
