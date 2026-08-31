/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { z } from 'zod';

import { ClickHouseClient } from './clickhouse.client';
import {
  anchoredClock,
  DAY_MS,
  INTEGRATION_CLICKHOUSE_CONFIG,
  integrationClickHouseClient,
  optimizeFinal,
  truncateMeteringTables,
} from '../testing';
import { MeteringEventsRepository } from './metering-events.repository';
import { ClickHouseError } from './metering.error';
import { MeteringEventsManager } from './metering-events.manager';
import { hashEventId } from './utils/hashEventId';

const { at } = anchoredClock();

const CLIENT_ID = 'vpn';
const SLUG = 'tokens';
const SUBJECT = 'user-1';
const WINDOW = {
  from: at(-14.5 * DAY_MS),
  to: at(16.5 * DAY_MS),
};
const INTEGRATION_DB = INTEGRATION_CLICKHOUSE_CONFIG.database;
const eventTimeRowSchema = z.object({ t: z.string() });

describe('MeteringEventsManager against a real ClickHouse', () => {
  let client: ClickHouseClient;
  let manager: MeteringEventsManager;

  function event(override: {
    id: string;
    amount: number;
    eventTime: string;
    ingestedAt?: string;
    subject?: string;
    clientId?: string;
    slug?: string;
  }) {
    return {
      eventIdHash: hashEventId(override.id),
      clientId: override.clientId ?? CLIENT_ID,
      slug: override.slug ?? SLUG,
      subject: override.subject ?? SUBJECT,
      amount: override.amount,
      eventTime: new Date(override.eventTime),
      ingestedAt: new Date(override.ingestedAt ?? override.eventTime),
    };
  }

  function sum(overrides: Partial<typeof WINDOW> = {}) {
    return manager.sumUsage({
      clientId: CLIENT_ID,
      slug: SLUG,
      subject: SUBJECT,
      ...WINDOW,
      ...overrides,
    });
  }

  beforeAll(() => {
    client = integrationClickHouseClient();
    manager = new MeteringEventsManager(new MeteringEventsRepository(client));
  });

  beforeEach(async () => {
    await truncateMeteringTables(client);
  });

  it('returns 0 for a subject with no events', async () => {
    await expect(sum()).resolves.toBe(0);
  });

  it('sums the amounts inside the window', async () => {
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 10,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
      }),
      event({
        id: 'e2',
        amount: 32,
        eventTime: at(-12.5 * DAY_MS).toISOString(),
      }),
    ]);

    await expect(sum()).resolves.toBe(42);
  });

  it('excludes events before the window start', async () => {
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 10,
        eventTime: at(-14.5 * DAY_MS - 1).toISOString(),
      }),
    ]);

    await expect(sum()).resolves.toBe(0);
  });

  it('treats the window end as exclusive', async () => {
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 10,
        eventTime: at(16.5 * DAY_MS).toISOString(),
      }),
      event({
        id: 'e2',
        amount: 7,
        eventTime: at(16.5 * DAY_MS - 1).toISOString(),
      }),
    ]);

    await expect(sum()).resolves.toBe(7);
  });

  it('collapses a duplicate row once the ReplacingMergeTree backstop merges', async () => {
    const retried = event({
      id: 'e1',
      amount: 10,
      eventTime: at(-13.5 * DAY_MS).toISOString(),
    });
    await manager.insertEvents([retried]);
    await manager.insertEvents([retried]);

    await optimizeFinal(client, 'events');
    await expect(sum()).resolves.toBe(10);
  });

  it('keeps the latest ingested copy when duplicate rows merge', async () => {
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 5,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
        ingestedAt: at(-13.5 * DAY_MS).toISOString(),
      }),
    ]);
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 50,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
        ingestedAt: at(-13.5 * DAY_MS + 1000).toISOString(),
      }),
    ]);

    await optimizeFinal(client, 'events');
    await expect(sum()).resolves.toBe(50);
  });

  it('isolates usage by client_id', async () => {
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 10,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
      }),
      event({
        id: 'e2',
        amount: 999,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
        clientId: 'relay',
      }),
    ]);

    await expect(sum()).resolves.toBe(10);
  });

  it('isolates usage by slug', async () => {
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 10,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
      }),
      event({
        id: 'e2',
        amount: 999,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
        slug: 'other',
      }),
    ]);

    await expect(sum()).resolves.toBe(10);
  });

  it('isolates usage by subject', async () => {
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 10,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
      }),
      event({
        id: 'e2',
        amount: 999,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
        subject: 'user-2',
      }),
    ]);

    await expect(sum()).resolves.toBe(10);
  });

  it('round-trips millisecond precision on the window boundary', async () => {
    await manager.insertEvents([
      event({ id: 'e1', amount: 3, eventTime: at(2096789).toISOString() }),
    ]);

    await expect(
      sum({
        from: at(2096789),
        to: at(2096790),
      })
    ).resolves.toBe(3);
    await expect(
      sum({
        from: at(2096790),
        to: at(2097000),
      })
    ).resolves.toBe(0);
  });

  it('surfaces a ClickHouseError when a query exceeds the memory ceiling', async () => {
    await manager.insertEvents([
      event({
        id: 'e1',
        amount: 10,
        eventTime: at(-13.5 * DAY_MS).toISOString(),
      }),
    ]);
    const capped = new MeteringEventsManager(
      new MeteringEventsRepository(
        new ClickHouseClient({
          ...INTEGRATION_CLICKHOUSE_CONFIG,
          maxMemoryUsageBytes: 1,
          maxBytesBeforeExternalGroupBy: 1,
        })
      )
    );

    await expect(
      capped.sumUsage({
        clientId: CLIENT_ID,
        slug: SLUG,
        subject: SUBJECT,
        ...WINDOW,
      })
    ).rejects.toThrow(ClickHouseError);
  });

  it('stores event_time in UTC regardless of the server timezone', async () => {
    await manager.insertEvents([
      event({ id: 'e1', amount: 1, eventTime: at(0).toISOString() }),
    ]);

    const rows = await client.query({
      sql: `SELECT formatDateTime(event_time, '%Y-%m-%dT%H:%i:%S.%fZ', 'UTC') AS t
            FROM ${INTEGRATION_DB}.events`,
      rowSchema: eventTimeRowSchema,
    });

    expect(rows[0].t).toBe(at(0).toISOString().replace('Z', '000Z'));
  });
});
