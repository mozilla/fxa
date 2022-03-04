/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { knex, Knex } from 'knex';
import { promisify } from 'util';
import { ILogger } from '../log';

import { MySQLConfig } from './config';
import { BaseAuthModel } from './models/auth';
import { ProfileBaseModel } from './models/profile';

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

export function monitorKnexConnectionPool(
  pool?: any,
  log?: ILogger,
  metrics?: StatsD
) {
  metrics?.increment('mysql.pool_creation');
  const getPoolStats = () => {
    return {
      // returns the number of non-free resources
      numUsed: pool.numUsed(),
      // returns the number of free resources
      numFree: pool.numFree(),
      // how many acquires are waiting for a resource to be released
      numPendingAcquires: pool.numPendingAcquires(),
      // how many asynchronous create calls are running
      numPendingCreates: pool.numPendingCreates(),
    };
  };
  pool.on('acquireRequest', (eventId: any) => {
    log?.debug('db.FXA-4648', {
      msg: `Knex acquireRequest`,
      eventId,
      ...getPoolStats(),
    });
    metrics?.increment('knex.aquire_request');
  });
  pool.on('createRequest', (eventId: any) => {
    log?.debug('db.FXA-4648', {
      msg: `Knex createRequest`,
      eventId,
      ...getPoolStats(),
    });
    metrics?.increment('knex.create_request');
  });
  pool.on('destroyRequest', (eventId: any, resource: any) => {
    log?.debug('db.FXA-4648', {
      msg: `Knex destroyRequest`,
      eventId,
      ...getPoolStats(),
    });
    metrics?.increment('knex.destroy_request');
  });
  pool.on('destroyFail', (eventId: any, resource: any) => {
    log?.debug('db.FXA-4648', {
      msg: `Knex destroyFail`,
      eventId,
      ...getPoolStats(),
    });
    metrics?.increment('knex.destroy_fail');
  });
}

export function setupDatabase(
  opts: MySQLConfig,
  log?: ILogger,
  metrics?: StatsD
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

  // Monitor connection pool
  monitorKnexConnectionPool(db.client.pool, log, metrics);

  log?.info('db.FXA-4648', {
    msg: `Creating Knex`,
    connLimit: opts.connectionLimitMax,
  });
  log?.debug('db.FXA-4648', { msg: `Creating Knex`, stack: Error().stack });
  // if (!log) {
  //   console.trace('db.FXA-4648', 'missing logger!')
  // }

  return db;
}

export function setupAuthDatabase(
  opts: MySQLConfig,
  log?: ILogger,
  metrics?: StatsD
) {
  const knex = setupDatabase(opts, log, metrics);
  BaseAuthModel.knex(knex);
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
