import { BaseModel as AccountBaseModel } from '../../../account/src';
import { Logger } from '../../../../../log/src';
import { StatsD } from '../../../../../metrics/statsd/src';
import { MySQLConfig } from './config';
import { createKnex } from './core';

export function setupAccountDatabase(
  opts: MySQLConfig,
  log?: Logger,
  metrics?: StatsD
) {
  const knex = createKnex(opts, log, metrics);
  AccountBaseModel.knex(knex);
  return knex;
}
