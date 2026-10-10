/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import * as authDb from 'fxa-shared/db/models/auth';
import { Account, Email } from 'fxa-shared/db/models/auth';
import { CartManager } from '@fxa/payments/cart';
import { ProfileClient } from '@fxa/profile/client';
import { NotifierService } from '@fxa/shared/notifier';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { EmailService } from '../../backend/email.service';
import {
  CloudTasks,
  CloudTasksService,
} from '../../backend/cloud-tasks.service';
import { FirestoreService } from '../../backend/firestore.service';
import { FidoMdsService } from '../../backend/fido-mds.service';
import { DatabaseService } from '../../database/database.service';
import {
  EventLoggingService,
  EventNames,
} from '../../event-logging/event-logging.service';
import { BasketService } from '../../newsletters/basket.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { AccountDeleteStatus, AccountResetStatus } from '../../types';
import { uuidTransformer } from '../../database/transformers';
import { AccountController } from './account.controller';

// AccountController imports SentryTraced from @sentry/nestjs, whose module init
// does not run under Jest; stub the decorator to a no-op.
jest.mock('@sentry/nestjs', () => ({ SentryTraced: () => () => undefined }));
// The ESM namespace is not spyable, so replace captureException at the module.
jest.mock('@sentry/node', () => ({
  ...jest.requireActual('@sentry/node'),
  captureException: jest.fn(),
}));

