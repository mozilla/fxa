/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Account, accountByUid } from 'fxa-shared/db/models/auth';
import { CustomsService } from 'fxa-shared/nestjs/customs/customs.service';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import Knex from 'knex';

import { randomAccount, testDatabaseSetup } from '../../test/helpers';
import { AuthClientService } from '../backend/auth-client.service';
import { ProfileClientService } from '../backend/profile-client.service';
import { AccountResolver } from './account.resolver';

const USER_1 = randomAccount();

describe('AccountResolver', () => {
  let resolver: AccountResolver;
  let logger: any;
  let knex: Knex;
  let authClient: any;
  let profileClient: any;

  beforeAll(async () => {
    knex = await testDatabaseSetup();
    // Load the users in
    await (Account as any).query().insertGraph({ ...USER_1 });
  });

  beforeEach(async () => {
    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    authClient = {};
    profileClient = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountResolver,
        MockMozLogger,
        { provide: CustomsService, useValue: {} },
        { provide: AuthClientService, useValue: authClient },
        { provide: ProfileClientService, useValue: profileClient },
      ],
    }).compile();

    resolver = module.get<AccountResolver>(AccountResolver);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('query', () => {
    describe('account', () => {
      it('locates the user by id', async () => {
        (resolver as any).shouldIncludeEmails = jest.fn().mockReturnValue(true);
        const result = await resolver.account(USER_1.uid, {} as any);
        expect(result?.createdAt).toBe(USER_1.createdAt);
      });

      it('resolves account created', async () => {
        const user = await accountByUid(USER_1.uid);
        expect(resolver.accountCreated(user!)).toBe(USER_1.createdAt);
      });

      it('resolves password created', async () => {
        const user = await accountByUid(USER_1.uid);
        expect(resolver.passwordCreated(user!)).toBe(USER_1.verifierSetAt);
      });

      it('resolves emails with null', async () => {
        const user = await accountByUid(USER_1.uid);
        const emails = resolver.emails(user!);
        expect(emails).toBeNull();
      });

      it('resolves emails when loaded', async () => {
        const user = await accountByUid(USER_1.uid, { include: ['emails'] });
        (user!.emails as any) = [
          { email: 'fred', isPrimary: true, isVerified: true, extra: true },
        ];
        const emails = resolver.emails(user!);
        expect(emails).toStrictEqual([
          { email: 'fred', isPrimary: true, verified: true },
        ]);
      });

      it('resolves subscriptions', async () => {
        authClient.account = jest
          .fn()
          .mockResolvedValue({ subscriptions: [{ key: 1, key_two: 2 }] });
        const result = await resolver.subscriptions('token');
        expect(result).toStrictEqual([{ key: 1, keyTwo: 2 }]);
      });

      it('resolves recoveryKey', async () => {
        authClient.recoveryKeyExists = jest
          .fn()
          .mockResolvedValue({ exists: true });
        const result = await resolver.recoveryKey('token');
        expect(result).toBeTruthy();
      });

      it('resolves totp', async () => {
        authClient.checkTotpTokenExists = jest.fn().mockResolvedValue(true);
        const result = await resolver.totp('token');
        expect(result).toBeTruthy();
      });

      it('resolves attachedClients', async () => {
        authClient.attachedClients = jest.fn().mockResolvedValue(true);
        const result = await resolver.attachedClients('token');
        expect(result).toBeTruthy();
      });
    });
  });

  describe('mutation', () => {
    describe('createTotp', () => {
      it('succeeds', async () => {
        authClient.createTotpToken = jest.fn().mockResolvedValue({
          qrCodeUrl: 'testurl',
          recoveryCodes: ['test1', 'test2'],
          secret: 'secretData',
        });
        const result = await resolver.createTotp('token', {
          metricsContext: { deviceId: 'device1', flowBeginTime: 4238248 },
          clientMutationId: 'testid',
        });
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          qrCodeUrl: 'testurl',
          recoveryCodes: ['test1', 'test2'],
          secret: 'secretData',
        });
      });
    });

    describe('verifyTotp', () => {
      it('succeeds', async () => {
        authClient.verifyTotpCode = jest
          .fn()
          .mockResolvedValue({ success: true });
        const result = await resolver.verifyTotp('token', {
          code: 'code1234',
          clientMutationId: 'testid',
        });
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          success: true,
        });
      });
    });

    describe('deleteTotp', () => {
      it('succeeds', async () => {
        authClient.deleteTotpToken = jest
          .fn()
          .mockResolvedValue({ success: true });
        const result = await resolver.deleteTotp('token', {
          clientMutationId: 'testid',
        });
        expect(authClient.deleteTotpToken).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('deleteRecoveryKey', () => {
      it('succeeds', async () => {
        authClient.deleteRecoveryKey = jest.fn().mockResolvedValue(true);
        const result = await resolver.deleteRecoveryKey('token', {
          clientMutationId: 'testid',
        });
        expect(authClient.deleteRecoveryKey).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('changeRecoveryCodes', () => {
      it('succeeds', async () => {
        authClient.replaceRecoveryCodes = jest
          .fn()
          .mockResolvedValue({ recoveryCodes: ['test1', 'test2'] });
        const result = await resolver.changeRecoveryCodes('token', {
          clientMutationId: 'testid',
        });
        expect(authClient.replaceRecoveryCodes).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          recoveryCodes: ['test1', 'test2'],
        });
      });
    });

    describe('updateDisplayName', () => {
      it('succeeds', async () => {
        profileClient.updateDisplayName = jest.fn().mockResolvedValue(true);
        const result = await resolver.updateDisplayName('token', {
          clientMutationId: 'testid',
          displayName: 'fred',
        });
        expect(profileClient.updateDisplayName).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          displayName: 'fred',
        });
      });
    });

    describe('deleteAvatar', () => {
      it('succeeds', async () => {
        profileClient.avatarDelete = jest.fn().mockResolvedValue(true);
        const result = await resolver.deleteAvatar('token', {
          clientMutationId: 'testid',
          id: 'blah',
        });
        expect(profileClient.avatarDelete).toBeCalledTimes(1);
      });
    });

    describe('updateAvatar', () => {
      // Due to the interactions required between express middleware and
      // the apollo server, no unit testing of the update avatar is feasible.
      // FIXME: Integrated test that verifies file upload functionality.
    });

    describe('createSecondaryEmail', () => {
      it('succeeds', async () => {
        authClient.recoveryEmailCreate = jest.fn().mockResolvedValue(true);
        const result = await resolver.createSecondaryEmail('token', {
          clientMutationId: 'testid',
          email: 'test@example.com',
        });
        expect(authClient.recoveryEmailCreate).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('resendSecondaryEmailCode', () => {
      it('succeeds', async () => {
        authClient.recoveryEmailSecondaryResendCode = jest
          .fn()
          .mockResolvedValue(true);
        const result = await resolver.resendSecondaryEmailCode('token', {
          clientMutationId: 'testid',
          email: 'test@example.com',
        });
        expect(authClient.recoveryEmailSecondaryResendCode).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('verifySecondaryEmail', () => {
      it('succeeds', async () => {
        authClient.recoveryEmailSecondaryVerifyCode = jest
          .fn()
          .mockResolvedValue(true);
        const result = await resolver.verifySecondaryEmail('token', {
          clientMutationId: 'testid',
          email: 'test@example.com',
          code: 'ABCD1234',
        });
        expect(authClient.recoveryEmailSecondaryVerifyCode).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('deleteSecondaryEmail', () => {
      it('succeeds', async () => {
        authClient.recoveryEmailDestroy = jest.fn().mockResolvedValue(true);
        const result = await resolver.deleteSecondaryEmail('token', {
          clientMutationId: 'testid',
          email: 'test@example.com',
        });
        expect(authClient.recoveryEmailDestroy).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('updatePrimaryEmail', () => {
      it('succeeds', async () => {
        authClient.recoveryEmailSetPrimaryEmail = jest
          .fn()
          .mockResolvedValue(true);
        const result = await resolver.updatePrimaryEmail('token', {
          clientMutationId: 'testid',
          email: 'test@example.com',
        });
        expect(authClient.recoveryEmailSetPrimaryEmail).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('attachedClientDisconnect', () => {
      it('succeeds', async () => {
        authClient.attachedClientDestroy = jest.fn().mockResolvedValue(true);
        const result = await resolver.attachedClientDisconnect('token', {
          clientMutationId: 'testid',
          clientId: 'client1234',
          sessionTokenId: 'sesssion1234',
          refreshTokenId: 'refresh1234',
          deviceId: 'device1234',
        });
        expect(authClient.attachedClientDestroy).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('sendSessionVerificationCode', () => {
      it('succeeds', async () => {
        authClient.sessionResendVerifyCode = jest.fn().mockResolvedValue(true);
        const result = await resolver.sendSessionVerificationCode('token', {
          clientMutationId: 'testid',
        });
        expect(authClient.sessionResendVerifyCode).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('verifySession', () => {
      it('succeeds', async () => {
        authClient.sessionVerifyCode = jest.fn().mockResolvedValue(true);
        const result = await resolver.verifySession('token', {
          clientMutationId: 'testid',
          code: 'ABCD1234',
        });
        expect(authClient.sessionVerifyCode).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });
  });
});
