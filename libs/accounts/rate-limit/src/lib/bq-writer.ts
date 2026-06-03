/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BigQuery, Table } from '@google-cloud/bigquery';
import { StatsD } from '@fxa/shared/metrics/statsd';
import { RateLimitCheckEvent } from './models';

export interface BqWriterConfig {
  projectId: string;
  dataset: string;
  table: string;
  flushIntervalMs: number;
  batchSize: number;
}

/**
 * Non-blocking, batched BigQuery writer for rate-limit check events.
 * Buffers events in memory and flushes on a timer or when the batch
 * size is reached. Errors are caught and logged — a BigQuery outage
 * must never affect the auth flow.
 */
export class RateLimitBqWriter {
  private buffer: RateLimitCheckEvent[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly tableRef: Table;

  constructor(
    private readonly config: BqWriterConfig,
    bq?: BigQuery,
    private readonly statsd?: StatsD
  ) {
    const client = bq ?? new BigQuery({ projectId: config.projectId });
    this.tableRef = client.dataset(config.dataset).table(config.table);
    this.startTimer();
  }

  /** Append an event to the buffer. Flushes if batch size is reached. */
  write(event: RateLimitCheckEvent): void {
    this.buffer.push(event);
    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /** Send buffered events to BigQuery. Catches all errors. */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const batch = this.buffer.splice(0);
    try {
      await this.tableRef.insert(batch);
    } catch (err) {
      // Log but never throw — BQ failures must not affect auth
      this.statsd?.increment('rate_limit.bq_writer.flush_error');
      console.error('rate_limit.bq_writer.flush_error', err);
    }
  }

  /** Drain remaining events and stop the flush timer. */
  async shutdown(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await this.flush();
  }

  private startTimer(): void {
    this.timer = setInterval(() => this.flush(), this.config.flushIntervalMs);
    // Don't prevent the process from exiting
    this.timer.unref();
  }
}
