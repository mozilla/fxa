/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Chance from 'chance';
import { DatabaseService } from 'fxa-admin-server/src/database/database.service';
import {
  AttachedDevice,
  mergeCachedSessionTokens,
  SerializableAttachedClient,
  SessionToken as SharedSessionToken,
} from 'fxa-shared/connected-services';
import {
  Account,
  Email,
  EmailBounce,
  EmailType,
  LinkedAccount,
  RecoveryKey,
  SessionToken,
  TotpToken,
} from 'fxa-shared/db/models/auth';
import { uuidTransformer } from 'fxa-shared/db/transformers';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { testDatabaseSetup } from 'fxa-shared/test/db/helpers';
import {
  randomAccount,
  randomDeviceToken,
  randomEmail,
  randomEmailBounce,
  randomLinkedAccount,
  randomOauthClient,
  randomRecoveryKey,
  randomSessionToken,
  randomTotp,
} from 'fxa-shared/test/db/models/auth/helpers';
import { Knex } from 'knex';
import { EventLoggingService } from '../../event-logging/event-logging.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { AccountResolver } from './account.resolver';
import { AuthClientService } from '../../backend/auth-client.service';
import { FirestoreService } from '../../backend/firestore.service';
import { BasketService } from '../../newsletters/basket.service';
import { CloudTasksService } from '../../backend/cloud-tasks.service';
import { NotifierService } from '@fxa/shared/notifier';

export const chance = new Chance();

const USER_1 = randomAccount();
const EMAIL_1 = randomEmail(USER_1);
const EMAIL_BOUNCE_1 = randomEmailBounce(USER_1.email, chance.bool());
const TOTP_1 = randomTotp(USER_1);
const RECOVERY_KEY_1 = randomRecoveryKey(USER_1);
const LINKED_ACCOUNT_1 = randomLinkedAccount(USER_1);
const SESSION_TOKEN_1 = randomSessionToken(USER_1, Date.now());
const DEVICE_TOKEN_1 = randomDeviceToken(SESSION_TOKEN_1.tokenId);
const OAUTH_CLIENT_1 = randomOauthClient(Date.now() - 60 * 1e3);

const USER_2 = randomAccount();
// Fake a different sing up email
const EMAIL_2 = randomEmail({
  ...USER_2,
  email: USER_2.email.replace('@', '+01@'),
});

