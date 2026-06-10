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
 * size is reached. Errors are caught and logged — a BigQuery outage
 * must never affect the auth flow.
 */
/**
 * BigQuery schema for the rate_limit_checks table. Kept in code so the
 * table can be self-created and schema changes are versioned alongside
 * the RateLimitCheckEvent type.
 */
export const RATE_LIMIT_CHECK_SCHEMA = [
  { name: 'timestamp', type: 'INTEGER', mode: 'REQUIRED' as const },
  { name: 'action', type: 'STRING', mode: 'REQUIRED' as const },
  { name: 'ip', type: 'STRING', mode: 'NULLABLE' as const },
  { name: 'email', type: 'STRING', mode: 'NULLABLE' as const },
  { name: 'uid', type: 'STRING', mode: 'NULLABLE' as const },
  { name: 'blockingOn', type: 'STRING', mode: 'NULLABLE' as const },
  { name: 'ruleMaxAttempts', type: 'INTEGER', mode: 'NULLABLE' as const },
  { name: 'ruleWindowSeconds', type: 'INTEGER', mode: 'NULLABLE' as const },
  { name: 'ruleBlockSeconds', type: 'INTEGER', mode: 'NULLABLE' as const },
  { name: 'currentAttempts', type: 'INTEGER', mode: 'NULLABLE' as const },
  { name: 'wasBlocked', type: 'BOOLEAN', mode: 'REQUIRED' as const },
  { name: 'blockPolicy', type: 'STRING', mode: 'NULLABLE' as const },
  { name: 'blockDurationSeconds', type: 'INTEGER', mode: 'NULLABLE' as const },
  { name: 'wasSkipped', type: 'BOOLEAN', mode: 'REQUIRED' as const },
  { name: 'usedDefaultRule', type: 'BOOLEAN', mode: 'REQUIRED' as const },
];

export class RateLimitBqWriter {
  private buffer: RateLimitCheckEvent[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly tableRef: Table;
  private tableReady: Promise<void>;

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
    this.tableReady = this.ensureTable();
    this.startTimer();
  }

  /**
   * Creates the table if it doesn't exist. Runs once on startup.
   * Adding new columns to an existing table is safe — BQ supports
   * additive schema changes. Existing rows get null for new fields.
   */
  private async ensureTable(): Promise<void> {
    try {
      const [exists] = await this.tableRef.exists();
      if (!exists) {
        await this.tableRef.create({ schema: RATE_LIMIT_CHECK_SCHEMA });
      }
    } catch (err) {
      // Non-fatal — table may already exist from a race, or the service
      // account may lack bigquery.tables.create. Inserts will fail with
      // a clear error if the table truly doesn't exist.
      Sentry.captureException(err);
    }
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

    // Wait for table creation before first insert
    await this.tableReady;

    const batch = this.buffer.splice(0);
    try {
      await this.tableRef.insert(batch);
    } catch (err) {
      // Never throw — BQ failures must not affect auth
      this.statsd?.increment('rate_limit.bq_writer.flush_error');
      Sentry.captureException(err);
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
