/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { knex, Knex } from 'knex';
import { MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

import { ILogger } from '@fxa/shared/log';
import { localStatsD, StatsD } from '@fxa/shared/metrics/statsd';
import { MySQLConfig } from './config';

const REQUIRED_SQL_MODES = ['STRICT_ALL_TABLES', 'NO_ENGINE_SUBSTITUTION'];

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

export function monitorKnexConnectionPool(pool: any, metrics: StatsD) {
  metrics.increment('knex.pool_creation');
  pool.on('acquireRequest', (eventId: any) => {
    metrics.increment('knex.aquire_request');
  });
  pool.on('createRequest', (eventId: any) => {
    metrics.increment('knex.create_request');
  });
  pool.on('destroyRequest', (eventId: any, resource: any) => {
    metrics.increment('knex.destroy_request');
  });
  pool.on('destroyFail', (eventId: any, resource: any) => {
    metrics.increment('knex.destroy_fail');
  });
}

/**
 * Creates a configured Knex instance with logging and pool reporting.
 */
export function createKnex(
  opts: MySQLConfig,
  log: ILogger,
  metrics: StatsD = localStatsD()
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

  log.debug('knex', {
    msg: `knex: Creating Knex`,
    connLimit: opts.connectionLimitMax,
  });

  return db;
}

export function generateFxAUuid() {
  return uuidv4({}, Buffer.alloc(16)).toString('hex');
}

export async function createDialect(
  opts: MySQLConfig,
  log?: ILogger,
  metrics: StatsD = localStatsD()
) {
  log?.debug('mysqlDialect', {
    msg: `mysqlDialect: Creating MysqlDialect`,
    connLimit: opts.connectionLimitMax,
  });
  const pool = createPool({
    typeCast: typeCasting,
    charset: 'UTF8MB4_BIN',
    database: opts.database,
    host: opts.host,
    user: opts.user,
    password: opts.password,
    port: opts.port,
    connectionLimit: opts.connectionLimitMax,
  });
  pool.on('acquire', (eventId: any) => {
    metrics.increment('mysqlDialect.acquire');
  });
  pool.on('connection', (eventId: any) => {
    metrics.increment('mysqlDialect.connection');
  });
  pool.on('release', (eventId: any) => {
    metrics.increment('mysqlDialect.release');
  });

  // Connection setup
  // Always communicate timestamps in UTC.
  await pool.promise().query("SET time_zone = '+00:00'");
  // Always use full 4-byte UTF-8 for communicating unicode.
  await pool.promise().query('SET NAMES utf8mb4 COLLATE utf8mb4_bin;');
  // Always have certain modes active. The complexity here is to
  // preserve any extra modes active by default on the server.
  // We also try to preserve the order of the existing mode flags,
  // just in case the order has some obscure effect we don't know about.
  const [rows] = await pool.promise().query('SELECT @@sql_mode AS mode');
  const modes = (rows as any)[0].mode.split(',');
  let needToSetMode = false;
  for (const requiredMode of REQUIRED_SQL_MODES) {
    if (modes.indexOf(requiredMode) === -1) {
      modes.push(requiredMode);
      needToSetMode = true;
    }
  }
  if (needToSetMode) {
    log?.debug('mysqlDialect', {
      msg: `mysqlDialect: Setting sql_mode`,
      mode: modes.join(','),
    });
    const mode = modes.join(',');
    await pool.promise().query("SET SESSION sql_mode = '" + mode + "'");
  }

  return new MysqlDialect({
    pool,
  });
}
