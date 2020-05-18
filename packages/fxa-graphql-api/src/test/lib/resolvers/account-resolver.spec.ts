/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import { graphql, GraphQLSchema } from 'graphql';
import Knex from 'knex';
import 'mocha';
import { buildSchema } from 'type-graphql';

import { randomAccount, testDatabaseSetup } from '../db/models/auth/helpers';
import { mockContext } from '../mocks';

import { Account } from '../../../lib/db/models';
import { AccountResolver } from '../../../lib/resolvers/account-resolver';

const USER_1 = randomAccount();
const USER_2 = randomAccount();

describe('accountResolver', () => {
  let knex: Knex;
  let schema: GraphQLSchema;
  let context: ReturnType<typeof mockContext>;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the users in
    await (Account as any).query().insertGraph({ ...USER_1 });
    schema = await buildSchema({
      resolvers: [AccountResolver],
    });
  });

  beforeEach(async () => {
    context = mockContext();
  });

  after(async () => {
    await knex.destroy();
  });

  it('locates the user by uid', async () => {
    const query = `query {
      account {
        uid
        accountCreated
      }
    }`;
    context.authUser = USER_1.uid;
    const result = (await graphql(schema, query, undefined, context)) as any;
    assert.isDefined(result.data);
    assert.isDefined(result.data.account);
    assert.deepEqual(result.data.account, {
      accountCreated: USER_1.createdAt,
      uid: USER_1.uid,
    });
    assert.isTrue(context.logAction.calledOnce);
  });

  it('does not locate non-existent users by uid', async () => {
    const query = `query {
      account {
        uid
      }
    }`;
    context.authUser = USER_2.uid;
    const result = (await graphql(schema, query, undefined, context)) as any;
    assert.isDefined(result.data);
    assert.isNull(result.data.account);
    assert.isTrue(context.logAction.calledOnce);
  });
});
