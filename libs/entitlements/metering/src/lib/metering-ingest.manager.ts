/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

import type { StrapiMeter } from '@fxa/shared/cms';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringBufferConfig, MeteringConfig } from './metering.config';
import { MeteringBufferOverflowError } from './metering.error';
import { OpenMeterClient } from './openmeter.client';
import { toMeteringCloudEvent } from './utils/toMeteringCloudEvent';

export interface BufferedIngestEvent {
  id: string;
  userIdentifier: string;
  amount: number;
  timestamp?: Date;
  meter: StrapiMeter;
}

/**
 * Buffers metering events in memory and sends them to OpenMeter in batches,
 * either when maxBatchSize events have queued or when maxIntervalMs elapses.
 */
@Injectable()
export class MeteringIngestManager implements OnApplicationShutdown {
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

  enqueue(event: BufferedIngestEvent): void {
    if (this.buffer.length >= this.opts.maxQueueSize) {
      this.statsd.increment('metering.buffer.overflow');
      throw new MeteringBufferOverflowError();
    }
    this.buffer.push({ ...event, timestamp: event.timestamp ?? new Date() });
    this.statsd.increment('metering.buffer.enqueue');

    if (this.buffer.length >= this.opts.maxBatchSize) {
      this.cancelTimer();
      this.doFlush();
    } else if (this.flushTimer === null) {
      this.scheduleFlush(this.opts.maxIntervalMs);
    }
  }

  async flushNow(): Promise<void> {
    this.cancelTimer();
    const flush = this.doFlush();
    if (flush) {
      await flush;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    this.cancelTimer();
    await this.flushNow();
    await Promise.allSettled(Array.from(this.inFlightFlushes));
  }

  private scheduleFlush(delayMs: number): void {
    this.cancelTimer();
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      // Not awaited on purpose. doFlush tracks the flush in inFlightFlushes for shutdown.
      this.doFlush();
    }, delayMs);
  }

  private cancelTimer(): void {
    if (this.flushTimer !== null) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * In future we may consider using cloud tasks or another means of queuing to
   * improve durability here. For now, we consider this good enough.
   */
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
    await this.openMeterClient.ingest(
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
