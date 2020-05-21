/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import {
  getIntrospectionQuery,
  graphql,
  IntrospectionObjectType,
  IntrospectionSchema,
  TypeKind,
} from 'graphql';
import 'mocha';
import { buildSchema } from 'type-graphql';

import { AccountResolver } from '../../lib/resolvers/account-resolver';

describe('Schema', () => {
  let builtSchema;
  let schemaIntrospection: IntrospectionSchema;
  let queryType: IntrospectionObjectType;
  let mutationType: IntrospectionObjectType;

  beforeEach(async () => {
    const schema = await buildSchema({ resolvers: [AccountResolver] });
    builtSchema = await graphql(schema, getIntrospectionQuery());
    schemaIntrospection = builtSchema.data!.__schema as IntrospectionSchema;
    assert.isDefined(schemaIntrospection);
    queryType = schemaIntrospection.types.find(
      type => type.name === (schemaIntrospection as IntrospectionSchema).queryType.name
    ) as IntrospectionObjectType;

    const mutationTypeNameRef = schemaIntrospection.mutationType;
    if (mutationTypeNameRef) {
      mutationType = schemaIntrospection.types.find(
        type => type.name === mutationTypeNameRef.name
      ) as IntrospectionObjectType;
    }
  });

  function findTypeByName(name: string) {
    return schemaIntrospection.types.find(
      type => type.kind === TypeKind.OBJECT && type.name === name
    ) as IntrospectionObjectType;
  }

  function verifyTypeMembers(name: string, members: string[]) {
    const typ = findTypeByName(name);
    assert.isDefined(typ);
    assert.lengthOf(typ.fields, members.length);
    const typNames = typ.fields.map(it => it.name);
    assert.sameMembers(typNames, members);
  }

  it('is created with expected types', async () => {
    const queryNames = queryType.fields.map(it => it.name);
    assert.sameMembers(queryNames, ['account']);

    verifyTypeMembers('Account', [
      'uid',
      'accountCreated',
      'passwordCreated',
      'displayName',
      'locale',
      'emails',
      'avatarUrl',
      'subscriptions',
      'totp',
      'recoveryKey',
      'attachedClients',
    ]);
    verifyTypeMembers('Email', ['email', 'isPrimary', 'verified']);
    verifyTypeMembers('Totp', ['exists', 'verified']);
    verifyTypeMembers('Subscription', [
      'created',
      'cancelAtPeriodEnd',
      'currentPeriodEnd',
      'currentPeriodStart',
      'endAt',
      'latestInvoice',
      'planId',
      'productName',
      'productId',
      'status',
      'subscriptionId',
    ]);
    verifyTypeMembers('AttachedClient', [
      'clientId',
      'sessionTokenId',
      'refreshTokenId',
      'deviceId',
      'deviceType',
      'isCurrentSession',
      'name',
      'createdTime',
      'createdTimeFormatted',
      'lastAccessTime',
      'lastAccessTimeFormatted',
      'approximateLastAccessTime',
      'approximateLastAccessTimeFormatted',
      'scope',
      'location',
      'userAgent',
      'os',
    ]);
    verifyTypeMembers('Location', ['city', 'country', 'state', 'stateCode']);
  });
});
