/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { StatsDService } from '@fxa/shared/metrics/statsd';

import {
  BufferedIngestEvent,
  MeteringIngestBufferManager,
} from './metering-ingest-buffer.manager';
import { MeteringConfig } from './metering.config';
import { OpenMeterClient } from './openmeter.client';
import { METERING_EVENT_SOURCE } from './metering.types';
import { StrapiMeterFactory } from '@fxa/shared/cms';

describe('MeteringIngestBufferManager', () => {
  jest.useFakeTimers();
  afterEach(() => {
    jest.clearAllTimers();
  });

  let meteringIngestBufferManager: MeteringIngestBufferManager;
  let openMeterClient: { events: { ingest: jest.Mock }; meters: { query: jest.Mock } };
  let logger: { error: jest.Mock; log: jest.Mock };
  let statsd: { increment: jest.Mock; timing: jest.Mock };

  async function makeBuffer(
    overrides: Partial<MeteringConfig> = {}
  ): Promise<{
    meteringIngestBufferManager: MeteringIngestBufferManager;
    openMeterClient: {
      events: { ingest: jest.Mock };
      meters: { query: jest.Mock };
    };
    logger: { error: jest.Mock; log: jest.Mock };
    statsd: { increment: jest.Mock; timing: jest.Mock };
  }> {
    const meteringConfig: MeteringConfig = {
      openmeterBaseUrl: 'http://example.com',
      clients: {},
      buffer: {
        maxBatchSize: 100,
        maxIntervalMs: 100,
        maxQueueSize: 10_000,
      },
      ...overrides,
    };
    const stubLogger = { log: jest.fn(), error: jest.fn() };
    const stubStatsd = { increment: jest.fn(), timing: jest.fn() };
    const stubOpenMeterClient = {
      events: { ingest: jest.fn().mockResolvedValue(undefined) },
      meters: { query: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringIngestBufferManager,
        { provide: MeteringConfig, useValue: meteringConfig },
        { provide: OpenMeterClient, useValue: stubOpenMeterClient },
        { provide: Logger, useValue: stubLogger },
        { provide: StatsDService, useValue: stubStatsd },
      ],
    }).compile();
    return {
      meteringIngestBufferManager: moduleRef.get(MeteringIngestBufferManager),
      openMeterClient: stubOpenMeterClient,
      logger: stubLogger,
      statsd: stubStatsd,
    };
  }

  function event(
    overrides: Partial<BufferedIngestEvent> = {}
  ): BufferedIngestEvent {
    return {
      id: overrides.id ?? 'evt-1',
      userIdentifier: 'user-1',
      amount: 1,
      meter: StrapiMeterFactory({
        slug: 'tokens',
        limit: 100,
        window: 'monthly',
        notificationThresholds: [],
        webhooks: [],
      }),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const wired = await makeBuffer();
    meteringIngestBufferManager = wired.meteringIngestBufferManager;
    openMeterClient = wired.openMeterClient;
    logger = wired.logger;
    statsd = wired.statsd;
  });

  describe('push + flush', () => {
    it('does not flush below maxBatchSize until the interval elapses', async () => {
      meteringIngestBufferManager.push(event({ id: 'a' }));
      meteringIngestBufferManager.push(event({ id: 'b' }));
      expect(openMeterClient.events.ingest).not.toHaveBeenCalled();
      await meteringIngestBufferManager.flushNow();
    });

    it('flushes when maxBatchSize is hit', async () => {
      const wired = await makeBuffer({
        buffer: { maxBatchSize: 3, maxIntervalMs: 100_000, maxQueueSize: 100 },
      });
      for (let i = 0; i < 3; i++) {
        wired.meteringIngestBufferManager.push(event({ id: `e-${i}` }));
      }
      await wired.meteringIngestBufferManager.flushNow();
      expect(wired.openMeterClient.events.ingest).toHaveBeenCalledTimes(1);
      expect(wired.openMeterClient.events.ingest.mock.calls[0][0]).toHaveLength(3);
    });

    it('flushes on flushNow even with a partial batch', async () => {
      meteringIngestBufferManager.push(event({ id: 'a' }));
      meteringIngestBufferManager.push(event({ id: 'b' }));
      await meteringIngestBufferManager.flushNow();
      expect(openMeterClient.events.ingest).toHaveBeenCalledTimes(1);
      expect(openMeterClient.events.ingest.mock.calls[0][0]).toHaveLength(2);
    });

    it('flushes when the interval timer fires', async () => {
      meteringIngestBufferManager.push(event({ id: 'a' }));
      // advanceTimersByTimeAsync drains microtasks between fired timers so
      // the awaits inside processBatch get a chance to resolve.
      await jest.advanceTimersByTimeAsync(100);
      expect(openMeterClient.events.ingest).toHaveBeenCalledTimes(1);
    });

    it('rejects pushes when the queue is full', async () => {
      const wired = await makeBuffer({
        buffer: { maxBatchSize: 100, maxIntervalMs: 100_000, maxQueueSize: 2 },
      });
      wired.meteringIngestBufferManager.push(event({ id: 'a' }));
      wired.meteringIngestBufferManager.push(event({ id: 'b' }));
      expect(() => wired.meteringIngestBufferManager.push(event({ id: 'c' }))).toThrow(
        ServiceUnavailableException
      );
      expect(wired.statsd.increment).toHaveBeenCalledWith(
        'metering.buffer.overflow'
      );
      await wired.meteringIngestBufferManager.flushNow();
    });
  });

  describe('batch ingest payload', () => {
    it('translates buffered events into CloudEvents for OpenMeter', async () => {
      const ts = new Date('2026-05-07T12:00:00.000Z');
      meteringIngestBufferManager.push(
        event({
          id: 'evt-1',
          userIdentifier: 'user-1',
          amount: 7,
          timestamp: ts,
          meter: StrapiMeterFactory({ slug: 'tokens' }),
        })
      );
      await meteringIngestBufferManager.flushNow();
      const call = openMeterClient.events.ingest.mock.calls[0][0];
      expect(call).toEqual([
        {
          id: 'evt-1',
          source: METERING_EVENT_SOURCE,
          type: 'tokens',
          subject: 'user-1',
          time: ts,
          data: { amount: 7 },
        },
      ]);
    });
  });

  describe('error handling', () => {
    it('does not throw if processBatch fails, but logs and counts the failure', async () => {
      openMeterClient.events.ingest.mockRejectedValueOnce(new Error('openmeter down'));
      meteringIngestBufferManager.push(event({ id: 'a' }));
      await expect(meteringIngestBufferManager.flushNow()).resolves.toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
      expect(statsd.increment).toHaveBeenCalledWith(
        'metering.buffer.flush_error'
      );
    });
  });

  describe('onApplicationShutdown', () => {
    it('drains queued events before resolving', async () => {
      meteringIngestBufferManager.push(event({ id: 'a' }));
      meteringIngestBufferManager.push(event({ id: 'b' }));
      expect(openMeterClient.events.ingest).not.toHaveBeenCalled();

      await meteringIngestBufferManager.onApplicationShutdown();

      expect(openMeterClient.events.ingest).toHaveBeenCalledTimes(1);
      expect(openMeterClient.events.ingest.mock.calls[0][0]).toHaveLength(2);
    });

    it('awaits in-flight flushes that the interval timer kicked off', async () => {
      let resolveIngest: (() => void) | undefined;
      openMeterClient.events.ingest.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveIngest = resolve;
          })
      );

      meteringIngestBufferManager.push(event({ id: 'a' }));
      await jest.advanceTimersByTimeAsync(100);

      let shutdownResolved = false;
      const shutdown = meteringIngestBufferManager.onApplicationShutdown().then(() => {
        shutdownResolved = true;
      });
      // Give the shutdown promise a couple of ticks to settle on its own.
      await Promise.resolve();
      await Promise.resolve();
      expect(shutdownResolved).toBe(false);

      resolveIngest?.();
      await shutdown;
      expect(shutdownResolved).toBe(true);
    });

    it('is safe to call when the buffer is empty', async () => {
      await expect(meteringIngestBufferManager.onApplicationShutdown()).resolves.toBeUndefined();
      expect(openMeterClient.events.ingest).not.toHaveBeenCalled();
    });
  });
});
