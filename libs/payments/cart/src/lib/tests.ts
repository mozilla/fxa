/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import knex, { Knex } from 'knex';
import {
  runSql,
  setupAccountDatabase,
} from '../../../../shared/db/mysql/core/src';

const CART_TEST_DB = 'testCart';
const SQL_FILE_LOCATION = '../../../account/src/test';

export async function testCartDatabaseSetup(): Promise<Knex> {
  // Create the db if it doesn't exist
  let instance = knex({
    client: 'mysql',
    connection: {
      charset: 'UTF8MB4_BIN',
      host: 'localhost',
      password: '',
      port: 3306,
      user: 'root',
    },
  });

  await instance.raw(`DROP DATABASE IF EXISTS ${CART_TEST_DB}`);
  await instance.raw(`CREATE DATABASE ${CART_TEST_DB}`);
  await instance.destroy();

  instance = setupAccountDatabase({
    database: CART_TEST_DB,
    host: 'localhost',
    password: '',
    port: 3306,
    user: 'root',
  });

  await runSql([`${SQL_FILE_LOCATION}/accounts.sql`], instance);
  await runSql([`${SQL_FILE_LOCATION}/carts.sql`], instance);

  return instance;
}
