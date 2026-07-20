/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { knex, Knex } from 'knex';
import { performance } from 'perf_hooks';
import { promisify } from 'util';
import { ILogger } from '../log';

import { MySQLConfig } from './config';
import { BaseModel } from './models/base';
import { BaseAuthModel } from './models/auth';
import { ProfileBaseModel } from './models/profile';

const REQUIRED_SQL_MODES = ['STRICT_ALL_TABLES', 'NO_ENGINE_SUBSTITUTION'];

const SQL_VERBS = new Set([
  'select',
  'insert',
  'update',
  'delete',
  'replace',
  'call',
]);

/**
 * Derive a bounded, low-cardinality operation label from a SQL statement's
 * leading keyword. Never returns raw SQL, only a known verb or 'other', so it
 * is safe to use as a metric tag.
 */
export function sqlOperation(sql?: string): string {
  if (typeof sql !== 'string') {
    return 'other';
  }
  const match = /^\s*([a-z]+)/i.exec(sql);
  const verb = match ? match[1].toLowerCase() : '';
  return SQL_VERBS.has(verb) ? verb : 'other';
}

/**
 * Derive the primary table name from a SQL statement (the identifier after
 * INTO/FROM/UPDATE). Intended for the raw-SQL stores where queries are static,
 * non-user-built strings, so the result is a bounded schema identifier safe to
 * use as a metric tag. Returns 'unknown' when no table can be parsed.
 */
export function sqlTable(sql?: string): string {
  if (typeof sql !== 'string') {
    return 'unknown';
  }
  const match = /\b(?:from|into|update)\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?/i.exec(
    sql
  );
  return match ? match[1] : 'unknown';
}

/**
 * Setup a connection after knex establishes it, before its used.
 *
 * @param conn rawDriverConnection from knex
 * @param done callback to indicate connection is ok
 */
async function setupConnection(conn: any, done: any) {
  const query = promisify(conn.query).bind(conn);
  try {
    // Always communicate timestamps in UTC.
    await query("SET time_zone = '+00:00'");
    // Always use full 4-byte UTF-8 for communicating unicode.
    await query('SET NAMES utf8mb4 COLLATE utf8mb4_bin;');
    // Always have certain modes active. The complexity here is to
    // preserve any extra modes active by default on the server.
    // We also try to preserve the order of the existing mode flags,
    // just in case the order has some obscure effect we don't know about.
    const rows = await query('SELECT @@sql_mode AS mode');
    const modes = rows[0].mode.split(',');
    let needToSetMode = false;
    for (const requiredMode of REQUIRED_SQL_MODES) {
      if (modes.indexOf(requiredMode) === -1) {
        modes.push(requiredMode);
        needToSetMode = true;
      }
    }
    if (needToSetMode) {
      const mode = modes.join(',');
      await query("SET SESSION sql_mode = '" + mode + "'");
    }
    done(null, conn);
  } catch (err) {
    done(err, conn);
  }
}

function typeCasting(field: any, next: any) {
  if (field.type === 'TINY' && field.length === 1) {
    return field.string() === '1';
  }
  return next();
}

export function monitorKnexConnectionPool(pool: any, metrics?: StatsD) {
  metrics?.increment('knex.pool_creation');
  pool.on('acquireRequest', (eventId: any) => {
    metrics?.increment('knex.aquire_request');
  });
  pool.on('createRequest', (eventId: any) => {
    metrics?.increment('knex.create_request');
  });
  pool.on('destroyRequest', (eventId: any, resource: any) => {
    metrics?.increment('knex.destroy_request');
  });
  pool.on('destroyFail', (eventId: any, resource: any) => {
    metrics?.increment('knex.destroy_fail');
  });
}

/**
 * Time every query on a knex connection via its query lifecycle events,
 * emitting db.query.duration tagged by table, operation, and result. This
 * covers all direct queries — objection model queries AND raw knex.raw()
 * calls — from one chokepoint. Stored-procedure calls (Call ...) are skipped
 * because BaseAuthModel times those with their proc name instead.
 */
export function instrumentKnexQueryTiming(db: Knex, metrics: StatsD) {
  const pending = new Map<string, number>();
  const isProc = (sql: string) => /^\s*call\s/i.test(sql);

  db.client.on('query', (obj: any) => {
    const sql = typeof obj?.sql === 'string' ? obj.sql : '';
    if (!obj?.__knexQueryUid || isProc(sql)) {
      return;
    }
    pending.set(obj.__knexQueryUid, performance.now());
  });

  const finish = (obj: any, result: 'success' | 'error') => {
    const uid = obj?.__knexQueryUid;
    const start = uid ? pending.get(uid) : undefined;
    if (typeof start !== 'number') {
      return;
    }
    pending.delete(uid);
    metrics.timing('db.query.duration', performance.now() - start, undefined, {
      table: sqlTable(obj?.sql),
      operation: sqlOperation(obj?.sql),
      result,
    });
  };

  db.client.on('query-response', (_response: any, obj: any) =>
    finish(obj, 'success')
  );
  db.client.on('query-error', (_error: any, obj: any) => finish(obj, 'error'));
}

export function setupDatabase(
  opts: MySQLConfig,
  log?: ILogger,
  metrics?: StatsD,
  queryTiming = false
): Knex {
  const db = knex({
    connection: {
      typeCast: typeCasting,
      charset: 'UTF8MB4_BIN',
      ...opts,
    },
    client: 'mysql',
    pool: {
      afterCreate: setupConnection,
      min: opts.connectionLimitMin,
      max: opts.connectionLimitMax,
      acquireTimeoutMillis: opts.acquireTimeoutMillis,
    },
  });

  monitorKnexConnectionPool(db.client.pool, metrics);

  // Wire query-timing metrics, gated by the kill switch (and a client). When
  // disabled, no listener is attached and the proc-timing static stays unset,
  // so the whole path is a no-op. Pool-monitoring counters above are
  // unaffected by this switch.
  if (metrics && queryTiming) {
    BaseModel.metrics = metrics; // stored-proc timing (BaseAuthModel)
    instrumentKnexQueryTiming(db, metrics); // direct-query timing (all queries)
  }

  log?.debug('knex', {
    msg: `knex: Creating Knex`,
    connLimit: opts.connectionLimitMax,
  });

  return db;
}

export function setupAuthDatabase(
  opts: MySQLConfig,
  log?: ILogger,
  metrics?: StatsD,
  queryTiming = false
) {
  const knex = setupDatabase(opts, log, metrics, queryTiming);
  BaseAuthModel.knex(knex);
  return knex;
}

export function setupOAuthDatabase(
  opts: MySQLConfig,
  log?: ILogger,
  metrics?: StatsD
) {
  const knex = setupDatabase(opts, log, metrics);
  return knex;
}

export function setupProfileDatabase(
  opts: MySQLConfig,
  log?: ILogger,
  metrics?: StatsD
) {
  const knex = setupDatabase(opts, log, metrics);
  ProfileBaseModel.knex(knex);
  return knex;
}
