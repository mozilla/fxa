/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import { graphql, GraphQLSchema } from 'graphql';
import Chance from 'chance';
import Knex from 'knex';
import 'mocha';
import { buildSchema } from 'type-graphql';

import {
  randomAccount,
  randomEmail,
  randomEmailBounce,
  testDatabaseSetup,
} from '../db/models/helpers';
import { mockContext } from '../mocks';

import { Account, EmailBounces } from '../../../lib/db/models';
import { AccountResolver } from '../../../lib/resolvers/account-resolver';
import { EmailBounceResolver } from '../../../lib/resolvers/email-bounce-resolver';
import {
  BounceSubType,
  BounceType,
} from '../../../lib/resolvers/types/email-bounces';

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);
const EMAIL_2 = randomEmail(USER_1, true);
const EMAIL_BOUNCE_1 = randomEmailBounce(USER_1.email);

const USER_2 = randomAccount();

describe('accountResolver', () => {
  let knex: Knex;
  let schema: GraphQLSchema;
  let context: ReturnType<typeof mockContext>;

  before(async () => {
    knex = await testDatabaseSetup();
    // Load the users in
    await (Account as any)
      .query()
      .insertGraph({ ...USER_1, emails: [EMAIL_1, EMAIL_2] });
    await EmailBounces.query().insert(EMAIL_BOUNCE_1);
    schema = await buildSchema({
      resolvers: [AccountResolver, EmailBounceResolver],
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
      accountByUid(uid: "${USER_1.uid}") {
        uid
        email
      }
    }`;
    const result = (await graphql(schema, query, undefined, context)) as any;
    assert.isDefined(result.data);
    assert.isDefined(result.data.accountByUid);
    assert.deepEqual(result.data.accountByUid, {
      email: USER_1.email,
      uid: USER_1.uid,
    });
    assert.isTrue(context.logAction.calledOnce);
  });

  it('does not locate non-existent users by uid', async () => {
    const query = `query {
      accountByUid(uid: "${USER_2.uid}") {
        uid
        email
      }
    }`;
    const result = (await graphql(schema, query, undefined, context)) as any;
    assert.isDefined(result.data);
    assert.isNull(result.data.accountByUid);
    assert.isTrue(context.logAction.calledOnce);
  });

  it('locates the user by email', async () => {
    const query = `query {
      accountByEmail(email: "${USER_1.email}") {
        uid
        email
      }
    }`;
    const result = (await graphql(schema, query, undefined, context)) as any;
    assert.isDefined(result.data);
    assert.isDefined(result.data.accountByEmail);
    assert.deepEqual(result.data.accountByEmail, {
      email: USER_1.email,
      uid: USER_1.uid,
    });
    assert.isTrue(context.logAction.calledOnce);
  });

  it('does not locate non-existent users by email', async () => {
    const query = `query {
      accountByEmail(email: "${USER_2.email}") {
        uid
        email
      }
    }`;
    const result = (await graphql(schema, query, undefined, context)) as any;
    assert.isDefined(result.data);
    assert.isNull(result.data.accountByEmail);
    assert.isTrue(context.logAction.calledOnce);
  });

  it('loads all emails with field resolver', async () => {
    const query = `query {
      accountByEmail(email: "${USER_1.email}") {
        emails {
          email
          isPrimary
          isVerified
          createdAt
        }
      }
    }`;
    const result = (await graphql(schema, query, undefined, context)) as any;
    assert.isDefined(result.data);
    assert.isDefined(result.data.accountByEmail);
    assert.deepEqual(result.data.accountByEmail, {
      emails: [
        {
          email: USER_1.email,
          isPrimary: true,
          isVerified: true,
          createdAt: EMAIL_1.createdAt,
        },
        {
          email: EMAIL_2.email,
          isPrimary: false,
          isVerified: true,
          createdAt: EMAIL_2.createdAt,
        },
      ],
    });
    assert.isTrue(context.logAction.calledOnce);
  });

  it('loads emailBounces with field resolver', async () => {
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
    const result = (await graphql(schema, query, undefined, context)) as any;
    assert.isDefined(result.data);
    assert.isDefined(result.data.accountByEmail);
    assert.deepEqual(result.data.accountByEmail, {
      email: USER_1.email,
      emailBounces: [
        {
          bounceSubType: BounceSubType[EMAIL_BOUNCE_1.bounceSubType],
          bounceType: BounceType[EMAIL_BOUNCE_1.bounceType],
          createdAt: EMAIL_BOUNCE_1.createdAt,
          email: EMAIL_BOUNCE_1.email,
        },
      ],
      uid: USER_1.uid,
    });
    assert.isTrue(context.logAction.calledOnce);
  });
});
