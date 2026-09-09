/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BigQuery, Table } from '@google-cloud/bigquery';
import * as Sentry from '@sentry/node';
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
 * size is reached. Errors are caught and reported — a BigQuery outage
 * must never affect the auth flow.
 *
 * The target table must be pre-created by SRE. Insert failures are
 * captured via Sentry and statsd.
 */
export class RateLimitBqWriter {
  private buffer: RateLimitCheckEvent[] = [];
  private timer: NodeJS.Timeout | null = null;
  private flushChain: Promise<void> = Promise.resolve();
  private readonly tableRef: Table;

  /**
   * @param config Writer configuration
   * @param table  Optional Table instance for testing. When omitted, a real
   *               BigQuery client is created from config.
   * @param statsd Optional StatsD client for metrics
   */
  constructor(
    private readonly config: BqWriterConfig,
    table?: Table,
    private readonly statsd?: StatsD
  ) {
    if (table) {
      this.tableRef = table;
    } else {
      const client = new BigQuery({ projectId: config.projectId });
      this.tableRef = client.dataset(config.dataset).table(config.table);
    }
    this.startTimer();
  }

  /** Append an event to the buffer. Flushes if batch size is reached. */
  write(event: RateLimitCheckEvent): void {
    this.buffer.push(event);
    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Send buffered events to BigQuery. Catches all errors.
   *
   * Flushes are serialized: the timer and a batch-size trigger must not
   * splice the buffer concurrently, or two inserts race over the same rows.
   */
  async flush(): Promise<void> {
    this.flushChain = this.flushChain.then(() => this.flushOnce());
    return this.flushChain;
  }

  /**
   * Perform a single insert. Only ever called from the flush chain, so at
   * most one is in flight at a time.
   *
   * flushOnce never rejects — the try/catch covers the insert — so the chain
   * cannot be poisoned. If that ever changes, flush() needs a .catch() guard.
   */
  private async flushOnce(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const batch = this.buffer.splice(0);

    // Run the insert in a throwaway isolation scope. Sentry's httpIntegration
    // records a breadcrumb for the outgoing insertAll call on whichever
    // isolation scope is active when the request is made. Without this other
    // Sentry captures get polluted with these insertAll bread crumbs.
    await Sentry.withIsolationScope(async (scope) => {
      scope.clear();
      try {
        await this.tableRef.insert(batch);
      } catch (err) {
        // Never throw — BQ failures must not affect auth
        this.statsd?.increment('rate_limit.bq_writer.flush_error');
        Sentry.captureException(err);
      }
    });
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
