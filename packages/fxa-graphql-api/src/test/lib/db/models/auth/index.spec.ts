/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import Knex from 'knex';
import 'mocha';

import { chance, randomAccount, randomEmail, testDatabaseSetup } from './helpers';

import { Account, accountByUid } from '../../../../../lib/db/models/auth';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);

describe('auth', () => {
  let knex: Knex;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the user in
    await Account.query().insertGraph({ ...USER_1, emails: [EMAIL_1] });
  });

  after(async () => {
    await knex.destroy();
  });

  describe('accountByUid', () => {
    it('retrieves record successfully', async () => {
      const result = (await accountByUid(USER_1.uid)) as Account;
      assert.isDefined(result);
      assert.equal(result.uid, USER_1.uid);
      assert.equal(result.email, USER_1.email);
    });

    it('retrieves record with emails included successfully', async () => {
      const result = (await accountByUid(USER_1.uid, { include: ['emails'] })) as Account;
      assert.isDefined(result);
      assert.equal(result.uid, USER_1.uid);
      assert.equal(result.email, USER_1.email);
      if (!result.emails) {
        assert.fail('result emails not defined');
      }
      assert.deepInclude(result.emails[0], EMAIL_1);
    });

    it('does not find a non-existent user', async () => {
      const uid = chance.guid({ version: 4 }).replace(/-/g, '');
      const result = await accountByUid(uid);
      assert.isUndefined(result);
    });
  });
});
