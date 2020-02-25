/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import Knex from 'knex';
import 'mocha';

import { chance, randomAccount, randomEmailBounce, testDatabaseSetup } from './helpers';

import { EmailBounces } from '../../../../lib/db/models/email-bounces';

const USER_1 = randomAccount();
const EMAIL_BOUNCE = randomEmailBounce(USER_1.email);

describe('emailBounces model', () => {
  let knex: Knex;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the emailBounce in
    await EmailBounces.query().insertGraph(EMAIL_BOUNCE);
  });

  after(async () => {
    await knex.destroy();
  });

  it('looks up the email bounce', async () => {
    const result = await EmailBounces.query().findOne({ email: EMAIL_BOUNCE.email });
    assert.equal(result.email, EMAIL_BOUNCE.email);
    assert.equal(result.bounceType, EMAIL_BOUNCE.bounceType);
  });

  it('does not find a non-existent email bounce', async () => {
    const result = await EmailBounces.query().findOne({ email: chance.email() });
    assert.isUndefined(result);
  });
});
