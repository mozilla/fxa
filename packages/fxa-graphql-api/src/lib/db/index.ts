/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Knex from 'knex';
import { promisify } from 'util';

import { HealthExtras } from '../middleware';
import { MySQLConfig } from '../../config';
import { AuthBaseModel } from './models/auth';
import { ProfileBaseModel } from './models/profile';
import { Account } from './models/auth/account';

const REQUIRED_SQL_MODES = ['STRICT_ALL_TABLES', 'NO_ENGINE_SUBSTITUTION'];

export async function dbHealthCheck(): Promise<HealthExtras> {
  let status = 'ok';
  try {
    await Account.query().limit(1);
  } catch (err) {
    status = 'error';
  }
  return {
    db: { status },
  };
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

export function setupDatabase(opts: MySQLConfig): Knex {
  return Knex({
    connection: {
      typeCast: typeCasting,
      charset: 'UTF8MB4_BIN',
      ...opts,
    },
    client: 'mysql',
    pool: {
      afterCreate: setupConnection,
    },
  });
}

export function setupAuthDatabase(opts: MySQLConfig) {
  const knex = setupDatabase(opts);
  AuthBaseModel.knex(knex);
  return knex;
}

export function setupProfileDatabase(opts: MySQLConfig) {
  const knex = setupDatabase(opts);
  ProfileBaseModel.knex(knex);
  return knex;
}
