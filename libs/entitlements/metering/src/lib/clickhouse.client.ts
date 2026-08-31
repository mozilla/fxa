/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { ClickHouseConfig } from './clickhouse.config';
import { ClickHouseError, ClickHouseTableNameError } from './metering.error';
import { toError } from './utils/toError';

const TABLE_IDENTIFIER = /^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)?$/i;

export type ClickHouseParams = Record<string, string | number>;

export interface ClickHouseQuery<T> {
  sql: string;
  rowSchema: z.ZodType<T>;
  params?: ClickHouseParams;
}

export interface ClickHouseInsert {
  table: string;
  rows: unknown[];
}

@Injectable()
export class ClickHouseClient {
  private readonly endpoint: string;
  private readonly headers: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly settings: ClickHouseParams;

  constructor(clickHouseConfig: ClickHouseConfig) {
    this.endpoint = clickHouseConfig.url;
    this.timeoutMs = clickHouseConfig.requestTimeoutMs;
    this.headers = {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-ClickHouse-User': clickHouseConfig.username,
      'X-ClickHouse-Database': clickHouseConfig.database,
    };
    if (clickHouseConfig.password) {
      this.headers['X-ClickHouse-Key'] = clickHouseConfig.password;
    }
    this.settings = {
      max_execution_time: clickHouseConfig.maxExecutionTimeSeconds,
      max_threads: clickHouseConfig.maxThreads,
      max_memory_usage: clickHouseConfig.maxMemoryUsageBytes,
      max_bytes_before_external_group_by:
        clickHouseConfig.maxBytesBeforeExternalGroupBy,
    };
  }

  async query<T>({ sql, rowSchema, params }: ClickHouseQuery<T>): Promise<T[]> {
    const search: ClickHouseParams = {
      ...this.settings,
      default_format: 'JSONEachRow',
    };
    for (const [name, value] of Object.entries(params ?? {})) {
      search[`param_${name}`] = value;
    }

    const body = await this.send('query', search, sql);
    return this.parseRows(body, rowSchema);
  }

  async insert({ table, rows }: ClickHouseInsert): Promise<void> {
    if (rows.length === 0) {
      return;
    }
    if (!TABLE_IDENTIFIER.test(table)) {
      throw new ClickHouseTableNameError(table);
    }

    await this.send(
      'insert',
      { ...this.settings, query: `INSERT INTO ${table} FORMAT JSONEachRow` },
      rows.map((row) => JSON.stringify(row)).join('\n')
    );
  }

  async command(sql: string): Promise<void> {
    await this.send('command', { ...this.settings }, sql);
  }

  private async send(
    operation: string,
    search: ClickHouseParams,
    body: string
  ): Promise<string> {
    const url = new URL(this.endpoint);
    for (const [name, value] of Object.entries(search)) {
      url.searchParams.set(name, String(value));
    }

    let response: Response;
    let text: string;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      text = await response.text();
    } catch (err) {
      throw new ClickHouseError(operation, toError(err));
    }

    if (!response.ok) {
      throw new ClickHouseError(
        operation,
        new Error(`ClickHouse responded ${response.status}: ${text.trim()}`)
      );
    }
    return text;
  }

  private parseRows<T>(body: string, rowSchema: z.ZodType<T>): T[] {
    const lines = body.split('\n').filter((line) => line.trim().length > 0);
    return lines.map((line) => {
      try {
        return rowSchema.parse(JSON.parse(line));
      } catch (err) {
        throw new ClickHouseError('parse', toError(err));
      }
    });
  }
}
