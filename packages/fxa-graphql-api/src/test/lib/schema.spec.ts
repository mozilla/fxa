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
  TypeKind
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

  it('is created with expected types', async () => {
    const queryNames = queryType.fields.map(it => it.name);
    assert.sameMembers(queryNames, ['account']);

    const accountType = findTypeByName('Account');
    assert.isDefined(accountType);
    assert.lengthOf(accountType.fields, 7);
    const accountTypeNames = accountType.fields.map(it => it.name);
    assert.sameMembers(accountTypeNames, [
      'uid',
      'accountCreated',
      'passwordCreated',
      'displayName',
      'locale',
      'emails',
      'avatarUrl'
    ]);
  });
});
