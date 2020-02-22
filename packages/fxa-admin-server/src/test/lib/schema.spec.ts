/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import { assert } from 'chai';
import {
  getIntrospectionQuery,
  graphql,
  IntrospectionEnumType,
  IntrospectionObjectType,
  IntrospectionSchema,
  TypeKind
} from 'graphql';
import 'mocha';
import { buildSchema } from 'type-graphql';

import { AccountResolver } from '../../lib/resolvers/account-resolver';
import { EmailBounceResolver } from '../../lib/resolvers/email-bounce-resolver';

describe('Schema', () => {
  let builtSchema;
  let schemaIntrospection: IntrospectionSchema;
  let queryType: IntrospectionObjectType;
  let mutationType: IntrospectionObjectType;

  beforeEach(async () => {
    const schema = await buildSchema({ resolvers: [AccountResolver, EmailBounceResolver] });
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

  function findEnumByName(name: string) {
    return schemaIntrospection.types.find(
      type => type.kind === TypeKind.ENUM && type.name === name
    ) as IntrospectionEnumType;
  }

  it('is created with expected types', async () => {
    const queryNames = queryType.fields.map(it => it.name);
    assert.sameMembers(queryNames, ['accountByUid', 'accountByEmail']);

    const mutationNames = mutationType.fields.map(it => it.name);
    assert.sameMembers(mutationNames, ['clearEmailBounce']);

    const accountType = findTypeByName('Account');
    assert.isDefined(accountType);
    assert.lengthOf(accountType.fields, 5);
    const accountTypeNames = accountType.fields.map(it => it.name);
    assert.sameMembers(accountTypeNames, [
      'uid',
      'email',
      'emailVerified',
      'createdAt',
      'emailBounces'
    ]);

    const emailBounceType = findTypeByName('EmailBounce');
    assert.isDefined(emailBounceType);
    assert.lengthOf(emailBounceType.fields, 4);
    const emailBounceTypeNames = emailBounceType.fields.map(it => it.name);
    assert.sameMembers(emailBounceTypeNames, ['email', 'bounceType', 'bounceSubType', 'createdAt']);

    const bounceTypeEnum = findEnumByName('BounceType');
    assert.isDefined(bounceTypeEnum);
    assert.lengthOf(bounceTypeEnum.enumValues, 4);
    const bounceTypeValues = bounceTypeEnum.enumValues.map(it => it.name);
    assert.sameOrderedMembers(bounceTypeValues, [
      'unmapped',
      'Permanent',
      'Transient',
      'Complaint'
    ]);

    const bounceSubTypeEnum = findEnumByName('BounceSubType');
    assert.isDefined(bounceSubTypeEnum);
    assert.lengthOf(bounceSubTypeEnum.enumValues, 15);
    const bounceSubTypeValues = bounceSubTypeEnum.enumValues.map(it => it.name);
    assert.sameOrderedMembers(bounceSubTypeValues, [
      'unmapped',
      'Undetermined',
      'General',
      'NoEmail',
      'Suppressed',
      'MailboxFull',
      'MessageTooLarge',
      'ContentRejected',
      'AttachmentRejected',
      'Abuse',
      'AuthFailure',
      'Fraud',
      'NotSpam',
      'Other',
      'Virus'
    ]);
  });
});
