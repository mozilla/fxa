/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { BigQuery } from '@google-cloud/bigquery';
import type { StatsD } from 'hot-shots';
import type { storage_v1 } from 'googleapis';
import {
  Account,
  Email,
  SecurityEvent,
  SessionToken as SessionTokenOrm,
} from 'fxa-shared/db/models/auth';
import { SessionToken } from 'fxa-shared/connected-services/models/SessionToken';
import { EVENT_NAMES } from 'fxa-shared/db/models/auth/security-event';

export const setDateToUTC = (someDate: number) => {
  const utcDate = new Date(someDate);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
};

// Creation date of the oldest verified account and the scan lower bound.
// (This _could_ change if the oldest account is also an _inactive_ account.
// But it's unknown at this point.)
export const OLDEST_ACCOUNT_DATE = '2014-01-18';

export type PreviousScanRange = {
  previous_start_date: string;
  previous_end_date: string;
};

export type ScanRangeInput = {
  now: number;
  scanWindowDays: number;

  // Validated CLI dates timestamps in milliseconds.
  cliRange?: { start: number; end: number };

  // Undefined means no state URL is configured; null means the object is missing.
  previousScanRange?: PreviousScanRange | null;
};

export type ScanRange = {
  // Inclusive scan dates in YYYY-MM-DD format, for saving to the state object.
  startDate: string;
  endDate: string;

  // UTC timestamps in milliseconds, with an inclusive start and exclusive end.
  startTimestamp: number;
  endTimestamp: number;

  rolledOver: boolean;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 86400000;
const toIsoDate = (utcMidnight: number) =>
  new Date(utcMidnight).toISOString().substring(0, 10);
export const getActivityCutoffDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear() - 2;
  const month = date.getUTCMonth();
  // day 0 of next month is last day of current month... for leap years
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(date.getUTCDate(), lastDayOfMonth));
};

// Exclude the anniversary day so every scanned day is fully two years old.
export const getLatestScanDate = (timestamp: number) =>
  getActivityCutoffDate(timestamp) - DAY_IN_MS;

