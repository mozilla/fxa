/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { ClickHouseClient } from './clickhouse.client';
import {
  EVENTS_TABLE,
  NOTIFICATIONS_TABLE,
  SESSIONS_TABLE,
  WATERMARKS_TABLE,
} from './metering.constants';
import type {
  AdvanceWatermarkParams,
  FindNewSessionStartsParams,
  FindSessionCandidatesParams,
  FindWindowCandidatesParams,
  MeterKey,
  RecordedNotification,
  SessionStartRecord,
  SubjectsParams,
  SweepCandidate,
} from './metering.types';
import { toClickHouseDateTime } from './utils/toClickHouseDateTime';
import { toClickHouseStringArray } from './utils/toClickHouseStringArray';

const candidateRowSchema = z.object({
  subject: z.string(),
  usage: z.coerce.number(),
});

const notificationRowSchema = z.object({
  subject: z.string(),
  threshold: z.coerce.number(),
  signing_client_id: z.string(),
  last_window_id: z.string(),
  last_sent_at: z.string(),
});

const sessionRowSchema = z.object({
  subject: z.string(),
  started_at: z.string(),
});

const watermarkRowSchema = z.object({ watermark: z.string() });

export type SweepNotificationRow = z.infer<typeof notificationRowSchema>;
export type SweepSessionRow = z.infer<typeof sessionRowSchema>;

const FIND_WATERMARK_SQL = `
SELECT
    formatDateTime(
        argMax(watermark, updated_at), '%Y-%m-%dT%H:%i:%S.%fZ', 'UTC'
    ) AS watermark
FROM ${WATERMARKS_TABLE}
WHERE client_id = {clientId:String}
  AND slug = {slug:String}
HAVING count() > 0`;

const FIND_WINDOW_CANDIDATES_SQL = `
WITH active AS
(
    SELECT DISTINCT subject
    FROM ${EVENTS_TABLE}
    WHERE client_id = {clientId:String}
      AND slug = {slug:String}
      AND ingested_at >= {ingestedSince:DateTime64(3, 'UTC')}
      AND event_time >= {eventTimeFloor:DateTime64(3, 'UTC')}
)
SELECT subject, sum(amount) AS usage
FROM ${EVENTS_TABLE}
WHERE client_id = {clientId:String}
  AND slug = {slug:String}
  AND subject IN (SELECT subject FROM active)
  AND event_time >= {from:DateTime64(3, 'UTC')}
  AND event_time < {to:DateTime64(3, 'UTC')}
GROUP BY subject
HAVING usage >= {minUsage:Float64}`;

const FIND_SESSION_CANDIDATES_SQL = `
WITH open_sessions AS
(
    SELECT subject, max(session_start) AS started_at
    FROM ${SESSIONS_TABLE}
    WHERE client_id = {clientId:String}
      AND slug = {slug:String}
    GROUP BY subject
    HAVING started_at > {expiredBefore:DateTime64(3, 'UTC')}
)
SELECT e.subject AS subject, sum(e.amount) AS usage
FROM ${EVENTS_TABLE} AS e
INNER JOIN open_sessions AS s ON e.subject = s.subject
WHERE e.client_id = {clientId:String}
  AND e.slug = {slug:String}
  -- ClickHouse does not push join keys into the events scan, so without this
  -- prefilter the join reads every subject in the window
  AND e.subject IN (SELECT subject FROM open_sessions)
  AND e.event_time >= {expiredBefore:DateTime64(3, 'UTC')}
  AND e.event_time < {to:DateTime64(3, 'UTC')}
  AND e.event_time >= s.started_at
GROUP BY e.subject
HAVING usage >= {minUsage:Float64}`;

const FIND_NEW_SESSION_STARTS_SQL = `
WITH
last_session AS
(
    SELECT subject, max(session_start) AS started_at
    FROM ${SESSIONS_TABLE}
    WHERE client_id = {clientId:String}
      AND slug = {slug:String}
    GROUP BY subject
),
recent AS
(
    SELECT subject, min(event_time) AS first_event
    FROM ${EVENTS_TABLE}
    WHERE client_id = {clientId:String}
      AND slug = {slug:String}
      AND ingested_at >= {ingestedSince:DateTime64(3, 'UTC')}
      AND event_time >= {eventTimeFloor:DateTime64(3, 'UTC')}
      AND event_time < {to:DateTime64(3, 'UTC')}
    GROUP BY subject
)
SELECT
    r.subject AS subject,
    formatDateTime(r.first_event, '%Y-%m-%dT%H:%i:%S.%fZ', 'UTC') AS started_at
FROM recent AS r
LEFT JOIN last_session AS l ON r.subject = l.subject
WHERE r.first_event > coalesce(l.started_at, toDateTime64(0, 3, 'UTC')) + toIntervalSecond({durationSeconds:UInt32})`;

