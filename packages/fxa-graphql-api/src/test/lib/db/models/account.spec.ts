/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import Knex from 'knex';
import 'mocha';

import { chance, randomAccount, testDatabaseSetup } from './helpers';

import { Account } from '../../../../lib/db/models/account';
import { uuidTransformer } from '../../../../lib/db/transformers';

const USER_1 = randomAccount();

describe('account model', () => {
  let knex: Knex;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the user in
    await Account.query().insertGraph(USER_1);
  });

  after(async () => {
    await knex.destroy();
  });

  it('looks up the user by email', async () => {
    const result = await Account.query().findOne({ normalizedEmail: USER_1.normalizedEmail });
    assert.equal(result.uid, USER_1.uid);
  });

  it('looks up the user by uid buffer', async () => {
    const uidBuffer = uuidTransformer.to(USER_1.uid);
    const result = await Account.query().findOne({ uid: uidBuffer });
    assert.equal(result.uid, USER_1.uid);
  });

  it('does not find a non-existent user', async () => {
    let result = await Account.query().findOne({ normalizedEmail: chance.email() });
    assert.isUndefined(result);

    const uid = chance.guid({ version: 4 }).replace(/-/g, '');
    const uidBuffer = uuidTransformer.to(uid);
    result = await Account.query().findOne({ uid: uidBuffer });
    assert.isUndefined(result);
  });
});
