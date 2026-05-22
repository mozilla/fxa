/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringConfig, MeteringBufferConfig } from './metering.config';
import { OpenMeterClient } from './openmeter.client';
import { toMeteringCloudEvent } from './utils/toMeteringCloudEvent';
import type { StrapiMeter } from '@fxa/shared/cms';

export interface BufferedIngestEvent {
  id: string;
  userIdentifier: string;
  amount: number;
  timestamp?: Date;
  meter: StrapiMeter;
}

/**
 * In-process buffer that batches metering events before forwarding them to
 * OpenMeter. The buffer flushes when either:
 *   - `maxBatchSize` events have accumulated, or
 *   - `maxIntervalMs` have elapsed since the first event in the current batch.
 *
 * Threshold detection and webhook dispatch run out-of-band via Cloud Tasks
 * (see `MeteringThresholdTasksManager` / the threshold-check handler). The buffer
 * is intentionally limited to ingest fan-in so its failure modes stay
 * decoupled from notification delivery.
 *
 * Backpressure: if `maxQueueSize` is exceeded (i.e. OpenMeter is unavailable
 * for long enough that the queue fills), `push` throws
 * `ServiceUnavailableException` so the controller returns a 503 to the
 * relying party rather than silently dropping events.
 *
 * Shutdown: `onApplicationShutdown` cancels the pending flush timer, drains
 * any queued events synchronously, and awaits every in-flight flush to
 * complete before returning. Requires `app.enableShutdownHooks()` in the
 * Nest bootstrap.
 */
@Injectable()
export class MeteringIngestBufferManager implements OnApplicationShutdown {
  private buffer: BufferedIngestEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly inFlightFlushes: Set<Promise<void>> = new Set();
  private readonly opts: MeteringBufferConfig;

  constructor(
    meteringConfig: MeteringConfig,
    private readonly openMeterClient: OpenMeterClient,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {
    this.opts = meteringConfig.buffer ?? new MeteringBufferConfig();
  }

  push(event: BufferedIngestEvent): void {
    if (this.buffer.length >= this.opts.maxQueueSize) {
      this.statsd.increment('metering.buffer.overflow');
      throw new ServiceUnavailableException();
    }
    this.buffer.push(event);
    this.statsd.increment('metering.buffer.enqueue');

    if (this.buffer.length >= this.opts.maxBatchSize) {
      this.scheduleFlush(0);
    } else if (this.flushTimer === null) {
      this.scheduleFlush(this.opts.maxIntervalMs);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    this.cancelTimer();
    await this.flushNow();
    // Drain anything that the timer-scheduled flush kicked off concurrently.
    await Promise.allSettled(Array.from(this.inFlightFlushes));
  }

  /**
   * Force-flush the buffer immediately. Resolves when the synchronously-
   * triggered flush has finished its I/O. Note that concurrent timer-driven
   * flushes that started before this call are tracked via
   * `inFlightFlushes`; `onApplicationShutdown` awaits them.
   */
  async flushNow(): Promise<void> {
    this.cancelTimer();
    const flush = this.doFlush();
    if (flush) {
      await flush;
    }
  }

  private scheduleFlush(delayMs: number): void {
    this.cancelTimer();
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      const flush = this.doFlush();
      // Don't await here — the timer callback returns immediately; the
      // promise is already tracked in `inFlightFlushes` by `doFlush`.
      void flush;
    }, delayMs);
  }

  private cancelTimer(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private doFlush(): Promise<void> | null {
    if (this.buffer.length === 0) {
      return null;
    }
    const batch = this.buffer;
    this.buffer = [];
    this.statsd.increment('metering.buffer.flush');

    const flushPromise: Promise<void> = this.processBatch(batch)
      .catch((err) => {
        Sentry.withScope((scope) => {
          scope.setExtra('batchSize', batch.length);
          Sentry.captureException(err);
        });
        this.statsd.increment('metering.buffer.flush_error');
        this.logger.error(err);
      })
      .finally(() => {
        this.inFlightFlushes.delete(flushPromise);
      });
    this.inFlightFlushes.add(flushPromise);
    return flushPromise;
  }

  private async processBatch(batch: BufferedIngestEvent[]): Promise<void> {
    await this.openMeterClient.events.ingest(
      batch.map((e) =>
        toMeteringCloudEvent({
          id: e.id,
          userIdentifier: e.userIdentifier,
          slug: e.meter.slug,
          amount: e.amount,
          timestamp: e.timestamp,
        })
      )
    );
  }
}
