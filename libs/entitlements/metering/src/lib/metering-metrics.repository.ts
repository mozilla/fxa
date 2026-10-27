/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { ClickHouseClient } from './clickhouse.client';
import { EVENTS_TABLE, NOTIFICATIONS_TABLE } from './metering.constants';
import type {
  FindActiveSubjectCountParams,
  FindNotifiedSubjectCountsParams,
} from './metering.types';
import { toClickHouseDateTime } from './utils/toClickHouseDateTime';

const activeSubjectCountRowSchema = z.object({
  subject_count: z.coerce.number(),
});

const notifiedSubjectCountRowSchema = z.object({
  threshold: z.coerce.number(),
  subject_count: z.coerce.number(),
});

export type NotifiedSubjectCountRow = z.infer<
  typeof notifiedSubjectCountRowSchema
>;

const FIND_ACTIVE_SUBJECT_COUNT_SQL = `
SELECT uniq(subject) AS subject_count
FROM ${EVENTS_TABLE}
WHERE client_id = {clientId:String}
  AND slug = {slug:String}
  AND event_time >= {from:DateTime64(3, 'UTC')}
  AND event_time < {to:DateTime64(3, 'UTC')}`;

const FIND_NOTIFIED_SUBJECT_COUNTS_SQL = `
SELECT threshold, uniq(subject) AS subject_count
FROM ${NOTIFICATIONS_TABLE}
WHERE client_id = {clientId:String}
  AND slug = {slug:String}
  AND threshold IN {thresholds:Array(Float64)}
  AND sent_at >= {from:DateTime64(3, 'UTC')}
  AND sent_at < {to:DateTime64(3, 'UTC')}
GROUP BY threshold`;

@Injectable()
export class MeteringMetricsRepository {
  constructor(private readonly clickHouseClient: ClickHouseClient) {}

  async findActiveSubjectCount(
    params: FindActiveSubjectCountParams
  ): Promise<number> {
    const rows = await this.clickHouseClient.query({
      sql: FIND_ACTIVE_SUBJECT_COUNT_SQL,
      rowSchema: activeSubjectCountRowSchema,
      params: {
        clientId: params.clientId,
        slug: params.slug,
        from: toClickHouseDateTime(params.from),
        to: toClickHouseDateTime(params.to),
      },
    });
    return rows.at(0)?.subject_count ?? 0;
  }

  async findNotifiedSubjectCounts(
    params: FindNotifiedSubjectCountsParams
  ): Promise<NotifiedSubjectCountRow[]> {
    return this.clickHouseClient.query({
      sql: FIND_NOTIFIED_SUBJECT_COUNTS_SQL,
      rowSchema: notifiedSubjectCountRowSchema,
      params: {
        clientId: params.clientId,
        slug: params.slug,
        thresholds: JSON.stringify(params.thresholds),
        from: toClickHouseDateTime(params.from),
        to: toClickHouseDateTime(params.to),
      },
    });
  }
}
