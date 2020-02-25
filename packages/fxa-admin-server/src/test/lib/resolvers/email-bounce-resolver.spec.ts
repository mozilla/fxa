/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import { graphql, GraphQLSchema } from 'graphql';
import Knex from 'knex';
import 'mocha';
import { buildSchema } from 'type-graphql';

import {
  randomAccount,
  randomEmail,
  randomEmailBounce,
  testDatabaseSetup
} from '../db/models/helpers';

import { Account, EmailBounces } from '../../../lib/db/models';
import { AccountResolver } from '../../../lib/resolvers/account-resolver';
import { EmailBounceResolver } from '../../../lib/resolvers/email-bounce-resolver';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);
const EMAIL_BOUNCE_1 = randomEmailBounce(USER_1.email);

const USER_2 = randomAccount();

describe('emailBounceResolver', () => {
  let knex: Knex;
  let schema: GraphQLSchema;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the users in
    await (Account as any).query().insertGraph({ ...USER_1, emails: [EMAIL_1] });
    await EmailBounces.query().insert(EMAIL_BOUNCE_1);
    schema = await buildSchema({ resolvers: [AccountResolver, EmailBounceResolver] });
  });

  after(async () => {
    await knex.destroy();
  });

  it('clears an email bounce', async () => {
    const query = `query {
      accountByEmail(email: "${USER_1.email}") {
        uid
        email
        emailBounces {
          email
          bounceType
          bounceSubType
          createdAt
        }
      }
    }`;
    let result = (await graphql(schema, query)) as any;
    assert.isDefined(result.data);
    assert.isDefined(result.data.accountByEmail);
    assert.lengthOf(result.data.accountByEmail.emailBounces, 1);

    const mutation = `mutation {
      clearEmailBounce(email: "${USER_1.email}")
    }`;
    result = (await graphql(schema, mutation)) as any;
    assert.isDefined(result.data);
    assert.isTrue(result.data.clearEmailBounce);

    result = (await graphql(schema, query)) as any;
    assert.isDefined(result.data);
    assert.isDefined(result.data.accountByEmail);
    assert.lengthOf(result.data.accountByEmail.emailBounces, 0);
  });

  it('fails to clear a non-existent bounce', async () => {
    const mutation = `mutation {
      clearEmailBounce(email: "${USER_2.email}")
    }`;
    const result = (await graphql(schema, mutation)) as any;
    assert.isDefined(result.data);
    assert.isFalse(result.data.clearEmailBounce);
  });
});
