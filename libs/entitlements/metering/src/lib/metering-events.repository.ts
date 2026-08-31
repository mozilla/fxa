/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { ClickHouseClient } from './clickhouse.client';
import { EVENTS_TABLE } from './metering.constants';
import type { MeteringEventInput, SumUsageParams } from './metering.types';
import { toClickHouseDateTime } from './utils/toClickHouseDateTime';

const usageRowSchema = z.object({ usage: z.coerce.number() });

const SUM_USAGE_SQL = `
SELECT sum(amount) AS usage
FROM ${EVENTS_TABLE}
WHERE client_id = {clientId:String}
  AND slug = {slug:String}
  AND subject = {subject:String}
  AND event_time >= {from:DateTime64(3, 'UTC')}
  AND event_time < {to:DateTime64(3, 'UTC')}`;

@Injectable()
export class MeteringEventsRepository {
  constructor(private readonly clickHouseClient: ClickHouseClient) {}

  async insertEvents(events: MeteringEventInput[]): Promise<void> {
    await this.clickHouseClient.insert({
      table: EVENTS_TABLE,
      rows: events.map((event) => ({
        event_id_hash: event.eventIdHash,
        client_id: event.clientId,
        slug: event.slug,
        subject: event.subject,
        amount: event.amount,
        event_time: toClickHouseDateTime(event.eventTime),
        ingested_at: toClickHouseDateTime(event.ingestedAt),
      })),
    });
  }

  async sumUsage(params: SumUsageParams): Promise<number> {
    const rows = await this.clickHouseClient.query({
      sql: SUM_USAGE_SQL,
      rowSchema: usageRowSchema,
      params: {
        clientId: params.clientId,
        slug: params.slug,
        subject: params.subject,
        from: toClickHouseDateTime(params.from),
        to: toClickHouseDateTime(params.to),
      },
    });

    return rows.at(0)?.usage ?? 0;
  }
}
