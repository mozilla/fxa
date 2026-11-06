/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Knex } from 'knex';
import { AccountFactory } from '@fxa/shared/db/mysql/account';
import { setupAuthDatabase } from '@fxa/shared/db/mysql/legacy';
import { Account } from '@fxa/shared/db/mysql/legacy/models/auth';
import { accountWhereAndOrderByQueryBuilder } from '../../../scripts/delete-inactive-accounts/lib';

const config = require('../../../config').default.getProperties();

describe('accountWhereAndOrderByQueryBuilder', () => {
  let knex: Knex;
  // a createdAt range in 1970 that no other test account uses
  const start = 1_000;
  const end = 2_000;
  const enabled = AccountFactory({
    createdAt: start,
    email: 'inactive-enabled@example.com',
  });
  const disabled = AccountFactory({
    createdAt: start + 1,
    email: 'inactive-disabled@example.com',
    disabledAt: 1_700_000_000_000,
  });
  const deleteTestAccounts = () =>
    Account.knexQuery()
      .where('createdAt', '>=', start)
      .where('createdAt', '<', end)
      .del();

  beforeAll(async () => {
    knex = setupAuthDatabase(config.database.mysql.auth);
    await deleteTestAccounts();
    for (const account of [enabled, disabled]) {
      await Account.knexQuery().insert({
        ...account,
        normalizedEmail: account.email,
      });
    }
  });

  afterAll(async () => {
    await deleteTestAccounts();
    await knex.destroy();
  });

  it('returns inactive accounts that are not disabled', async () => {
    const rows = await accountWhereAndOrderByQueryBuilder(
      start,
      end,
      1_700_000_000_000
    ).select('accounts.uid');

    expect(rows.map((r) => r.uid)).toEqual([enabled.uid.toString('hex')]);
  });
});
