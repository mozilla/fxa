/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import { Provider } from '@nestjs/common';
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
import { AccountController } from './account.controller';

describe('AccountController', () => {
  let controller: AccountController;
  let eventLogging: DeepMocked<EventLoggingService>;
  let emailService: DeepMocked<EmailService>;
  let cloudTask: DeepMocked<CloudTasks>;

  // The account-lookup query builder. `first` (email locator) and `findOne`
  // (uid locator) are the terminal calls that decide whether an account was
  // found; the `givenAccount` helper below points both at a test-defined value.
  // Chain methods return `this`, so they can't be typed against the builder
  // without a circular reference — plain jest.Mocks keep it simple.
  let accountQuery: {
    select: jest.Mock;
    innerJoin: jest.Mock;
    where: jest.Mock;
    findOne: jest.Mock;
    first: jest.Mock;
  };

  const MOCK_UID = 'f9416ce3703e4916a4cd6b1e665a3f1a';
  const EMAIL_LOCATOR = 'user@example.com';
  const NO_ACCOUNT_LOCATOR = 'nobody@example.com';
  const MOCK_USER = 'admin@mozilla.com';
  const NOTIFICATION_EMAIL = 'notify@mozilla.com';
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

    accountQuery = {
      select: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      findOne: jest.fn(),
      first: jest.fn(),
    };
    givenAccount(undefined); // default: no account found

    const db = createMock<DatabaseService>({
      account: { query: jest.fn().mockReturnValue(accountQuery) } as any,
    });

    const stub = (provide: any): Provider => ({ provide, useValue: {} });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountController,
        { provide: EventLoggingService, useValue: eventLogging },
        { provide: EmailService, useValue: emailService },
        { provide: CloudTasksService, useValue: cloudTask },
        { provide: MozLoggerService, useValue: createMock<MozLoggerService>() },
        { provide: DatabaseService, useValue: db },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test') },
        },
        stub(CartManager),
        stub(SubscriptionsService),
        stub(BasketService),
        stub(NotifierService),
        stub(FirestoreService),
        stub(ProfileClient),
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
});
