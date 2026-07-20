/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { StrapiMeterFactory } from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import {
  BufferedIngestEvent,
  MeteringIngestManager,
} from './metering-ingest.manager';
import { MeteringConfig, MockMeteringConfig } from './metering.config';
import { METERING_EVENT_SOURCE } from './metering.constants';
import { MeteringBufferOverflowError } from './metering.error';
import { OpenMeterClient } from './openmeter.client';

const mockSentryCaptureException = jest.fn();
const mockSentrySetExtra = jest.fn();

jest.mock('@sentry/nestjs', () => ({
  withScope: (callback: (scope: { setExtra: jest.Mock }) => void) =>
    callback({ setExtra: mockSentrySetExtra }),
  captureException: (err: unknown) => mockSentryCaptureException(err),
}));

describe('MeteringIngestManager', () => {
  jest.useFakeTimers();

  let meteringIngestManager: MeteringIngestManager;
  let ingest: jest.Mock;
  let logger: { error: jest.Mock; log: jest.Mock };
  let statsd: { increment: jest.Mock };

  async function makeManager(bufferConfig?: MeteringConfig['buffer']) {
    ingest = jest.fn().mockResolvedValue(undefined);
    logger = { error: jest.fn(), log: jest.fn() };
    statsd = { increment: jest.fn() };
    const meteringConfig: MeteringConfig = {
      openmeterBaseUrl: 'http://example.com',
      clients: {},
      cloudTasks: MockMeteringConfig.cloudTasks,
      buffer: bufferConfig ?? {
        maxBatchSize: 100,
        maxIntervalMs: 100,
        maxQueueSize: 10_000,
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringIngestManager,
        { provide: MeteringConfig, useValue: meteringConfig },
        { provide: OpenMeterClient, useValue: { ingest } },
        { provide: Logger, useValue: logger },
        { provide: StatsDService, useValue: statsd },
      ],
    }).compile();
    return moduleRef.get(MeteringIngestManager);
  }

  function event(
    overrides: Partial<BufferedIngestEvent> = {}
  ): BufferedIngestEvent {
    return {
      id: 'evt-1',
      userIdentifier: 'user-1',
      amount: 1,
      meter: StrapiMeterFactory({ slug: 'tokens' }),
      ...overrides,
    };
  }

  beforeEach(async () => {
    mockSentryCaptureException.mockClear();
    mockSentrySetExtra.mockClear();
    meteringIngestManager = await makeManager();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('enqueue', () => {
    it('counts the enqueue and does not flush below maxBatchSize', async () => {
      meteringIngestManager.enqueue(event({ id: 'a' }));
      meteringIngestManager.enqueue(event({ id: 'b' }));

      expect(statsd.increment).toHaveBeenCalledWith('metering.buffer.enqueue');
      expect(ingest).not.toHaveBeenCalled();
      expect(statsd.increment).not.toHaveBeenCalledWith(
        'metering.buffer.flush'
      );

      await meteringIngestManager.flushNow();
    });

    it('auto-flushes synchronously once maxBatchSize is reached', async () => {
      meteringIngestManager = await makeManager({
        maxBatchSize: 3,
        maxIntervalMs: 100_000,
        maxQueueSize: 100,
      });
      for (let i = 0; i < 3; i++) {
        meteringIngestManager.enqueue(event({ id: `e-${i}` }));
      }

      expect(ingest).toHaveBeenCalledTimes(1);
      expect(ingest.mock.calls[0][0]).toHaveLength(3);
    });

    it('bounds each batch at maxBatchSize during a synchronous burst', async () => {
      meteringIngestManager = await makeManager({
        maxBatchSize: 3,
        maxIntervalMs: 100_000,
        maxQueueSize: 100,
      });
      for (let i = 0; i < 6; i++) {
        meteringIngestManager.enqueue(event({ id: `e-${i}` }));
      }

      expect(ingest).toHaveBeenCalledTimes(2);
      expect(ingest.mock.calls[0][0]).toHaveLength(3);
      expect(ingest.mock.calls[1][0]).toHaveLength(3);
    });

    it('arms the interval timer once and flushes on the first event deadline', async () => {
      meteringIngestManager = await makeManager({
        maxBatchSize: 100,
        maxIntervalMs: 100,
        maxQueueSize: 100,
      });
      meteringIngestManager.enqueue(event({ id: 'a' }));
      await jest.advanceTimersByTimeAsync(50);
      meteringIngestManager.enqueue(event({ id: 'b' }));
      await jest.advanceTimersByTimeAsync(50);

      expect(ingest).toHaveBeenCalledTimes(1);
      expect(ingest.mock.calls[0][0]).toHaveLength(2);
    });

    it('throws MeteringBufferOverflowError and counts overflow when the queue is full', async () => {
      meteringIngestManager = await makeManager({
        maxBatchSize: 100,
        maxIntervalMs: 100_000,
        maxQueueSize: 2,
      });
      meteringIngestManager.enqueue(event({ id: 'a' }));
      meteringIngestManager.enqueue(event({ id: 'b' }));

      expect(() => meteringIngestManager.enqueue(event({ id: 'c' }))).toThrow(
        MeteringBufferOverflowError
      );
      expect(statsd.increment).toHaveBeenCalledWith('metering.buffer.overflow');

      await meteringIngestManager.flushNow();
    });
  });

  describe('flush', () => {
    it('flushes a partial batch on flushNow and counts the flush', async () => {
      meteringIngestManager.enqueue(event({ id: 'a' }));
      meteringIngestManager.enqueue(event({ id: 'b' }));

      await meteringIngestManager.flushNow();

      expect(ingest).toHaveBeenCalledTimes(1);
      expect(ingest.mock.calls[0][0]).toHaveLength(2);
      expect(statsd.increment).toHaveBeenCalledWith('metering.buffer.flush');
    });

    it('does nothing when flushNow is called with an empty buffer', async () => {
      await meteringIngestManager.flushNow();

      expect(ingest).not.toHaveBeenCalled();
      expect(statsd.increment).not.toHaveBeenCalledWith(
        'metering.buffer.flush'
      );
    });

    it('flushes when the interval timer fires', async () => {
      meteringIngestManager.enqueue(event({ id: 'a' }));

      await jest.advanceTimersByTimeAsync(100);

      expect(ingest).toHaveBeenCalledTimes(1);
    });

    it('maps buffered events into CloudEvents using the meter slug', async () => {
      const timestamp = new Date('2026-05-07T12:00:00.000Z');
      meteringIngestManager.enqueue(
        event({
          id: 'evt-1',
          userIdentifier: 'user-1',
          amount: 7,
          timestamp,
          meter: StrapiMeterFactory({ slug: 'tokens' }),
        })
      );

      await meteringIngestManager.flushNow();

      expect(ingest.mock.calls[0][0]).toEqual([
        {
          id: 'evt-1',
          source: METERING_EVENT_SOURCE,
          type: 'tokens',
          subject: 'user-1',
          time: timestamp,
          data: { amount: 7 },
        },
      ]);
    });

    it('stamps the event time at enqueue, not at flush', async () => {
      jest.setSystemTime(new Date('2026-05-07T12:00:00.000Z'));
      meteringIngestManager.enqueue(
        event({ id: 'evt-1', timestamp: undefined })
      );

      jest.setSystemTime(new Date('2026-05-07T12:05:00.000Z'));
      await meteringIngestManager.flushNow();

      expect(ingest.mock.calls[0][0][0].time).toEqual(
        new Date('2026-05-07T12:00:00.000Z')
      );
    });
  });

  describe('flush errors', () => {
    it('does not throw, logs, counts flush_error, and reports to Sentry with the batch size', async () => {
      ingest.mockRejectedValueOnce(new Error('openmeter down'));
      meteringIngestManager.enqueue(event({ id: 'a' }));

      await expect(meteringIngestManager.flushNow()).resolves.toBeUndefined();

      expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.buffer.flush_error'
      );
      expect(mockSentrySetExtra).toHaveBeenCalledWith('batchSize', 1);
      expect(mockSentryCaptureException).toHaveBeenCalledWith(
        expect.any(Error)
      );
    });
  });

  describe('onApplicationShutdown', () => {
    it('drains queued events before resolving', async () => {
      meteringIngestManager.enqueue(event({ id: 'a' }));
      meteringIngestManager.enqueue(event({ id: 'b' }));
      expect(ingest).not.toHaveBeenCalled();

      await meteringIngestManager.onApplicationShutdown();

      expect(ingest).toHaveBeenCalledTimes(1);
      expect(ingest.mock.calls[0][0]).toHaveLength(2);
    });

    it('awaits in-flight flushes that the interval timer started', async () => {
      let resolveIngest: (() => void) | undefined;
      ingest.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveIngest = resolve;
          })
      );

      meteringIngestManager.enqueue(event({ id: 'a' }));
      await jest.advanceTimersByTimeAsync(100);

      let shutdownResolved = false;
      const shutdown = meteringIngestManager
        .onApplicationShutdown()
        .then(() => {
          shutdownResolved = true;
        });
      await Promise.resolve();
      await Promise.resolve();
      expect(shutdownResolved).toBe(false);

      resolveIngest?.();
      await shutdown;
      expect(shutdownResolved).toBe(true);
    });

    it('is a no-op when the buffer is empty', async () => {
      await expect(
        meteringIngestManager.onApplicationShutdown()
      ).resolves.toBeUndefined();
      expect(ingest).not.toHaveBeenCalled();
    });
  });
});
