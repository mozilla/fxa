/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Knex from 'knex';
import { Model } from 'objection';

export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export function setupDatabase(opts: DatabaseConfig): Knex {
  const knex = Knex({ connection: opts, client: 'mysql' });
  Model.knex(knex);
  return knex;
}
