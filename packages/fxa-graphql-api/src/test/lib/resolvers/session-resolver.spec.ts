/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';
import 'reflect-metadata';

import { assert } from 'chai';
import { graphql, GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import sinon from 'ts-sinon';
import { mockContext } from '../mocks';
import { SessionResolver } from '../../../lib/resolvers/session-resolver';

const sandbox = sinon.createSandbox();

describe('sessionResolver', () => {
  let schema: GraphQLSchema;
  let context: ReturnType<typeof mockContext>;

  before(async () => {
    schema = await buildSchema({
      resolvers: [SessionResolver],
      validate: false,
    });
  });

  beforeEach(async () => {
    context = mockContext();
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('mutation', () => {
    describe('destroySession', () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.sessionDestroy.resolves(true);
        const query = `mutation {
          destroySession(input: {clientMutationId: "testid"}) {
            clientMutationId
          }
        }`;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.destroySession);
        assert.deepEqual(result.data.destroySession, {
          clientMutationId: 'testid',
        });
      });
    });
  });
});