describe('#integration - AccountResolver', () => {
  let resolver: AccountResolver;
  let logger: any;
  let notifier: any;
  let knex: Knex;
  let db = {
    account: Account,
    emails: Email,
    emailBounces: EmailBounce,
    emailTypes: EmailType,
    totp: TotpToken,
    recoveryKeys: RecoveryKey,
    sessionTokens: SessionToken,
    linkedAccounts: LinkedAccount,
    async authorizedClients(
      uid: string
    ): Promise<SerializableAttachedClient[]> {
      return [OAUTH_CLIENT_1];
    },
    async attachedDevices(uid: string): Promise<AttachedDevice[]> {
      return [DEVICE_TOKEN_1];
    },
    async attachedSessions(uid: string): Promise<SharedSessionToken[]> {
      const sessions: any = await db.sessionTokens
        .query()
        .where('uid', uuidTransformer.to(uid));

      return mergeCachedSessionTokens(sessions, {}, true);
    },
  };
  let authClient: any;
  let basketService: any;
  let firestoreService: any;

  beforeAll(async () => {
    knex = await testDatabaseSetup();

    // Load the users in
    db.account = Account.bindKnex(knex);
    db.emails = Email.bindKnex(knex);
    db.emailBounces = EmailBounce.bindKnex(knex);
    db.emailTypes = EmailType.bindKnex(knex);
    db.totp = TotpToken.bindKnex(knex);
    db.recoveryKeys = RecoveryKey.bindKnex(knex);
    db.sessionTokens = SessionToken.bindKnex(knex);
    db.linkedAccounts = LinkedAccount.bindKnex(knex);
    await (db.account as any).query().insertGraph({
      ...USER_1,
      emails: [EMAIL_1],
    });
    await db.emailBounces.query().insert(EMAIL_BOUNCE_1);
    await db.totp.query().insert(TOTP_1);
    await db.recoveryKeys.query().insert(RECOVERY_KEY_1);
    await db.linkedAccounts.query().insert(LINKED_ACCOUNT_1 as any);
    await db.sessionTokens.query().insert(SESSION_TOKEN_1);
  });

  beforeEach(async () => {
    notifier = { send: jest.fn() };
    const MockNotifier: Provider = {
      provide: NotifierService,
      useValue: notifier,
    };

    logger = { debug: jest.fn(), error: jest.fn(), info: jest.fn() };
    const MockMozLogger: Provider = {
      provide: MozLoggerService,
      useValue: logger,
    };
    const MockConfig: Provider = {
      provide: ConfigService,
      useValue: {
        get: jest.fn().mockReturnValue({
          authHeader: 'test',
          i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en'],
          },
          lastAccessTimeUpdates: {
            earliestSaneTimestamp: 1507081020000,
          },
        }),
      },
    };
    const MockMetricsFactory: Provider = {
      provide: 'METRICS',
      useFactory: () => undefined,
    };

    const MockSubscription: Provider = {
      provide: SubscriptionsService,
      useValue: {
        getSubscriptions: async function () {
          return [];
        },
      },
    };

    const MockCloudTasks: Provider = {
      provide: CloudTasksService,
      useFactory: () => {
        return {
          accountTasks: {
            deleteAccount: jest.fn().mockReturnValue([
              {
                locator: USER_1.email,
                status: 'Pending',
                taskName: 'user-1-task',
              },
              {
                locator: USER_2.email,
                status: 'Pending',
                taskName: 'user-2-task',
              },
            ]),
            getTaskStatus: jest.fn().mockReturnValue([{}, {}]),
          },
        };
      },
    };

    basketService = {};
    const MockBasket: Provider = {
      provide: BasketService,
      useValue: basketService,
    };

    const MockDb: Provider = {
      provide: DatabaseService,
      useValue: db,
    };

    authClient = {};
    const MockAuthClient = {
      provide: AuthClientService,
      useValue: authClient,
    };

    // Not ideal, but we have to do this because
    // of the nested nature of the Firestore documents
    const get = () =>
      Promise.resolve({
        docs: [
          {
            data: () => ({
              name: 'emailSent',
              createdAt: Date.now(),
              eventType: 'emailEvent',
              template: 'recovery',
              flowId: 'flowId',
              service: 'service',
            }),
          },
        ],
      });
    const limit = () => ({ get });
    const collection = () => ({
      orderBy: () => ({ limit }),
      doc: () => ({ collection }),
      limit,
      get,
    });
    firestoreService = { collection };

    const MockFirestoreService = {
      provide: FirestoreService,
      useValue: firestoreService,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountResolver,
        EventLoggingService,
        MockMozLogger,
        MockConfig,
        MockMetricsFactory,
        MockSubscription,
        MockBasket,
        MockDb,
        MockFirestoreService,
        MockAuthClient,
        MockCloudTasks,
        MockNotifier,
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

  it('locates the user by uid', async () => {
    const result = (await resolver.accountByUid(USER_1.uid, 'joe')) as Account;
    expect(result).toBeDefined();
    expect(result.email).toBe(USER_1.email);
    expect(result.verifierSetAt).toBeGreaterThan(0);
    expect(logger.info).toBeCalledTimes(2);
  });

  it('disables an account by uid', async () => {
    const success = (await resolver.disableAccount(USER_1.uid)) as Boolean;
    expect(success).toBeTruthy();
    const updatedResult = (await resolver.accountByUid(
      USER_1.uid,
      'joe'
    )) as Account;
    expect(updatedResult).toBeDefined();
    expect(updatedResult.disabledAt).not.toBeNull();
    expect(logger.info).toBeCalledTimes(3);
    expect(notifier.send).toBeCalledWith({
      event: 'profileDataChange',
      data: {
        ts: expect.any(Number),
        uid: USER_1.uid,
      },
    });
  });

  it('enables an account by uid', async () => {
    const success = (await resolver.enableAccount(USER_1.uid)) as Boolean;
    expect(success).toBeTruthy();
    const updatedResult = (await resolver.accountByUid(
      USER_1.uid,
      'joe'
    )) as Account;
    expect(updatedResult).toBeDefined();
    expect(updatedResult.disabledAt).toBeNull();
    expect(logger.info).toBeCalledTimes(2);
    expect(notifier.send).toBeCalledWith({
      event: 'profileDataChange',
      data: {
        ts: expect.any(Number),
        uid: USER_1.uid,
      },
    });
  });

  it('does not locate non-existent users by uid', async () => {
    const result = await resolver.accountByUid(USER_2.uid, 'joe');
    expect(result).toBeUndefined();
    expect(logger.info).toBeCalledTimes(2);
  });

  it('locates the user by email', async () => {
    const result = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;
    expect(result).toBeDefined();
    expect(result.email).toBe(USER_1.email);
    expect(logger.info).toBeCalledTimes(2);
  });

  it('does not locate non-existent users by email', async () => {
    const result = await resolver.accountByEmail(
      'non-existent@test.com',
      true,
      'joe'
    );
    expect(result).toBeUndefined();
    expect(logger.info).toBeCalledTimes(2);
  });

  it('locate users by sign-up email', async () => {
    const result = await resolver.accountByEmail(USER_2.email, true, 'joe');
    expect(result).toBeUndefined();
    expect(logger.info).toBeCalledTimes(2);
  });

  it('locates users by secondary email', async () => {
    const result = await resolver.accountByEmail(EMAIL_2.email, true, 'joe');
    expect(result).toBeUndefined();
    expect(logger.info).toBeCalledTimes(2);
  });

  it('loads emailBounces', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;
    const { emailType: templateName } =
      (await db.emailTypes
        .query()
        .findOne({ id: EMAIL_BOUNCE_1.emailTypeId })) || {};
    const result = await resolver.emailBounces(user);
    expect(result).toBeDefined();
    const bounce = result[0];
    const { emailTypeId, ...bounceValues } = EMAIL_BOUNCE_1;
    expect(bounce).toEqual(
      expect.objectContaining({ ...bounceValues, templateName })
    );
  });

  it('loads emails', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;
    const result = await resolver.emails(user);
    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
  });

  it('loads totp', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;
    const result = await resolver.totp(user);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].uid).toEqual(TOTP_1.uid);
  });

  it('loads recoveryKeys', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;
    const result = await resolver.recoveryKeys(user);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].uid).toEqual(RECOVERY_KEY_1.uid);
  });

  it('loads attached clients', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;
    const result = await resolver.attachedClients(user);
    expect(result).toBeDefined();
    expect(result.length).toBe(2);

    // Session, with known device, device and session merge.
    expect(result[0].name).toEqual(DEVICE_TOKEN_1.name);
    expect(result[0].deviceId).toEqual(DEVICE_TOKEN_1.id);
    expect(result[0].deviceType).toEqual(SESSION_TOKEN_1.uaDeviceType);
    expect(result[0].sessionTokenId).toEqual('[REDACTED]');
    expect(result[0].refreshTokenId).toBeNull();

    // OAuth client
    expect(result[1].name).toEqual(OAUTH_CLIENT_1.client_name);
    expect(result[1].clientId).toEqual(OAUTH_CLIENT_1.client_id);
    expect(result[1].deviceType).toBeNull();
    expect(result[1].sessionTokenId).toBeNull();
    expect(result[1].refreshTokenId).toEqual('[REDACTED]');
  });

  it('loads linkedAccounts', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;
    const result = await resolver.linkedAccounts(user);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
  });

  it('edits locale', async () => {
    const result1 = await resolver.editLocale(USER_1.uid, 'en-CA');
    const result2 =
      (await resolver.accountByEmail(USER_1.email, true, 'joe')) || ({} as any);
    expect(result1).toBe(true);
    expect(result2.locale).toBe('en-CA');
    expect(notifier.send).toBeCalledWith({
      event: 'profileDataChange',
      data: {
        ts: expect.any(Number),
        uid: USER_1.uid,
      },
    });
  });

  it('sends password reset email', async () => {
    authClient.passwordForgotSendCode = jest.fn().mockResolvedValue(true);
    const result = await resolver.sendPasswordResetEmail(USER_1.email);
    expect(authClient.passwordForgotSendCode).toBeCalledTimes(1);
    expect(result).toBe(true);
  });

  describe('unsubscribes from mailing lists', () => {
    const fakeToken = '123';
    const uid = USER_1.uid;
    const badUid = uid.replace(/\d/g, '0');
    const email = USER_1.email;

    beforeEach(() => {
      basketService.getUserToken = jest.fn().mockResolvedValue(fakeToken);
      basketService.unsubscribeAll = jest.fn().mockResolvedValue(true);
    });

    it('unsubscribes successfully', async () => {
      const result = await resolver.unsubscribeFromMailingLists(uid);

      expect(basketService.getUserToken).toBeCalledWith(email);
      expect(basketService.unsubscribeAll).toBeCalledWith(fakeToken);
      expect(result).toBeTruthy();
    });

    it('handles bad request - unsubscribe', async () => {
      basketService.unsubscribeAll = jest.fn().mockResolvedValue(undefined);

      const result = await resolver.unsubscribeFromMailingLists(uid);

      expect(basketService.getUserToken).toBeCalledWith(USER_1.email);
      expect(basketService.unsubscribeAll).toBeCalledWith(fakeToken);
      expect(result).toBeFalsy();
    });

    it('handles bad request - invalid basket user', async () => {
      basketService.getUserToken = jest.fn().mockResolvedValue(undefined);

      const result = await resolver.unsubscribeFromMailingLists(uid);

      expect(basketService.getUserToken).toBeCalledWith(email);
      expect(basketService.unsubscribeAll).toBeCalledTimes(0);
      expect(result).toBeFalsy();
    });

    it('handles bad request - invalid fxa user', async () => {
      basketService.getUserToken = jest.fn().mockResolvedValue(undefined);
      basketService.unsubscribeAll = jest.fn().mockResolvedValue(undefined);

      const result = await resolver.unsubscribeFromMailingLists(badUid);

      expect(basketService.getUserToken).toBeCalledTimes(0);
      expect(basketService.unsubscribeAll).toBeCalledTimes(0);
      expect(result).toBeFalsy();
    });
  });

  it('loads account events', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;
    const result = await resolver.accountEvents(user);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
  });

  it('loads verifierSetAt', async () => {
    const user = (await resolver.accountByEmail(
      USER_1.email,
      true,
      'joe'
    )) as Account;

    expect(user).toBeDefined();
    expect(user.verifierSetAt).toBeDefined();
  });

  it('deletes accounts', async () => {
    const result = await resolver.deleteAccounts([USER_1.email], 'joe');

    const user1 = result.find((x) => x.locator === USER_1.email);
    expect(user1?.status).toEqual('Success');
    expect(user1?.taskName).not.toEqual('');

    const statusResult = await resolver.getDeleteStatus([user1!.taskName]);

    expect(
      statusResult.find((x) => x.taskName === user1!.taskName)?.status
    ).toBeDefined();
  });

  it('attempts to delete invalid account and indicates failure', async () => {
    const result = await resolver.deleteAccounts(
      ['foobazzzz@mozilla.com'],
      'joe'
    );
    expect(result).toBeDefined();
    expect(result[0].locator).toEqual('foobazzzz@mozilla.com');
    expect(result[0].status).toEqual('No account found');
    expect(result[0].taskName).toEqual('');
  });
});
