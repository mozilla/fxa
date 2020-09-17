/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import Knex from 'knex';

import { EmailBounces } from './email-bounces.model';
import {
  chance,
  randomAccount,
  randomEmailBounce,
  testDatabaseSetup,
} from './helpers';

const USER_1 = randomAccount();
const EMAIL_BOUNCE = randomEmailBounce(USER_1.email);

describe('emailBounces model', () => {
  let knex: Knex;

  beforeAll(async () => {
    knex = await testDatabaseSetup('testAdminEmail');
    // Load the emailBounce in
    await EmailBounces.bindKnex(knex).query().insertGraph(EMAIL_BOUNCE);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('looks up the email bounce', async () => {
    const result = await EmailBounces.bindKnex(knex).query().findOne({
      email: EMAIL_BOUNCE.email,
    });
    expect(result.email).toBe(EMAIL_BOUNCE.email);
    expect(result.bounceType).toBe(EMAIL_BOUNCE.bounceType);
  });

  it('does not find a non-existent email bounce', async () => {
    const result = await EmailBounces.bindKnex(knex).query().findOne({
      email: chance.email(),
    });
    expect(result).toBeUndefined();
  });
});