describe('AccountController', () => {
  let controller: AccountController;
  let eventLogging: DeepMocked<EventLoggingService>;
  let emailService: DeepMocked<EmailService>;
  let cloudTask: DeepMocked<CloudTasks>;
  let notifier: DeepMocked<NotifierService>;

  // The account-lookup query builder (resetAccounts/deleteAccounts). `first`
  // (email locator) and `findOne` (uid locator) are the terminal calls that
  // decide whether an account was found; the `givenAccount` helper below points
  // both at a test-defined value. Chain methods return `this`, so they can't be
  // typed against the builder without a circular reference — plain jest.Mocks
  // keep it simple.
  let accountQuery: {
    select: jest.Mock;
    innerJoin: jest.Mock;
    update: jest.Mock;
    where: jest.Mock;
    findOne: jest.Mock;
    first: jest.Mock;
  };

  // Table query mocks. db.knex(table) returns the mock for that table, and
  // each is awaited directly (no terminal call), so it is thenable and
  // resolves to the table's `*Result` value.
  let knexMock: jest.Mock;
  let passkeyQuery: {
    select: jest.Mock;
    delete: jest.Mock;
    join: jest.Mock;
    leftJoin: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    then: jest.Mock;
  };
  let passkeyWrapQuery: typeof passkeyQuery;
  let passkeyResult: unknown;
  let passkeyWrapResult: unknown;
  let securityEvents: { create: jest.Mock };

  const MOCK_UID = 'f9416ce3703e4916a4cd6b1e665a3f1a';
  const MOCK_CREDENTIAL_ID = 'AQIDBAUGBwgJCg';
  const EMAIL_LOCATOR = 'user@example.com';
  const NO_ACCOUNT_LOCATOR = 'nobody@example.com';
  const MOCK_USER = 'admin@mozilla.com';
  const NOTIFICATION_EMAIL = 'notify@mozilla.com';
  let db: DeepMocked<DatabaseService>;
  let profileClient: DeepMocked<ProfileClient>;

  const mockAccount = { uid: MOCK_UID, email: EMAIL_LOCATOR } as Account;
  const mockRequest = { headers: {}, ip: '127.0.0.1' } as unknown as Request;

  /**
   * Helper to set the db mock state to return a given account.
   * @param account
   */
  const givenAccount = (account?: Account) => {
    accountQuery.first.mockResolvedValue(account);
    accountQuery.findOne.mockResolvedValue(account);
  };

  beforeEach(async () => {
    eventLogging = createMock<EventLoggingService>();
    emailService = createMock<EmailService>();
    cloudTask = createMock<CloudTasks>();
    notifier = createMock<NotifierService>();

    accountQuery = {
      select: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      first: jest.fn(),
    };
    profileClient = createMock<ProfileClient>();
    givenAccount(undefined); // default: no account found

    // Deletes resolve to a row count; default both tables to a hit.
    passkeyResult = 2;
    passkeyWrapResult = 1;
    const tableQuery = (result: () => unknown) => ({
      select: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      join: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      then: jest.fn((resolve, reject) =>
        Promise.resolve().then(result).then(resolve, reject)
      ),
    });
    passkeyQuery = tableQuery(() => passkeyResult);
    passkeyWrapQuery = tableQuery(() => passkeyWrapResult);
    knexMock = jest.fn((table: string) =>
      table === 'passkeyWraps' ? passkeyWrapQuery : passkeyQuery
    );
    securityEvents = { create: jest.fn().mockResolvedValue({}) };

    db = createMock<DatabaseService>({
      account: { query: jest.fn().mockReturnValue(accountQuery) } as any,
      knex: knexMock as any,
      securityEvents: securityEvents as any,
    });

    const stub = (provide: any): Provider => ({ provide, useValue: {} });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountController,
        { provide: EventLoggingService, useValue: eventLogging },
        { provide: EmailService, useValue: emailService },
        { provide: CloudTasksService, useValue: cloudTask },
        { provide: NotifierService, useValue: notifier },
        { provide: MozLoggerService, useValue: createMock<MozLoggerService>() },
        { provide: DatabaseService, useValue: db },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test') },
        },
        stub(CartManager),
        stub(SubscriptionsService),
        stub(BasketService),
        stub(FirestoreService),
        { provide: ProfileClient, useValue: profileClient },
        stub(FidoMdsService),
        { provide: Firestore, useValue: {} },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('resetAccounts', () => {
    it('logs the resetAccounts admin-panel event', async () => {
      await controller.resetAccounts(
        NO_ACCOUNT_LOCATOR,
        '',
        MOCK_USER,
        mockRequest
      );

      expect(eventLogging.onEvent).toHaveBeenCalledWith(
        EventNames.ResetAccounts
      );
    });

    it('returns a NoAccount result for a locator that resolves to no account', async () => {
      const result = await controller.resetAccounts(
        NO_ACCOUNT_LOCATOR,
        '',
        MOCK_USER,
        mockRequest
      );

      expect(result).toEqual([
        { locator: NO_ACCOUNT_LOCATOR, status: AccountResetStatus.NoAccount },
      ]);
    });

    describe('when the account is found', () => {
      let result: Awaited<ReturnType<AccountController['resetAccounts']>>;

      beforeEach(async () => {
        givenAccount(mockAccount);
        // Static ORM methods the controller calls outside DI.
        jest.spyOn(Account, 'reset').mockResolvedValue(undefined as never);
        jest.spyOn(Email, 'findByUid').mockResolvedValue([]);

        result = await controller.resetAccounts(
          EMAIL_LOCATOR,
          '',
          MOCK_USER,
          mockRequest
        );
      });

      it('resets the account credentials', () => {
        expect(Account.reset).toHaveBeenCalledWith(
          expect.objectContaining({ uid: MOCK_UID })
        );
      });

      it('sends the password-change-required email', () => {
        expect(emailService.sendPasswordChangeRequired).toHaveBeenCalledWith(
          mockAccount
        );
      });

      it('returns a Success result', () => {
        expect(result).toEqual([
          { locator: EMAIL_LOCATOR, status: AccountResetStatus.Success },
        ]);
      });
    });

    it('sends a notification when a notification email is provided', async () => {
      await controller.resetAccounts(
        NO_ACCOUNT_LOCATOR,
        NOTIFICATION_EMAIL,
        MOCK_USER,
        mockRequest
      );

      expect(emailService.sendPasswordResetNotification).toHaveBeenCalledWith(
        NOTIFICATION_EMAIL,
        [{ locator: NO_ACCOUNT_LOCATOR, status: AccountResetStatus.NoAccount }]
      );
    });

    it('does not send a notification when no notification email is provided', async () => {
      await controller.resetAccounts(
        NO_ACCOUNT_LOCATOR,
        '',
        MOCK_USER,
        mockRequest
      );

      expect(emailService.sendPasswordResetNotification).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccounts', () => {
    it('logs the deleteAccounts admin-panel event', async () => {
      await controller.deleteAccounts(NO_ACCOUNT_LOCATOR, MOCK_USER);

      expect(eventLogging.onEvent).toHaveBeenCalledWith(
        EventNames.DeleteAccounts
      );
    });

    it('returns NoAccount for a locator that resolves to no account', async () => {
      const result = await controller.deleteAccounts(
        NO_ACCOUNT_LOCATOR,
        MOCK_USER
      );

      expect(result).toEqual([
        {
          taskName: '',
          locator: NO_ACCOUNT_LOCATOR,
          status: AccountDeleteStatus.NoAccount,
        },
      ]);
    });

    describe('when the account is found', () => {
      let result: Awaited<ReturnType<AccountController['deleteAccounts']>>;

      beforeEach(async () => {
        givenAccount(mockAccount);
        jest
          .spyOn(authDb, 'getAccountCustomerByUid')
          .mockResolvedValue({ stripeCustomerId: 'cus_123' } as never);
        (cloudTask.accountTasks.deleteAccount as jest.Mock).mockResolvedValue(
          'task-123'
        );

        result = await controller.deleteAccounts(EMAIL_LOCATOR, MOCK_USER);
      });

      it('enqueues an account-delete cloud task', () => {
        expect(cloudTask.accountTasks.deleteAccount).toHaveBeenCalledWith(
          expect.objectContaining({ uid: MOCK_UID, customerId: 'cus_123' })
        );
      });

      it('returns a Success result with the task name', () => {
        expect(result).toEqual([
          {
            taskName: 'task-123',
            locator: EMAIL_LOCATOR,
            status: AccountDeleteStatus.Success,
          },
        ]);
      });
    });
  });

  // The update chain resolves to the affected row count.
  const givenAccountUpdated = (rows: number) =>
    accountQuery.where.mockReturnValueOnce(Promise.resolve(rows));

  describe('disableAccount', () => {
    it('sets disabledAt on the account', async () => {
      givenAccountUpdated(1);
      await controller.disableAccount(MOCK_UID, mockRequest);
      expect(accountQuery.update).toHaveBeenCalledWith({
        disabledAt: expect.any(Number),
      });
      expect(accountQuery.where).toHaveBeenCalledWith(
        'uid',
        uuidTransformer.to(MOCK_UID)
      );
    });

    it('revokes every session and token for the account', async () => {
      givenAccountUpdated(1);
      await controller.disableAccount(MOCK_UID, mockRequest);
      expect(db.revokeAccountTokens).toHaveBeenCalledWith(MOCK_UID);
    });

    it('revokes tokens before marking the account disabled', async () => {
      givenAccountUpdated(1);
      await controller.disableAccount(MOCK_UID, mockRequest);
      expect(db.revokeAccountTokens.mock.invocationCallOrder[0]).toBeLessThan(
        accountQuery.update.mock.invocationCallOrder[0]
      );
    });

    it('rejects with the revocation error when revocation fails', async () => {
      givenAccountUpdated(1);
      db.revokeAccountTokens.mockRejectedValue(new Error('oauth db down'));

      await expect(
        controller.disableAccount(MOCK_UID, mockRequest)
      ).rejects.toThrow('oauth db down');
    });

    it('clears the profile cache and notifies attached services', async () => {
      givenAccountUpdated(1);
      await controller.disableAccount(MOCK_UID, mockRequest);
      expect(profileClient.deleteCache).toHaveBeenCalledWith(MOCK_UID);
      expect(notifier.send).toHaveBeenCalledWith({
        event: 'profileDataChange',
        data: { ts: expect.any(Number), uid: MOCK_UID },
      });
    });

    it('records an account.disable security event attributed to the admin request', async () => {
      givenAccountUpdated(1);
      await controller.disableAccount(MOCK_UID, mockRequest);
      expect(db.securityEvents.create).toHaveBeenCalledWith({
        uid: MOCK_UID,
        name: 'account.disable',
        ipAddr: '127.0.0.1',
        ipHmacKey: 'test',
        additionalInfo: { userAgent: undefined, adminPanelAction: true },
      });
    });

    it('returns true when the account was disabled', async () => {
      givenAccountUpdated(1);
      expect(await controller.disableAccount(MOCK_UID, mockRequest)).toBe(true);
    });

    it('still reports success and notifies when the security event write fails', async () => {
      givenAccountUpdated(1);
      (db.securityEvents.create as jest.Mock).mockRejectedValue(
        new Error('events table down')
      );

      expect(await controller.disableAccount(MOCK_UID, mockRequest)).toBe(true);
      expect(notifier.send).toHaveBeenCalledWith({
        event: 'profileDataChange',
        data: { ts: expect.any(Number), uid: MOCK_UID },
      });
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
        extra: { uid: MOCK_UID, event: 'account.disable' },
      });
    });

    it('still reports success when the profile cache clear fails', async () => {
      givenAccountUpdated(1);
      profileClient.deleteCache.mockRejectedValue(
        new Error('profile server unavailable')
      );
      expect(await controller.disableAccount(MOCK_UID, mockRequest)).toBe(true);
      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
        extra: { uid: MOCK_UID, event: 'account.disable' },
      });
    });

    it('returns false when no account matches the uid', async () => {
      givenAccountUpdated(0);
      expect(await controller.disableAccount(MOCK_UID, mockRequest)).toBe(
        false
      );
    });
  });

  describe('enableAccount', () => {
    it('clears disabledAt on the account', async () => {
      givenAccountUpdated(1);
      await controller.enableAccount(MOCK_UID, mockRequest);
      expect(accountQuery.update).toHaveBeenCalledWith({ disabledAt: null });
    });

    it('records an account.enable security event attributed to the admin request', async () => {
      givenAccountUpdated(1);
      await controller.enableAccount(MOCK_UID, mockRequest);
      expect(db.securityEvents.create).toHaveBeenCalledWith({
        uid: MOCK_UID,
        name: 'account.enable',
        ipAddr: '127.0.0.1',
        ipHmacKey: 'test',
        additionalInfo: { userAgent: undefined, adminPanelAction: true },
      });
    });

    it('clears the profile cache and notifies attached services', async () => {
      givenAccountUpdated(1);
      await controller.enableAccount(MOCK_UID, mockRequest);
      expect(profileClient.deleteCache).toHaveBeenCalledWith(MOCK_UID);
      expect(notifier.send).toHaveBeenCalledWith({
        event: 'profileDataChange',
        data: { ts: expect.any(Number), uid: MOCK_UID },
      });
    });

    it('returns true when the account was enabled', async () => {
      givenAccountUpdated(1);
      expect(await controller.enableAccount(MOCK_UID, mockRequest)).toBe(true);
    });

    it('returns false when no account matches the uid', async () => {
      givenAccountUpdated(0);
      expect(await controller.enableAccount(MOCK_UID, mockRequest)).toBe(false);
    });
  });

  describe('removePasskeys', () => {
    it('deletes from the passkeys table scoped to the given uid', async () => {
      await controller.removePasskeys(MOCK_UID);
      expect(knexMock).toHaveBeenCalledWith('passkeys');
      expect(passkeyQuery.delete).toHaveBeenCalled();
      expect(passkeyQuery.where).toHaveBeenCalledWith(
        'uid',
        uuidTransformer.to(MOCK_UID)
      );
    });

    it('returns true when passkeys were removed', async () => {
      expect(await controller.removePasskeys(MOCK_UID)).toBe(true);
    });

    it('logs a remove-passkeys event', async () => {
      await controller.removePasskeys(MOCK_UID);
      expect(eventLogging.onEvent).toHaveBeenCalledWith(
        EventNames.RemovePasskeys
      );
    });

    it('emits a profileDataChange notification when passkeys were removed', async () => {
      await controller.removePasskeys(MOCK_UID);
      expect(notifier.send).toHaveBeenCalledWith({
        event: 'profileDataChange',
        data: { ts: expect.any(Number), uid: MOCK_UID },
      });
    });

    it('returns false when the account has no passkeys', async () => {
      passkeyResult = 0;
      expect(await controller.removePasskeys(MOCK_UID)).toBe(false);
    });

    it('does not notify when the account has no passkeys', async () => {
      passkeyResult = 0;
      await controller.removePasskeys(MOCK_UID);
      expect(notifier.send).not.toHaveBeenCalled();
    });
  });

  describe('removePasskey', () => {
    it('deletes a single passkey scoped to uid and credentialId', async () => {
      await controller.removePasskey(MOCK_UID, MOCK_CREDENTIAL_ID);
      expect(knexMock).toHaveBeenCalledWith('passkeys');
      expect(passkeyQuery.where).toHaveBeenCalledWith(
        'uid',
        uuidTransformer.to(MOCK_UID)
      );
      expect(passkeyQuery.andWhere).toHaveBeenCalledWith(
        'credentialId',
        Buffer.from(MOCK_CREDENTIAL_ID, 'base64url')
      );
    });

    it('returns true when the passkey was removed', async () => {
      expect(await controller.removePasskey(MOCK_UID, MOCK_CREDENTIAL_ID)).toBe(
        true
      );
    });

    it('notifies when the passkey was removed', async () => {
      await controller.removePasskey(MOCK_UID, MOCK_CREDENTIAL_ID);
      expect(notifier.send).toHaveBeenCalledWith({
        event: 'profileDataChange',
        data: { ts: expect.any(Number), uid: MOCK_UID },
      });
    });

    it('returns false and skips notification when no matching passkey exists', async () => {
      passkeyResult = 0;
      expect(await controller.removePasskey(MOCK_UID, MOCK_CREDENTIAL_ID)).toBe(
        false
      );
      expect(notifier.send).not.toHaveBeenCalled();
    });
  });

  describe('removePasskeyWrap', () => {
    it('deletes only the wrap row scoped to uid and credentialId', async () => {
      await controller.removePasskeyWrap(
        MOCK_UID,
        MOCK_CREDENTIAL_ID,
        mockRequest
      );
      expect(knexMock).toHaveBeenCalledWith('passkeyWraps');
      expect(knexMock).not.toHaveBeenCalledWith('passkeys');
      expect(passkeyWrapQuery.delete).toHaveBeenCalled();
      expect(passkeyWrapQuery.where).toHaveBeenCalledWith(
        'uid',
        uuidTransformer.to(MOCK_UID)
      );
      expect(passkeyWrapQuery.andWhere).toHaveBeenCalledWith(
        'credentialId',
        Buffer.from(MOCK_CREDENTIAL_ID, 'base64url')
      );
    });

    it('logs the admin-panel event', async () => {
      await controller.removePasskeyWrap(
        MOCK_UID,
        MOCK_CREDENTIAL_ID,
        mockRequest
      );
      expect(eventLogging.onEvent).toHaveBeenCalledWith(
        EventNames.RemovePasskeyWrap
      );
    });

    it('returns true when the wrap was removed', async () => {
      expect(
        await controller.removePasskeyWrap(
          MOCK_UID,
          MOCK_CREDENTIAL_ID,
          mockRequest
        )
      ).toBe(true);
    });

    it('records the wrap-deleted security event on delete', async () => {
      await controller.removePasskeyWrap(
        MOCK_UID,
        MOCK_CREDENTIAL_ID,
        mockRequest
      );
      expect(securityEvents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: MOCK_UID,
          name: 'account.passkey.wrap_deleted',
          additionalInfo: expect.objectContaining({ adminPanelAction: true }),
        })
      );
    });

    it('still returns true when the security event write fails', async () => {
      securityEvents.create.mockRejectedValue(new Error('db down'));
      expect(
        await controller.removePasskeyWrap(
          MOCK_UID,
          MOCK_CREDENTIAL_ID,
          mockRequest
        )
      ).toBe(true);
    });

    it('does not send profileDataChange since the passkey is unchanged', async () => {
      await controller.removePasskeyWrap(
        MOCK_UID,
        MOCK_CREDENTIAL_ID,
        mockRequest
      );
      expect(notifier.send).not.toHaveBeenCalled();
    });

    it('returns false and records no event when no wrap exists', async () => {
      passkeyWrapResult = 0;
      expect(
        await controller.removePasskeyWrap(
          MOCK_UID,
          MOCK_CREDENTIAL_ID,
          mockRequest
        )
      ).toBe(false);
      expect(securityEvents.create).not.toHaveBeenCalled();
    });
  });

  describe('passkeys', () => {
    const KEYS_CHANGED_AT = 1000;
    // All-zero AAGUID skips the FIDO MDS lookup, which is stubbed out here.
    const passkeyRow = (
      credentialId: string,
      overrides: Partial<{
        prfEnabled: boolean;
        wrapCreatedAt: number | null;
        keysChangedAt: number | null;
        verifierSetAt: number;
      }> = {}
    ) => ({
      name: `key-${credentialId}`,
      credentialId: Buffer.from(credentialId, 'base64url'),
      createdAt: 1,
      lastUsedAt: null,
      aaguid: Buffer.alloc(16),
      backupState: false,
      prfEnabled: true,
      wrapCreatedAt: null,
      keysChangedAt: KEYS_CHANGED_AT,
      verifierSetAt: 1,
      accountCreatedAt: 1,
      ...overrides,
    });
    const wrapRow = (credentialId: string, createdAt = KEYS_CHANGED_AT) =>
      passkeyRow(credentialId, { wrapCreatedAt: createdAt });

    it('marks passwordless sync from the joined wrap per passkey', async () => {
      passkeyResult = [wrapRow('AAAA'), passkeyRow('BBBB')];

      const result = await controller.passkeys(mockAccount);

      expect(
        result.map((p) => [p.credentialId, p.hasPasswordlessSync])
      ).toEqual([
        ['AAAA', true],
        ['BBBB', false],
      ]);
    });

    it('loads passkeys, wraps, and account timestamps in one query', async () => {
      passkeyResult = [wrapRow('AAAA')];

      await controller.passkeys(mockAccount);

      expect(knexMock).toHaveBeenCalledTimes(1);
      expect(passkeyQuery.leftJoin).toHaveBeenCalledWith(
        'passkeyWraps',
        expect.any(Function)
      );
      expect(passkeyQuery.select).toHaveBeenCalledWith(
        'passkeys.name',
        'passkeys.credentialId',
        'passkeys.createdAt',
        'passkeys.lastUsedAt',
        'passkeys.aaguid',
        'passkeys.backupState',
        'passkeys.prfEnabled',
        'passkeyWraps.createdAt as wrapCreatedAt',
        'accounts.keysChangedAt',
        'accounts.verifierSetAt',
        'accounts.createdAt as accountCreatedAt'
      );
    });

    it('falls back to verifierSetAt when keysChangedAt is null', async () => {
      passkeyResult = [
        passkeyRow('AAAA', {
          wrapCreatedAt: 5,
          keysChangedAt: null,
          verifierSetAt: 10,
        }),
      ];

      const [passkey] = await controller.passkeys(mockAccount);

      expect(passkey.passwordlessSyncStale).toBe(true);
    });

    it('flags a wrap sealed before the account keys last changed as stale', async () => {
      passkeyResult = [wrapRow('AAAA', KEYS_CHANGED_AT - 1)];

      const [passkey] = await controller.passkeys(mockAccount);

      expect(passkey.hasPasswordlessSync).toBe(true);
      expect(passkey.passwordlessSyncStale).toBe(true);
    });

    it('does not flag a fresh wrap as stale', async () => {
      passkeyResult = [wrapRow('AAAA')];

      const [passkey] = await controller.passkeys(mockAccount);

      expect(passkey.passwordlessSyncStale).toBe(false);
    });

    it('does not flag a passkey without a wrap as stale', async () => {
      passkeyResult = [passkeyRow('AAAA')];

      const [passkey] = await controller.passkeys(mockAccount);

      expect(passkey.passwordlessSyncStale).toBe(false);
    });

    it('returns an empty list when the account has no passkeys', async () => {
      passkeyResult = [];

      expect(await controller.passkeys(mockAccount)).toEqual([]);
    });

    it('reports passwordless sync when a wrap exists even if prfEnabled is stale', async () => {
      // prfEnabled is written best-effort after an assertion and can lag
      // behind a wrap that was already stored.
      passkeyResult = [
        passkeyRow('AAAA', {
          prfEnabled: false,
          wrapCreatedAt: KEYS_CHANGED_AT,
        }),
      ];

      const [passkey] = await controller.passkeys(mockAccount);

      expect(passkey.hasPasswordlessSync).toBe(true);
    });

    it('does not expose wrap data beyond the two flags', async () => {
      passkeyResult = [wrapRow('AAAA')];

      const [passkey] = await controller.passkeys(mockAccount);

      expect(Object.keys(passkey).sort()).toEqual([
        'aaguid',
        'authenticatorName',
        'backupState',
        'createdAt',
        'credentialId',
        'hasPasswordlessSync',
        'lastUsedAt',
        'name',
        'passwordlessSyncStale',
        'prfEnabled',
      ]);
    });
  });
});
