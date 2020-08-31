/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';
import 'reflect-metadata';

import { assert } from 'chai';
import { graphql, GraphQLSchema } from 'graphql';
import Knex from 'knex';
import sinon from 'ts-sinon';
import { buildSchema } from 'type-graphql';

import { Account } from '../../../lib/db/models';
import { AccountResolver } from '../../../lib/resolvers/account-resolver';
import { randomAccount, testDatabaseSetup } from '../db/models/auth/helpers';
import { mockContext } from '../mocks';

const sandbox = sinon.createSandbox();

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
      validate: false,
    });
  });

  beforeEach(async () => {
    context = mockContext();
  });

  after(async () => {
    await knex.destroy();
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('query', () => {
    describe('account', () => {
      it('locates the user by uid', async () => {
        const query = `query {
          account {
            uid
            accountCreated
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.account);
        assert.deepEqual(result.data.account, {
          accountCreated: USER_1.createdAt,
          uid: USER_1.uid,
        });
        assert.isTrue((context.logger.info as sinon.SinonSpy).calledOnce);
      });

      it('does not locate non-existent users by uid', async () => {
        const query = `query {
          account {
            uid
          }
        }`;
        context.session.uid = USER_2.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isNull(result.data.account);
        assert.isTrue((context.logger.info as sinon.SinonSpy).calledOnce);
      });
    });
  });

  describe('mutation', () => {
    describe('attachedClientDisconnect', () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.attachedClientDestroy.resolves(true);
        const query = `mutation {
          attachedClientDisconnect(input: {clientMutationId: "testid", clientId: "client1234", sessionTokenId: "sesssion1234", refreshTokenId: "refresh1234", deviceId: "device1234"}) {
            clientMutationId
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.attachedClientDisconnect);
        assert.deepEqual(result.data.attachedClientDisconnect, {
          clientMutationId: 'testid',
        });
      });
    });

    describe('updateDisplayName', () => {
      it('succeeds', async () => {
        context.dataSources.profileAPI.updateDisplayName.resolves(true);
        const query = `mutation {
          updateDisplayName(input: {clientMutationId: "testid", displayName: "fred"}) {
            clientMutationId
            displayName
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.updateDisplayName);
        assert.deepEqual(result.data.updateDisplayName, {
          clientMutationId: 'testid',
          displayName: 'fred',
        });
      });
    });

    describe('updateAvatar', async () => {
      // Due to the interactions required between express middleware and
      // the apollo server, no unit testing of the update avatar is feasible.
      // FIXME: Integrated test that verifies file upload functionality.
    });

    describe('createSecondaryEmail', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.recoveryEmailCreate.resolves(true);
        const query = `mutation {
          createSecondaryEmail(input: {clientMutationId: "testid", email: "test@example.com"}) {
            clientMutationId
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.createSecondaryEmail);
        assert.deepEqual(result.data.createSecondaryEmail, {
          clientMutationId: 'testid',
        });
      });
    });

    describe('createTotp', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.createTotpToken.resolves({
          qrCodeUrl: 'testurl',
          recoveryCodes: ['test1', 'test2'],
          secret: 'secretData',
        });
        const query = `mutation {
          createTotp(input: {clientMutationId: "testid", metricsContext: {
            deviceId: "device1",
            flowBeginTime: 4238248
          }}) {
            clientMutationId
            qrCodeUrl
            secret
            recoveryCodes
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.createTotp);
        assert.deepEqual(result.data.createTotp, {
          clientMutationId: 'testid',
          qrCodeUrl: 'testurl',
          recoveryCodes: ['test1', 'test2'],
          secret: 'secretData',
        });
      });
    });

    describe('changeRecoveryCodes', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.replaceRecoveryCodes.resolves({
          recoveryCodes: ['test1', 'test2'],
        });
        const query = `mutation {
          changeRecoveryCodes(input: {clientMutationId: "testid"}) {
            clientMutationId
            recoveryCodes
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.changeRecoveryCodes);
        assert.deepEqual(result.data.changeRecoveryCodes, {
          clientMutationId: 'testid',
          recoveryCodes: ['test1', 'test2'],
        });
      });
    });

    describe('verifyTotp', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.verifyTotp.resolves({
          success: true,
        });
        const query = `mutation {
          verifyTotp(input: {clientMutationId: "testid", code: "code1234"}) {
            clientMutationId
            success
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.verifyTotp);
        assert.deepEqual(result.data.verifyTotp, {
          clientMutationId: 'testid',
          success: true,
        });
      });
    });

    describe('deleteTotp', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.destroyTotpToken.resolves(true);
        const query = `mutation {
          deleteTotp(input: {clientMutationId: "testid"}) {
            clientMutationId
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.deleteTotp);
        assert.deepEqual(result.data.deleteTotp, {
          clientMutationId: 'testid',
        });
      });
    });

    describe('deleteSecondaryEmail', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.recoveryEmailDestroy.resolves(true);
        const query = `mutation {
          deleteSecondaryEmail(input: {clientMutationId: "testid", email: "test@example.com"}) {
            clientMutationId
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.deleteSecondaryEmail);
        assert.deepEqual(result.data.deleteSecondaryEmail, {
          clientMutationId: 'testid',
        });
      });
    });

    describe('updatePrimaryEmail', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.recoveryEmailSetPrimaryEmail.resolves(true);
        const query = `mutation {
          updatePrimaryEmail(input: {clientMutationId: "testid", email: "test@example.com"}) {
            clientMutationId
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.updatePrimaryEmail);
        assert.deepEqual(result.data.updatePrimaryEmail, {
          clientMutationId: 'testid',
        });
      });
    });

    describe('resendSecondaryEmailCode', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.recoveryEmailSecondaryResendCode.resolves(
          true
        );
        const query = `mutation {
          resendSecondaryEmailCode(input: {clientMutationId: "testid", email: "test@example.com"}) {
            clientMutationId
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.resendSecondaryEmailCode);
        assert.deepEqual(result.data.resendSecondaryEmailCode, {
          clientMutationId: 'testid',
        });
      });
    });

    describe('verifySecondaryEmail', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.recoveryEmailSecondaryVerifyCode.resolves(
          true
        );
        const query = `mutation {
          verifySecondaryEmail(input: {clientMutationId: "testid", email: "test@example.com", code: "ABCD1234"}) {
            clientMutationId
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.verifySecondaryEmail);
        assert.deepEqual(result.data.verifySecondaryEmail, {
          clientMutationId: 'testid',
        });
      });
    });

    describe('sendSessionVerificationCode', async () => {
      it('succeeds', async () => {
        context.dataSources.authAPI.sessionResendVerifyCode.resolves(true);
        const query = `mutation {
          sendSessionVerificationCode(input: {clientMutationId: "testid"}) {
            clientMutationId
          }
        }`;
        context.session.uid = USER_1.uid;
        const result = (await graphql(
          schema,
          query,
          undefined,
          context
        )) as any;
        assert.isDefined(result.data);
        assert.isDefined(result.data.sendSessionVerificationCode);
        assert.deepEqual(result.data.sendSessionVerificationCode, {
          clientMutationId: 'testid',
        });
      });
    });
  });

  describe('verifySession', async () => {
    it('succeeds', async () => {
      context.dataSources.authAPI.sessionVerifyCode.resolves(true);
      const query = `mutation {
        verifySession(input: {clientMutationId: "testid", code: "ABCD1234"}) {
          clientMutationId
        }
      }`;
      context.session.uid = USER_1.uid;
      const result = (await graphql(schema, query, undefined, context)) as any;
      assert.isDefined(result.data);
      assert.isDefined(result.data.verifySession);
      assert.deepEqual(result.data.verifySession, {
        clientMutationId: 'testid',
      });
    });
  });

  describe('deleteRecoveryKey', async () => {
    it('succeeds!', async () => {
      context.dataSources.authAPI.deleteRecoveryKey.resolves(true);
      const query = `mutation {
        deleteRecoveryKey(input: {clientMutationId: "testid"}) {
          clientMutationId
        }
      }`;
      context.session.uid = USER_1.uid;
      const result = (await graphql(schema, query, undefined, context)) as any;
      assert.isDefined(result.data);
      assert.isDefined(result.data.deleteRecoveryKey);
      assert.deepEqual(result.data.deleteRecoveryKey, {
        clientMutationId: 'testid',
      });
    });
  });
});
