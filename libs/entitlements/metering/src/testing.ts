/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ClickHouseClient } from './lib/clickhouse.client';
import { ClickHouseConfig } from './lib/clickhouse.config';
import {
  EVENTS_TABLE,
  NOTIFICATIONS_TABLE,
  SESSIONS_TABLE,
  WATERMARKS_TABLE,
} from './lib/metering.constants';

export const INTEGRATION_CLICKHOUSE_CONFIG: ClickHouseConfig = {
  url: process.env['METERING_CLICKHOUSE_URL'] ?? 'http://127.0.0.1:8124',
  database: process.env['METERING_CLICKHOUSE_DATABASE'] ?? 'metering',
  username: process.env['METERING_CLICKHOUSE_USERNAME'] ?? 'metering_rw',
  password: process.env['METERING_CLICKHOUSE_PASSWORD'] ?? 'local_metering_dev',
  requestTimeoutMs: 30_000,
  maxExecutionTimeSeconds: 25,
  maxThreads: 2,
  maxMemoryUsageBytes: 268_435_456,
  maxBytesBeforeExternalGroupBy: 134_217_728,
};

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;

export function integrationClickHouseClient(): ClickHouseClient {
  return new ClickHouseClient(INTEGRATION_CLICKHOUSE_CONFIG);
}

export async function truncateMeteringTables(
  client: ClickHouseClient
): Promise<void> {
  for (const table of [
    EVENTS_TABLE,
    NOTIFICATIONS_TABLE,
    SESSIONS_TABLE,
    WATERMARKS_TABLE,
  ]) {
    await client.command(`TRUNCATE TABLE IF EXISTS ${table}`);
  }
}

export async function optimizeFinal(
  client: ClickHouseClient,
  table: string
): Promise<void> {
  await client.command(`OPTIMIZE TABLE ${table} FINAL`);
}

/**
 * Integration specs anchor their event times one hour in the past so inserted
 * rows always fall inside acceptance and query windows regardless of when the
 * suite runs.
 */
export function anchoredClock(): {
  anchor: Date;
  at: (offsetMs: number) => Date;
} {
  const anchor = new Date(Date.now() - 60 * 60 * 1000);
  return {
    anchor,
    at: (offsetMs: number) => new Date(anchor.getTime() + offsetMs),
  };
}
