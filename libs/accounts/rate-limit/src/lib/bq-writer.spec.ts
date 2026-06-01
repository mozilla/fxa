/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RateLimitBqWriter, BqWriterConfig } from './bq-writer';
import { RateLimitCheckEvent } from './models';

describe('RateLimitBqWriter', () => {
  let writer: RateLimitBqWriter;
  let mockInsert: jest.Mock;
  let mockBq: any;
  let config: BqWriterConfig;

  const createEvent = (overrides?: Partial<RateLimitCheckEvent>): RateLimitCheckEvent => ({
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
    mockInsert = jest.fn().mockResolvedValue(undefined);
    mockBq = {
      dataset: jest.fn().mockReturnValue({
        table: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      }),
    };
    config = {
      projectId: 'test-project',
      dataset: 'fxa',
      table: 'rate_limit_checks',
      flushIntervalMs: 5000,
      batchSize: 3,
    };
    writer = new RateLimitBqWriter(config, mockBq);
  });

  afterEach(async () => {
    await writer.shutdown();
    jest.useRealTimers();
  });

  it('buffers events without flushing below batch size', () => {
    writer.write(createEvent());
    writer.write(createEvent());

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('flushes when buffer reaches batch size', () => {
    writer.write(createEvent({ action: 'a' }));
    writer.write(createEvent({ action: 'b' }));
    writer.write(createEvent({ action: 'c' }));

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith(
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
    // Let the async flush complete
    await Promise.resolve();

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({ action: 'loginAttempt' })]);
  });

  it('does not call insert when buffer is empty', async () => {
    await writer.flush();

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('catches errors and never throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockInsert.mockRejectedValue(new Error('BQ unavailable'));

    writer.write(createEvent());
    await writer.flush();

    expect(consoleSpy).toHaveBeenCalledWith(
      'rate_limit.bq_writer.flush_error',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('drains remaining events on shutdown', async () => {
    writer.write(createEvent({ action: 'remaining' }));

    await writer.shutdown();

    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({ action: 'remaining' }),
    ]);
  });

  it('clears buffer after flush', async () => {
    writer.write(createEvent());
    await writer.flush();

    mockInsert.mockClear();
    await writer.flush();

    expect(mockInsert).not.toHaveBeenCalled();
  });
});
