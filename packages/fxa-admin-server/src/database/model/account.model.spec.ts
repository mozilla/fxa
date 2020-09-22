/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Knex from 'knex';

import { uuidTransformer } from '../transformers';
import { Account } from './account.model';
import { chance, randomAccount, testDatabaseSetup } from './helpers';

const USER_1 = randomAccount();

describe('account model', () => {
  let knex: Knex;

  beforeAll(async () => {
    knex = await testDatabaseSetup('testAdminAccount');
    // Load the user in
    await Account.bindKnex(knex).query().insertGraph(USER_1);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('looks up the user by email', async () => {
    const result = await Account.bindKnex(knex).query().findOne({
      normalizedEmail: USER_1.normalizedEmail,
    });
    expect(result.uid).toBe(USER_1.uid);
    expect(result.email).toBe(USER_1.email);
  });

  it('looks up the user by uid buffer', async () => {
    const uidBuffer = uuidTransformer.to(USER_1.uid);
    const result = await Account.bindKnex(knex)
      .query()
      .findOne({ uid: uidBuffer });
    expect(result.uid).toBe(USER_1.uid);
    expect(result.email).toBe(USER_1.email);
  });

  it('does not find a non-existent user', async () => {
    let result = await Account.bindKnex(knex).query().findOne({
      normalizedEmail: chance.email(),
    });
    expect(result).toBeUndefined();

    const uid = chance.guid({ version: 4 }).replace(/-/g, '');
    const uidBuffer = uuidTransformer.to(uid);
    result = await Account.bindKnex(knex).query().findOne({ uid: uidBuffer });
    expect(result).toBeUndefined();
  });
});