// Parses a valid YYYY-MM-DD date as a UTC midnight timestamp in milliseconds.
export const parseScanDate = (value: unknown, label: string) => {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) {
    throw new Error(`${label} must be a date in YYYY-MM-DD format.`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  if (toIsoDate(timestamp) !== value) {
    throw new Error(`${label} is not a valid calendar date: ${value}`);
  }
  return timestamp;
};

// The googleapis Storage v1 methods used to read and save scan ranges.
export type ScanStateStorage = {
  objects: {
    // The response data contains object metadata, or the body when alt is 'media'.
    get(
      params: storage_v1.Params$Resource$Objects$Get
    ): Promise<{ data: unknown }>;
    insert(
      params: storage_v1.Params$Resource$Objects$Insert
    ): Promise<{ data: storage_v1.Schema$Object }>;
  };
};

export const parseGcsUrl = (url: string) => {
  const match = /^gs:\/\/([^/]+)\/(.+)$/.exec(url);
  if (!match) {
    throw new Error(`State file must be a gs://bucket/object URL: ${url}`);
  }
  return { bucket: match[1], object: match[2] };
};

export const validatePreviousScanRange = (
  previousScanRange: unknown
): PreviousScanRange => {
  if (
    !previousScanRange ||
    typeof previousScanRange !== 'object' ||
    Array.isArray(previousScanRange)
  ) {
    throw new Error('Previous scan range must be a JSON object.');
  }
  const { previous_start_date, previous_end_date } =
    previousScanRange as Record<string, unknown>;
  const start = parseScanDate(previous_start_date, 'previous_start_date');
  const end = parseScanDate(previous_end_date, 'previous_end_date');
  if (end < start) {
    throw new Error(
      'previous_end_date must be on the same day or later than previous_start_date.'
    );
  }
  return {
    previous_start_date: previous_start_date as string,
    previous_end_date: previous_end_date as string,
  };
};

export const loadPreviousScanRange = async (
  storage: ScanStateStorage,
  url: string
): Promise<PreviousScanRange | null> => {
  const { bucket, object } = parseGcsUrl(url);

  try {
    const { data } = await storage.objects.get({
      bucket,
      object,
      alt: 'media',
    });
    return validatePreviousScanRange(data);
  } catch (err) {
    if (err?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const savePreviousScanRange = async (
  storage: ScanStateStorage,
  url: string,
  { previous_start_date, previous_end_date }: PreviousScanRange
) => {
  const { bucket, object } = parseGcsUrl(url);
  await storage.objects.insert({
    bucket,
    name: object,
    media: {
      mimeType: 'application/json',
      body: JSON.stringify({ previous_start_date, previous_end_date }),
    },
  });
};

export const resolveScanRange = ({
  now,
  scanWindowDays,
  cliRange,
  previousScanRange,
}: ScanRangeInput): ScanRange => {
  const oldest = parseScanDate(OLDEST_ACCOUNT_DATE, 'Oldest account date');
  const latest = getLatestScanDate(now);

  let start = oldest;
  let end = latest;
  let rolledOver = false;

  if (previousScanRange === null) {
    if (!cliRange) {
      throw new Error(
        'No previous scan range found. Supply the --start-date and --end-date CLI args, or seed the GCS object.'
      );
    }
  } else if (previousScanRange) {
    const previousStart = parseScanDate(
      validatePreviousScanRange(previousScanRange).previous_start_date,
      'previous_start_date'
    );
    start = previousStart - scanWindowDays * DAY_IN_MS;
    end = previousStart - DAY_IN_MS;
    if (end < oldest) {
      end = latest;
      start = latest - (scanWindowDays - 1) * DAY_IN_MS;
      rolledOver = true;
    }
  }

  if (cliRange) {
    start = cliRange.start;
    end = cliRange.end;
    rolledOver = false;
  }

  if (end < oldest || start > latest) {
    throw new Error(
      `The date range ${toIsoDate(start)} to ${toIsoDate(end)} is outside the eligible range ${toIsoDate(oldest)} to ${toIsoDate(latest)}.`
    );
  }
  const boundedStart = Math.max(start, oldest);
  const boundedEnd = Math.min(end, latest);

  return {
    startDate: toIsoDate(boundedStart),
    endDate: toIsoDate(boundedEnd),
    startTimestamp: boundedStart,
    endTimestamp: boundedEnd + DAY_IN_MS,
    rolledOver,
  };
};

export const emailUidsQuery = (activeByDateTimestamp) =>
  Email.query()
    .distinct('uid')
    .where('verifiedAt', '>=', activeByDateTimestamp)
    .as('emailUids');

export const sessionTokenUidsQuery = (activeByDateTimestamp) =>
  SessionTokenOrm.query()
    .distinct('uid')
    .where('lastAccessTime', '>=', activeByDateTimestamp)
    .as('sessionTokenUids');

export const securityEventUidsQuery = (activeByDateTimestamp) =>
  SecurityEvent.query()
    .distinct('uid')
    .where('createdAt', '>=', activeByDateTimestamp)
    .whereIn('nameId', [
      EVENT_NAMES['account.login'],
      EVENT_NAMES['account.password_reset_success'],
      EVENT_NAMES['account.password_changed'],
      EVENT_NAMES['session.destroy'],
    ])
    .as('securityEventUids');

export const accountWhereAndOrderByQueryBuilder = (
  startDateTimestamp,
  endDateTimestamp,
  activeByDateTimestamp
) => {
  const emailUids = emailUidsQuery(activeByDateTimestamp);
  const sessionTokenUids = sessionTokenUidsQuery(activeByDateTimestamp);
  const securityEventUids = securityEventUidsQuery(activeByDateTimestamp);

  return Account.query()
    .leftJoin(emailUids, 'emailUids.uid', 'accounts.uid')
    .leftJoin(sessionTokenUids, 'sessionTokenUids.uid', 'accounts.uid')
    .leftJoin(securityEventUids, 'securityEventUids.uid', 'accounts.uid')
    .where('accounts.emailVerified', 1)
    .where('accounts.createdAt', '>=', startDateTimestamp)
    .where('accounts.createdAt', '<', endDateTimestamp)
    .where((builder) => {
      builder
        .whereNull('emailUids.uid')
        .whereNull('sessionTokenUids.uid')
        .whereNull('securityEventUids.uid');
    })
    .orderBy('accounts.createdAt', 'asc')
    .orderBy('accounts.uid', 'asc');
};

export type GetTokensFn<T> = (uid: string) => Promise<T[]>;

// this includes the agumented last access time from redis
export const hasActiveSessionToken = async (
  tokensFn: GetTokensFn<SessionToken>,
  uid: string,
  activeByDateTimestamp: number
) => {
  const sessionTokens = await tokensFn(uid);
  return sessionTokens.some(
    (token) =>
      token.lastAccessTime && token.lastAccessTime >= activeByDateTimestamp
  );
};
export const hasActiveRefreshToken = async (
  tokensFn: GetTokensFn<{ lastUsedAt: number }>,
  uid: string,
  activeByDateTimestamp: number
) => {
  const refreshTokens = await tokensFn(uid);
  return refreshTokens.some((t) => t.lastUsedAt >= activeByDateTimestamp);
};
export const hasAccessToken = async (
  tokensFn: GetTokensFn<{ lastUsedAt: number }>,
  uid: string
) => {
  const accessTokens = await tokensFn(uid);
  return accessTokens.length > 0;
};

export type ActiveConditionFn = (
  uid: string
) => Promise<boolean> | Promise<Promise<boolean>>;

/**
 * This simple builder exists purely to make it clear, and in one place, what
 * conditions are required to consider an account (in)active, in addition to
 * the DB query conditions.
 */
export class IsActiveFnBuilder {
  // @TODO we need to add in the RP exclusion check here if it's not possible with MySQL

  requiredFn = (message: string) => () => {
    throw new Error(message);
  };
  activeSessionTokenFn: ActiveConditionFn;
  refreshTokenFn: ActiveConditionFn;
  accessTokenFn: ActiveConditionFn;

  constructor() {
    this.activeSessionTokenFn = this.requiredFn(
      'A function to check for an active session token is required.'
    );
    this.refreshTokenFn = this.requiredFn(
      'A function to check for a refresh token is required.'
    );
    this.accessTokenFn = this.requiredFn(
      'A function to check for an access token is required.'
    );
  }

  setActiveSessionTokenFn(fn: ActiveConditionFn) {
    this.activeSessionTokenFn = fn;
    return this;
  }

  setRefreshTokenFn(fn: ActiveConditionFn) {
    this.refreshTokenFn = fn;
    return this;
  }

  setAccessTokenFn(fn: ActiveConditionFn) {
    this.accessTokenFn = fn;
    return this;
  }

  build() {
    return (async (uid: string) =>
      (await this.activeSessionTokenFn(uid)) ||
      (await this.refreshTokenFn(uid)) ||
      (await this.accessTokenFn(uid))).bind(this);
  }
}

export const getActiveAccountLists = async (
  bq: BigQuery,
  qualifiedDatasetId: string,
  maxAgeDays: number,
  statsd: Pick<StatsD, 'increment'>
) => {
  const [projectId, datasetId] = qualifiedDatasetId.split('.');
  const [tables] = await bq.dataset(datasetId, { projectId }).getTables();
  if (!tables.length) {
    throw new Error(
      `Active accounts dataset contains no tables: ${qualifiedDatasetId}`
    );
  }

  const oldestAllowed = Date.now() - maxAgeDays * 86400000;
  let hasInvalidTables = false;

  for (const table of tables) {
    const [metadata] = await table.getMetadata();
    const numRows = Number(metadata.numRows);
    const lastModifiedTime = Number(metadata.lastModifiedTime);
    const tablePath = `${qualifiedDatasetId}.${table.id}`;

    if (
      !Number.isFinite(numRows) ||
      numRows < 0 ||
      !Number.isFinite(lastModifiedTime) ||
      lastModifiedTime <= 0
    ) {
      throw new Error(
        `Cannot validate active account table metadata: ${tablePath}`
      );
    }

    const problems: string[] = [];
    if (numRows === 0) problems.push('empty');
    if (lastModifiedTime < oldestAllowed) problems.push('stale');

    for (const problem of problems) {
      hasInvalidTables = true;
      statsd.increment(`accounts.inactive.active-account-table.${problem}`, {
        client_id: String(table.id),
      });
      console.error(`Active account table is ${problem}: ${tablePath}`);
    }
  }

  if (hasInvalidTables) {
    throw new Error('Active account tables are empty or stale.');
  }

  return tables.map((table) => `${qualifiedDatasetId}.${table.id}.uid`);
};

export const buildExclusionsTempTableQuery = (
  tempTableName: string,
  exclusionLists: string[]
) => {
  const createTempTable = `CREATE TEMP TABLE ${tempTableName}(uid STRING(32))`;

  if (!exclusionLists.length) {
    return createTempTable;
  }

  const listQueries = [...new Set(exclusionLists)].map((resourcePath) => {
    const parts = resourcePath.split('.');
    const columnName = parts[parts.length - 1];
    const resourceId = parts.slice(0, parts.length - 1).join('.');

    return `
      (SELECT \`${columnName}\` AS uid FROM \`${resourceId}\`)
      `;
  });

  return `${createTempTable}
  AS (
      ${listQueries.join(`
      UNION DISTINCT
  `)}
  )`;
};
