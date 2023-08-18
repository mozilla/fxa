/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Kysely } from 'kysely';

import { Logger } from '../../../../../log/src';
import { StatsD } from '../../../../../metrics/statsd/src';
import { createDialect, createKnex, MySQLConfig } from '../../../core/src';
import { DB } from './keysley-types';
import { BaseModel as AccountBaseModel } from './base';

export function setupAccountDatabase(
  opts: MySQLConfig,
  log?: Logger,
  metrics?: StatsD
) {
  const knex = createKnex(opts, log, metrics);
  AccountBaseModel.knex(knex);
  return knex;
}

export type AccountDatabase = Kysely<DB>;

export async function setupKyselyAccountDatabase(opts: MySQLConfig) {
  const dialect = await createDialect(opts);
  return new Kysely<DB>({
    dialect,
  });
}
