/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Account, SessionToken } from 'fxa-shared/db/models/auth';
import { CustomsService } from 'fxa-shared/nestjs/customs/customs.service';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { Knex } from 'knex';

import {
  chance,
  randomAccount,
  randomSession,
  testDatabaseSetup,
} from '../../test/helpers';
import { AuthClientService } from '../backend/auth-client.service';
import { ProfileClientService } from '../backend/profile-client.service';
import { AccountResolver } from './account.resolver';
import { NotifierService, NotifierSnsService } from '@fxa/shared/notifier';

let USER_1: any;
let SESSION_1: any;

describe('#integration - AccountResolver', () => {
  const headers = new Headers({
    'x-forwarded-for': '123.123.123.123',
  });
  let resolver: AccountResolver;
  let logger: any;
  let knex: Knex;
  let authClient: any;
  let profileClient: any;
  let notifierSnsService: any;
  let notifierService: any;

  beforeAll(async () => {
    knex = await testDatabaseSetup();
    USER_1 = randomAccount();
    SESSION_1 = await randomSession(USER_1);
    // Load the users in
    await (Account as any).query().insertGraph({ ...USER_1 });
    await (SessionToken as any).query().insertGraph({ ...SESSION_1 });
  });

  beforeEach(async () => {
    logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };
    notifierService = {
      send: jest.fn(),
    };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    const MockMetricsFactory: Provider = {
      provide: 'METRICS',
      useFactory: () => undefined,
    };
    const MockLogger: Provider = {
      provide: Logger,
      useValue: logger,
    };
    const MockNotifierSns: Provider = {
      provide: NotifierSnsService,
      useValue: notifierSnsService,
    };
    const MockNotifierService: Provider = {
      provide: NotifierService,
      useValue: notifierService,
    };
    authClient = {};
    profileClient = {
      deleteCache: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountResolver,
        MockMozLogger,
        MockMetricsFactory,
        MockLogger,
        MockNotifierSns,
        MockNotifierService,
        { provide: CustomsService, useValue: {} },
        { provide: AuthClientService, useValue: authClient },
        { provide: ProfileClientService, useValue: profileClient },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue({ url: 'test' }) },
        },
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
        (resolver as any).shouldIncludeLinkedAccounts = jest
          .fn()
          .mockReturnValue(true);
        (resolver as any).shouldIncludeSecurityEvents = jest
          .fn()
          .mockReturnValue(true);
        const result = await resolver.account(USER_1.uid, {} as any);
        expect(result?.createdAt).toBe(USER_1.createdAt);
      });

      it('resolves account created', async () => {
        const user = await Account.findByUid(USER_1.uid);
        expect(resolver.accountCreated(user!)).toBe(USER_1.createdAt);
      });

      it('resolves password created', async () => {
        const user = await Account.findByUid(USER_1.uid);
        expect(resolver.passwordCreated(user!)).toBe(USER_1.verifierSetAt);
      });

      it('resolves emails with null', async () => {
        const user = await Account.findByUid(USER_1.uid);
        const emails = resolver.emails(user!);
        expect(emails).toBeNull();
      });

      it('resolves emails when loaded', async () => {
        const user = await Account.findByUid(USER_1.uid, {
          include: ['emails'],
        });
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
        const result = await resolver.subscriptions('token', headers);
        expect(result).toStrictEqual([{ key: 1, keyTwo: 2 }]);
      });

      it('resolves recoveryKey', async () => {
        authClient.recoveryKeyExists = jest
          .fn()
          .mockResolvedValue({ exists: true, estimatedSyncDeviceCount: 1 });
        const result = await resolver.recoveryKey('token', headers);
        expect(result.exists).toBeTruthy();
        expect(result.estimatedSyncDeviceCount).toBe(1);
      });

      it('resolves totp', async () => {
        authClient.checkTotpTokenExists = jest.fn().mockResolvedValue(true);
        const result = await resolver.totp('token', headers);
        expect(result).toBeTruthy();
      });

      it('resolves attachedClients', async () => {
        authClient.attachedClients = jest.fn().mockResolvedValue(true);
        const result = await resolver.attachedClients('token', headers);
        expect(result).toBeTruthy();
      });

      it('resolves linked accounts with empty array', async () => {
        const user = await Account.findByUid(USER_1.uid);
        const linkedAccounts = resolver.linkedAccounts(user!);
        expect(linkedAccounts).toEqual([]);
      });

      it('resolves linked accounts when loaded', async () => {
        const user = await Account.findByUid(USER_1.uid, {
          include: ['linkedAccounts'],
        });
        const authAt = Date.now();
        (user!.linkedAccounts as any) = [
          { providerId: 1, enabled: true, authAt },
        ];
        const linkedAccounts = resolver.linkedAccounts(user!);
        expect(linkedAccounts).toStrictEqual([
          { providerId: 1, enabled: true, authAt },
        ]);
      });

      it('resolves security events when included', async () => {
        const user = await Account.findByUid(USER_1.uid, {
          include: ['securityEvents'],
        });
        const createdAt = Date.now();
        (user!.securityEvents as any) = [
          { name: 'account.created', verified: true, createdAt },
        ];
        const securityEvents = resolver.securityEvents(user!);
        expect(securityEvents).toStrictEqual([
          {
            name: 'account.created',
            verified: true,
            createdAt,
            ipAddr: undefined,
          },
        ]);
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
        const result = await resolver.createTotp('token', headers, {
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
        const result = await resolver.verifyTotp('token', headers, {
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
        const result = await resolver.deleteTotp('token', headers, {
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
        const result = await resolver.deleteRecoveryKey('token', headers, {
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
        const result = await resolver.changeRecoveryCodes('token', headers, {
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
        const result = await resolver.updateDisplayName('token', headers, {
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
        await resolver.deleteAvatar('token', headers, {
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
        const result = await resolver.createSecondaryEmail('token', headers, {
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
        const result = await resolver.resendSecondaryEmailCode(
          'token',
          headers,
          {
            clientMutationId: 'testid',
            email: 'test@example.com',
          }
        );
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
        const result = await resolver.verifySecondaryEmail('token', headers, {
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
        const result = await resolver.deleteSecondaryEmail('token', headers, {
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
        const result = await resolver.updatePrimaryEmail('token', headers, {
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
        const result = await resolver.attachedClientDisconnect(
          'token',
          headers,
          {
            clientMutationId: 'testid',
            clientId: 'client1234',
            sessionTokenId: 'sesssion1234',
            refreshTokenId: 'refresh1234',
            deviceId: 'device1234',
          }
        );
        expect(authClient.attachedClientDestroy).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('sendSessionVerificationCode', () => {
      it('succeeds', async () => {
        authClient.sessionResendVerifyCode = jest.fn().mockResolvedValue(true);
        const result = await resolver.sendSessionVerificationCode(
          'token',
          headers,
          {
            clientMutationId: 'testid',
          }
        );
        expect(authClient.sessionResendVerifyCode).toBeCalledTimes(1);
        expect(authClient.sessionResendVerifyCode).toHaveBeenCalledWith(
          'token',
          headers
        );
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('verifySession', () => {
      it('succeeds', async () => {
        authClient.sessionVerifyCode = jest.fn().mockResolvedValue(true);
        const result = await resolver.verifySession('token', headers, {
          clientMutationId: 'testid',
          code: 'ABCD1234',
        });
        expect(authClient.sessionVerifyCode).toBeCalledTimes(1);
        expect(authClient.sessionVerifyCode).toHaveBeenCalledWith(
          'token',
          'ABCD1234',
          undefined,
          headers
        );
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('metricsOpt', () => {
      it('opts out', async () => {
        const result = await resolver.metricsOpt(headers, USER_1.uid, {
          clientMutationId: 'testid',
          state: 'out',
        });
        const user = await Account.findByUid(USER_1.uid);
        expect(user?.metricsOptOutAt).toBeGreaterThan(0);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
        expect(notifierService.send).toBeCalledWith({
          event: 'profileDataChange',
          data: {
            ts: expect.any(Number),
            uid: USER_1.uid,
          },
        });
      });

      it('opts in', async () => {
        const result = await resolver.metricsOpt(headers, USER_1.uid, {
          clientMutationId: 'testid',
          state: 'in',
        });
        const user = await Account.findByUid(USER_1.uid);
        expect(user?.metricsOptOutAt).toBeNull();
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
        expect(notifierService.send).toBeCalledWith({
          event: 'profileDataChange',
          data: {
            ts: expect.any(Number),
            uid: USER_1.uid,
          },
        });
      });

      it('fails with bad opt in state', async () => {
        await expect(
          resolver.metricsOpt(headers, USER_1.uid, {
            clientMutationId: 'testid',
            state: 'In' as 'in',
          })
        ).rejects.toThrow(
          'Invalid metrics opt state! State must be in or out, but recieved In.'
        );
      });
    });

    describe('passwordForgotSendCode', () => {
      it('succeeds', async () => {
        authClient.passwordForgotSendCode = jest.fn().mockResolvedValue({
          clientMutationId: 'testid',
          passwordForgotToken: 'cooltokenyo',
        });
        const result = await resolver.passwordForgotSendCode(headers, {
          email: 'howdy@yo.com',
        });
        expect(authClient.passwordForgotSendCode).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          passwordForgotToken: 'cooltokenyo',
        });
      });
    });

    describe('passwordForgotVerifyCode', () => {
      it('succeeds', async () => {
        authClient.passwordForgotVerifyCode = jest.fn().mockResolvedValue({
          clientMutationId: 'testid',
          accountResetToken: 'cooltokenyo',
        });
        const result = await resolver.passwordForgotVerifyCode(headers, {
          token: 'passwordforgottoken',
          code: 'code',
        });
        expect(authClient.passwordForgotVerifyCode).toBeCalledTimes(1);
        expect(authClient.passwordForgotVerifyCode).toHaveBeenLastCalledWith(
          'code',
          'passwordforgottoken',
          {},
          headers
        );
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          accountResetToken: 'cooltokenyo',
        });
      });
    });

    describe('passwordForgotCodeStatus', () => {
      it('succeeds', async () => {
        authClient.passwordForgotStatus = jest.fn().mockResolvedValue({
          clientMutationId: 'testid',
          tries: 1,
          ttl: 2,
        });
        const result = await resolver.passwordForgotCodeStatus(headers, {
          token: 'passwordforgottoken',
        });
        expect(authClient.passwordForgotStatus).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          tries: 1,
          ttl: 2,
        });
      });
    });

    describe('accountReset', () => {
      it('succeeds', async () => {
        const now = Date.now();
        authClient.accountResetAuthPW = jest.fn().mockResolvedValue({
          clientMutationId: 'testid',
          uid: 'uid',
          verified: true,
          sessionToken: 'sessionToken',
          authAt: now,
          keyFetchToken: 'keyFetchToken',
        });
        const result = await resolver.accountReset(headers, {
          newPasswordAuthPW: 'passwordAuthPW',
          accountResetToken: 'token',
          options: {},
        });
        expect(authClient.accountResetAuthPW).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          uid: 'uid',
          verified: true,
          sessionToken: 'sessionToken',
          authAt: now,
          keyFetchToken: 'keyFetchToken',
        });
      });

      it('succeeds for v2', async () => {
        const now = Date.now();
        authClient.accountResetAuthPW = jest.fn().mockResolvedValue({
          clientMutationId: 'testid',
          uid: 'uid',
          verified: true,
          sessionToken: 'sessionToken',
          authAt: now,
          keyFetchTokenVersion2: 'keyFetchToken',
        });
        const result = await resolver.accountReset(headers, {
          newPasswordAuthPW: '0101'.repeat(8),
          accountResetToken: '2121'.repeat(8),
          newPasswordV2: {
            wrapKb: '1212'.repeat(8),
            authPWVersion2: '2323'.repeat(8),
            wrapKbVersion2: '3434'.repeat(8),
            clientSalt:
              'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
          },
          options: {},
        });
        expect(authClient.accountResetAuthPW).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
          uid: 'uid',
          verified: true,
          sessionToken: 'sessionToken',
          authAt: now,
          keyFetchTokenVersion2: 'keyFetchToken',
        });
      });
    });

    describe('signUp', () => {
      it('calls auth-client and proxy the result', async () => {
        const now = Date.now();
        const mockRespPayload = {
          clientMutationId: 'testid',
          uid: '1337',
          sessionToken: '2048',
          verified: true,
          authAt: now,
        };
        authClient.signUpWithAuthPW = jest
          .fn()
          .mockResolvedValue(mockRespPayload);
        const result = await resolver.signUp(headers, {
          authPW: '00000000',
          email: 'testo@example.xyz',
          options: { service: 'testo-co', atLeast18AtReg: false },
        });
        expect(authClient.signUpWithAuthPW).toBeCalledTimes(1);
        expect(authClient.signUpWithAuthPW).toBeCalledWith(
          'testo@example.xyz',
          '00000000',
          {},
          { service: 'testo-co', atLeast18AtReg: false },
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });

      it('calls auth-client and proxy the result with V2 password', async () => {
        const now = Date.now();
        const mockRespPayload = {
          clientMutationId: 'testid',
          uid: '1337',
          sessionToken: '2048',
          verified: true,
          authAt: now,
        };
        authClient.signUpWithAuthPW = jest
          .fn()
          .mockResolvedValue(mockRespPayload);
        const result = await resolver.signUp(headers, {
          authPW: '00000000',
          email: 'testo@example.xyz',
          passwordV2: {
            wrapKb: '1234'.repeat(8),
            authPWVersion2: '1234'.repeat(8),
            wrapKbVersion2: '1234'.repeat(8),
            clientSalt:
              'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
          },
          options: { service: 'testo-co', atLeast18AtReg: false },
        });
        expect(authClient.signUpWithAuthPW).toBeCalledTimes(1);
        expect(authClient.signUpWithAuthPW).toBeCalledWith(
          'testo@example.xyz',
          '00000000',
          {
            wrapKb: '1234'.repeat(8),
            authPWVersion2: '1234'.repeat(8),
            wrapKbVersion2: '1234'.repeat(8),
            clientSalt:
              'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
          },
          { service: 'testo-co', atLeast18AtReg: false },
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });
    });

    describe('finishSetup', () => {
      it('calls auth-client and proxy the result', async () => {
        const mockRespPayload = {
          clientMutationId: 'testid',
          uid: '1337',
          sessionToken: '2048',
          verified: true,
        };
        authClient.finishSetupWithAuthPW = jest
          .fn()
          .mockResolvedValue(mockRespPayload);
        const result = await resolver.finishSetup(headers, {
          token: 'jwttothemax',
          authPW: '00000000',
        });
        expect(authClient.finishSetupWithAuthPW).toBeCalledTimes(1);
        expect(authClient.finishSetupWithAuthPW).toBeCalledWith(
          'jwttothemax',
          '00000000',
          {},
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });

      it('calls auth-client and proxy the result with V2 password', async () => {
        const mockRespPayload = {
          clientMutationId: 'testid',
          uid: '1337',
          sessionToken: '2048',
          verified: true,
        };
        authClient.finishSetupWithAuthPW = jest
          .fn()
          .mockResolvedValue(mockRespPayload);
        const result = await resolver.finishSetup(headers, {
          token: 'jwttothemax',
          authPW: '00000000',
          passwordV2: {
            wrapKb: '1234'.repeat(8),
            authPWVersion2: '1234'.repeat(8),
            wrapKbVersion2: '1234'.repeat(8),
            clientSalt:
              'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
          },
        });
        expect(authClient.finishSetupWithAuthPW).toBeCalledTimes(1);
        expect(authClient.finishSetupWithAuthPW).toBeCalledWith(
          'jwttothemax',
          '00000000',
          {
            wrapKb: '1234'.repeat(8),
            authPWVersion2: '1234'.repeat(8),
            wrapKbVersion2: '1234'.repeat(8),
            clientSalt:
              'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
          },
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });
    });

    describe('signIn', () => {
      it('calls auth-client and proxy the result', async () => {
        const now = Date.now();
        const mockRespPayload = {
          clientMutationId: 'testid',
          uid: '1337',
          sessionToken: '2048',
          verified: true,
          authAt: now,
          metricsEnabled: true,
        };
        authClient.signInWithAuthPW = jest
          .fn()
          .mockResolvedValue(mockRespPayload);
        const result = await resolver.signIn(headers, {
          authPW: '00000000',
          email: 'testo@example.xyz',
          options: { service: 'testo-co' },
        });
        expect(authClient.signInWithAuthPW).toBeCalledTimes(1);
        expect(authClient.signInWithAuthPW).toBeCalledWith(
          'testo@example.xyz',
          '00000000',
          { service: 'testo-co' },
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });
    });

    describe('credentialSet', () => {
      it('calls auth-client and proxy the result', async () => {
        const mockRespPayload = {
          version: 'v2',
          upgradeNeeded: false,
          clientSalt:
            'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
        };
        authClient.getCredentialStatusV2 = jest
          .fn()
          .mockResolvedValue(mockRespPayload);

        const result = await resolver.credentialStatus(
          headers,
          'testo@example.xyz'
        );

        expect(authClient.getCredentialStatusV2).toBeCalledTimes(1);
        expect(authClient.getCredentialStatusV2).toBeCalledWith(
          'testo@example.xyz',
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });
    });

    describe('password start', () => {
      it('calls auth-client and proxies result', async () => {
        const mockRespPayload = {
          keyFetchToken: '123456789abcdef',
          passwordChangeToken: '23456789abcdef1',
        };
        authClient.passwordChangeStartWithAuthPW = jest
          .fn()
          .mockResolvedValue(mockRespPayload);

        const result = await resolver.passwordChangeStart(headers, {
          email: 'foo@moz.com',
          oldAuthPW: '3456789abcdef12',
        });

        expect(authClient.passwordChangeStartWithAuthPW).toBeCalledTimes(1);
        expect(authClient.passwordChangeStartWithAuthPW).toBeCalledWith(
          'foo@moz.com',
          '3456789abcdef12',
          {},
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });
    });

    describe('password finish', () => {
      it('calls auth-client and proxies result', async () => {
        const mockRespPayload = {
          keyFetchToken: '123456789abcdef',
          passwordChangeToken: '23456789abcdef1',
        };
        authClient.passwordChangeFinish = jest
          .fn()
          .mockResolvedValue(mockRespPayload);

        const result = await resolver.passwordChangeFinish(headers, {
          passwordChangeToken: 'passwordChangeToken',
          authPW: 'authPW',
          wrapKb: 'wrapKb',
          wrapKbVersion2: 'wrapKbVersion2',
          authPWVersion2: 'authPWVersion2',
          clientSalt: 'clientSalt',
          keys: true,
        });

        expect(authClient.passwordChangeFinish).toBeCalledTimes(1);
        expect(authClient.passwordChangeFinish).toBeCalledWith(
          'passwordChangeToken',
          {
            authPW: 'authPW',
            wrapKb: 'wrapKb',
            sessionToken: undefined,
            wrapKbVersion2: 'wrapKbVersion2',
            authPWVersion2: 'authPWVersion2',
            clientSalt: 'clientSalt',
          },
          {
            keys: true,
          },
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });
    });

    describe('wrapped keys', () => {
      it('calls auth-client and proxies result', async () => {
        const mockRespPayload = {
          kA: '123456789abcdef',
          wrapKB: '23456789abcdef1',
        };
        authClient.wrappedAccountKeys = jest
          .fn()
          .mockResolvedValue(mockRespPayload);

        const keyFetchToken = '123456789abcdef';
        const result = await resolver.wrappedAccountKeys(
          headers,
          keyFetchToken
        );

        expect(authClient.wrappedAccountKeys).toBeCalledTimes(1);
        expect(authClient.wrappedAccountKeys).toBeCalledWith(
          keyFetchToken,
          headers
        );
        expect(result).toStrictEqual(mockRespPayload);
      });
    });

    describe('accountStatus', () => {
      it('returns true with valid session token', async () => {
        const result = await resolver.accountStatus({
          token: '00000000000000000000000000000000',
        });
        expect(result.exists).toEqual(true);
      });

      it('returns false with invalid session token', async () => {
        const invalidTokenId = chance.guid({ version: 4 }).replace(/-/g, '');
        const result = await resolver.accountStatus({
          token: invalidTokenId,
        });
        expect(result.exists).toEqual(false);
      });

      it('return true with valid uid', async () => {
        const result = await resolver.accountStatus({
          uid: USER_1.uid,
        });
        expect(result.exists).toEqual(true);
      });

      it('returns false with invalid uid', async () => {
        const fakeAccount = randomAccount();
        const result = await resolver.accountStatus({
          uid: fakeAccount.uid,
        });
        expect(result.exists).toEqual(false);
      });
    });

    describe('rejectUnblockCode', () => {
      it('calls the db to consume the unblock code', async () => {
        const spy = jest
          .spyOn(Account, 'consumeUnblockCode')
          .mockResolvedValue({});
        await resolver.rejectUnblockCode({
          uid: '1337',
          unblockCode: 'oops',
        });
        expect(Account.consumeUnblockCode).toBeCalledTimes(1);
        expect(Account.consumeUnblockCode).toBeCalledWith('1337', 'OOPS');
        spy.mockRestore();
      });
    });

    describe('emailVerifyCode', () => {
      it('succeeds', async () => {
        authClient.verifyCode = jest.fn().mockResolvedValue({
          uid: 'cooltokenyo',
          code: 'coolcode',
          options: { service: 'sync' },
        });
        const result = await resolver.emailVerifyCode(headers, {
          uid: 'cooltokenyo',
          code: 'coolcode',
          service: 'sync',
          clientMutationId: 'testid',
        });
        expect(authClient.verifyCode).toBeCalledTimes(1);
        expect(result).toStrictEqual({
          clientMutationId: 'testid',
        });
      });
    });

    describe('getRecoveryKeyBundle', () => {
      it('succeeds', async () => {
        authClient.getRecoveryKey = jest.fn().mockResolvedValue({
          recoveryData: 'recoveryData',
        });
        const result = await resolver.getRecoveryKeyBundle(headers, {
          accountResetToken: 'cooltokenyo',
          recoveryKeyId: 'recoveryKeyId',
        });
        expect(authClient.getRecoveryKey).toBeCalledWith(
          'cooltokenyo',
          'recoveryKeyId',
          expect.any(Object)
        );
        expect(result).toStrictEqual({
          recoveryData: 'recoveryData',
        });
      });
    });
  });
});
