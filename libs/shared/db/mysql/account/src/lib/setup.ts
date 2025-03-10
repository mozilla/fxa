/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Kysely } from 'kysely';

import { createDialect, MySQLConfig } from '@fxa/shared/db/mysql/core';
import { DB } from './kysely-types';

export type AccountDatabase = Kysely<DB>;
export const AccountDbProvider = Symbol('AccountDbProvider');

export async function setupAccountDatabase(opts: MySQLConfig) {
  const { dialect, pool } = await createDialect(opts);
  const db = new Kysely<DB>({
    dialect,
  });

  /**
   * Important! We've observed that connection pools aren't being destroyed.
   * In theory Kysely should do this when the instance is destroyed, but it
   * appears not work in practice. The following hijack works around the
   * issue and manually closes the connection pool we created.
   *
   * This was most noticeable when running auth-server remote tests, where
   * we'd hit random timeouts acquiring connections because previous connections
   * pools were never closed.
   *
   * When running our services in production, this isn't really a noticeable
   * because we aren't creating lots of new account database instances.
   */
  const _dbDestroy = db.destroy;
  db.destroy = async function () {
    await _dbDestroy.call(db);
    pool.end(() => {});
  };

  return db;
}