const FIND_LAST_NOTIFICATIONS_SQL = `
SELECT
    subject,
    threshold,
    signing_client_id,
    argMax(window_id, sent_at) AS last_window_id,
    formatDateTime(max(sent_at), '%Y-%m-%dT%H:%i:%S.%fZ', 'UTC') AS last_sent_at
FROM ${NOTIFICATIONS_TABLE}
WHERE client_id = {clientId:String}
  AND slug = {slug:String}
  AND subject IN {subjects:Array(String)}
GROUP BY subject, threshold, signing_client_id`;

const FIND_SESSION_STARTS_SQL = `
SELECT
    subject,
    formatDateTime(max(session_start), '%Y-%m-%dT%H:%i:%S.%fZ', 'UTC') AS started_at
FROM ${SESSIONS_TABLE}
WHERE client_id = {clientId:String}
  AND slug = {slug:String}
  AND subject IN {subjects:Array(String)}
GROUP BY subject`;

@Injectable()
export class MeteringSweepRepository {
  constructor(private readonly clickHouseClient: ClickHouseClient) {}

  async findWindowCandidates(
    params: FindWindowCandidatesParams
  ): Promise<SweepCandidate[]> {
    return this.clickHouseClient.query({
      sql: FIND_WINDOW_CANDIDATES_SQL,
      rowSchema: candidateRowSchema,
      params: {
        clientId: params.clientId,
        slug: params.slug,
        from: toClickHouseDateTime(params.from),
        to: toClickHouseDateTime(params.to),
        ingestedSince: toClickHouseDateTime(params.ingestedSince),
        eventTimeFloor: toClickHouseDateTime(params.eventTimeFloor),
        minUsage: params.minUsage,
      },
    });
  }

  async findSessionCandidates(
    params: FindSessionCandidatesParams
  ): Promise<SweepCandidate[]> {
    return this.clickHouseClient.query({
      sql: FIND_SESSION_CANDIDATES_SQL,
      rowSchema: candidateRowSchema,
      params: {
        clientId: params.clientId,
        slug: params.slug,
        expiredBefore: toClickHouseDateTime(params.expiredBefore),
        to: toClickHouseDateTime(params.to),
        minUsage: params.minUsage,
      },
    });
  }

  async findLastNotifications(
    params: SubjectsParams
  ): Promise<SweepNotificationRow[]> {
    return this.clickHouseClient.query({
      sql: FIND_LAST_NOTIFICATIONS_SQL,
      rowSchema: notificationRowSchema,
      params: {
        clientId: params.clientId,
        slug: params.slug,
        subjects: toClickHouseStringArray(params.subjects),
      },
    });
  }

  async findSessionStarts(params: SubjectsParams): Promise<SweepSessionRow[]> {
    return this.clickHouseClient.query({
      sql: FIND_SESSION_STARTS_SQL,
      rowSchema: sessionRowSchema,
      params: {
        clientId: params.clientId,
        slug: params.slug,
        subjects: toClickHouseStringArray(params.subjects),
      },
    });
  }

  async findNewSessionStarts(
    params: FindNewSessionStartsParams
  ): Promise<SweepSessionRow[]> {
    return this.clickHouseClient.query({
      sql: FIND_NEW_SESSION_STARTS_SQL,
      rowSchema: sessionRowSchema,
      params: {
        clientId: params.clientId,
        slug: params.slug,
        ingestedSince: toClickHouseDateTime(params.ingestedSince),
        eventTimeFloor: toClickHouseDateTime(params.eventTimeFloor),
        to: toClickHouseDateTime(params.to),
        durationSeconds: Math.ceil(params.durationMs / 1000),
      },
    });
  }

  async findWatermark(params: MeterKey): Promise<string | null> {
    const rows = await this.clickHouseClient.query({
      sql: FIND_WATERMARK_SQL,
      rowSchema: watermarkRowSchema,
      params: { clientId: params.clientId, slug: params.slug },
    });
    return rows.at(0)?.watermark ?? null;
  }

  async advanceWatermark(params: AdvanceWatermarkParams): Promise<void> {
    await this.clickHouseClient.insert({
      table: WATERMARKS_TABLE,
      rows: [
        {
          client_id: params.clientId,
          slug: params.slug,
          watermark: toClickHouseDateTime(params.watermark),
          updated_at: toClickHouseDateTime(params.updatedAt),
        },
      ],
    });
  }

  async recordNotifications(
    notifications: RecordedNotification[]
  ): Promise<void> {
    await this.clickHouseClient.insert({
      table: NOTIFICATIONS_TABLE,
      rows: notifications.map((notification) => ({
        client_id: notification.clientId,
        slug: notification.slug,
        subject: notification.subject,
        threshold: notification.threshold,
        signing_client_id: notification.signingClientId,
        window_id: notification.windowId ?? '',
        sent_at: toClickHouseDateTime(notification.sentAt),
      })),
    });
  }

  async recordSessionStarts(sessions: SessionStartRecord[]): Promise<void> {
    await this.clickHouseClient.insert({
      table: SESSIONS_TABLE,
      rows: sessions.map((session) => ({
        client_id: session.clientId,
        slug: session.slug,
        subject: session.subject,
        session_start: toClickHouseDateTime(session.sessionStart),
      })),
    });
  }
}
