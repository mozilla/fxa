/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

import { ClickHouseClient } from './clickhouse.client';
import { ClickHouseConfig } from './clickhouse.config';
import { ClickHouseError, ClickHouseTableNameError } from './metering.error';

const rowSchema = z.object({ subject: z.string(), usage: z.number() });

describe('ClickHouseClient', () => {
  let client: ClickHouseClient;
  let fetchMock: jest.SpyInstance;

  const config: ClickHouseConfig = {
    url: 'https://clickhouse.example.com:8443',
    database: 'metering',
    username: 'metering_rw',
    password: 'secret-value',
    requestTimeoutMs: 5_000,
    maxExecutionTimeSeconds: 7,
    maxThreads: 3,
    maxMemoryUsageBytes: 111_000,
    maxBytesBeforeExternalGroupBy: 55_000,
  };

  function respondWith(body: string, status = 200): void {
    fetchMock.mockResolvedValue(
      new Response(body, { status, statusText: status === 200 ? 'OK' : 'Bad' })
    );
  }

  function requestUrl(): URL {
    return new URL(String(fetchMock.mock.calls[0][0]));
  }

  function requestInit(): RequestInit {
    return fetchMock.mock.calls[0][1];
  }

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
    client = new ClickHouseClient(config);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  describe('query', () => {
    it('parses JSONEachRow output into validated rows', async () => {
      respondWith(
        '{"subject":"user-1","usage":10}\n{"subject":"user-2","usage":4}\n'
      );

      const rows = await client.query({ sql: 'SELECT 1', rowSchema });

      expect(rows).toEqual([
        { subject: 'user-1', usage: 10 },
        { subject: 'user-2', usage: 4 },
      ]);
    });

    it('returns an empty array for an empty result', async () => {
      respondWith('');

      await expect(
        client.query({ sql: 'SELECT 1', rowSchema })
      ).resolves.toEqual([]);
    });

    it('requests JSONEachRow and applies the configured execution settings', async () => {
      respondWith('');

      await client.query({ sql: 'SELECT 1', rowSchema });

      const url = requestUrl();
      expect(url.searchParams.get('default_format')).toBe('JSONEachRow');
      expect(url.searchParams.get('max_execution_time')).toBe('7');
      expect(url.searchParams.get('max_threads')).toBe('3');
      expect(url.searchParams.get('max_memory_usage')).toBe('111000');
      expect(url.searchParams.get('max_bytes_before_external_group_by')).toBe(
        '55000'
      );
    });

    it('sends the sql as the request body', async () => {
      respondWith('');

      await client.query({ sql: 'SELECT sum(amount) FROM t', rowSchema });

      expect(requestInit().body).toBe('SELECT sum(amount) FROM t');
    });

    it('passes bound parameters as param_ query arguments', async () => {
      respondWith('');

      await client.query({
        sql: 'SELECT 1 WHERE slug = {slug:String}',
        rowSchema,
        params: { slug: 'tokens', limit: 5 },
      });

      const url = requestUrl();
      expect(url.searchParams.get('param_slug')).toBe('tokens');
      expect(url.searchParams.get('param_limit')).toBe('5');
    });

    it('sends the credentials as ClickHouse headers', async () => {
      respondWith('');

      await client.query({ sql: 'SELECT 1', rowSchema });

      expect(requestInit().headers).toEqual(
        expect.objectContaining({
          'X-ClickHouse-User': 'metering_rw',
          'X-ClickHouse-Key': 'secret-value',
          'X-ClickHouse-Database': 'metering',
        })
      );
    });

    it('omits the key header when no password is configured', async () => {
      respondWith('');
      const noPassword = new ClickHouseClient({
        ...config,
        password: undefined,
      });

      await noPassword.query({ sql: 'SELECT 1', rowSchema });

      expect(requestInit().headers).not.toHaveProperty('X-ClickHouse-Key');
    });

    it('throws ClickHouseError on a non-2xx response', async () => {
      respondWith('Code: 62. DB::Exception: Syntax error', 400);

      await expect(
        client.query({ sql: 'SELECT bad', rowSchema })
      ).rejects.toThrow(ClickHouseError);
    });

    it('throws ClickHouseError when the transport fails', async () => {
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(
        client.query({ sql: 'SELECT 1', rowSchema })
      ).rejects.toThrow(ClickHouseError);
    });

    it('throws ClickHouseError when a row fails schema validation', async () => {
      respondWith('{"subject":"user-1","usage":"not-a-number"}\n');

      await expect(
        client.query({ sql: 'SELECT 1', rowSchema })
      ).rejects.toThrow(ClickHouseError);
    });

    it('throws ClickHouseError when a row is not valid JSON', async () => {
      respondWith('{"subject":\n');

      await expect(
        client.query({ sql: 'SELECT 1', rowSchema })
      ).rejects.toThrow(ClickHouseError);
    });
  });

  describe('insert', () => {
    it('sends rows as newline-delimited JSON', async () => {
      respondWith('');

      await client.insert({
        table: 'metering.events',
        rows: [{ subject: 'user-1' }, { subject: 'user-2' }],
      });

      expect(requestInit().body).toBe(
        '{"subject":"user-1"}\n{"subject":"user-2"}'
      );
    });

    it('declares the insert format in the query argument', async () => {
      respondWith('');

      await client.insert({
        table: 'metering.events',
        rows: [{ subject: 'user-1' }],
      });

      expect(requestUrl().searchParams.get('query')).toBe(
        'INSERT INTO metering.events FORMAT JSONEachRow'
      );
    });

    it('makes no request for an empty batch', async () => {
      await client.insert({ table: 'metering.events', rows: [] });

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects a table name that is not a plain identifier', async () => {
      await expect(
        client.insert({
          table: 'metering.events; DROP TABLE metering.events',
          rows: [{ subject: 'user-1' }],
        })
      ).rejects.toThrow(ClickHouseTableNameError);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws ClickHouseError on a non-2xx response', async () => {
      respondWith('Code: 60. DB::Exception: Unknown table', 404);

      await expect(
        client.insert({ table: 'metering.events', rows: [{ subject: 'a' }] })
      ).rejects.toThrow(ClickHouseError);
    });
  });

  describe('command', () => {
    it('sends the statement as the request body', async () => {
      respondWith('');

      await client.command(
        'CREATE TABLE metering.events (x UInt8) ENGINE = Memory'
      );

      expect(requestInit().body).toBe(
        'CREATE TABLE metering.events (x UInt8) ENGINE = Memory'
      );
    });

    it('throws ClickHouseError on a non-2xx response', async () => {
      respondWith('Code: 57. DB::Exception: Table already exists', 400);

      await expect(client.command('CREATE TABLE t (x UInt8)')).rejects.toThrow(
        ClickHouseError
      );
    });
  });
});
