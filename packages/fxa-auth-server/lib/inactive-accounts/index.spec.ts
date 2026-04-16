/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import {
  EmailTypes,
  DeleteAccountTasks,
  ReasonForDeletion,
} from '@fxa/shared/cloud-tasks';
import { AppConfig } from '../types';

// Mock fxa-shared/db/models/auth with real exports plus mock EmailBounce for chaining.
// Must be before any require() that pulls this module (including test/mocks.js).
const _mockEmailBounce: any = {};
function resetEmailBounceMock() {
  for (const method of ['query', 'where', 'whereIn', 'whereNull', 'join']) {
    _mockEmailBounce[method] = jest.fn().mockReturnValue(_mockEmailBounce);
  }
  _mockEmailBounce.distinct = jest.fn().mockResolvedValue([]);
}
resetEmailBounceMock();
jest.mock('fxa-shared/db/models/auth', () => {
  const actual = jest.requireActual('fxa-shared/db/models/auth');
  return {
    ...actual,
    Account: {
      ...actual.Account,
      metricsEnabled: jest.fn().mockResolvedValue(true),
    },
    EmailBounce: _mockEmailBounce,
    getAccountCustomerByUid: jest.fn().mockResolvedValue(null),
  };
});

// Override InactiveAccountEmailTasksFactory to return our mock email tasks.
// The ref object is captured by the hoisted jest.mock closure; its .current property
// is set later (after imports) and read when tests invoke the factory.
const mockEmailTasksRef: { current: any } = { current: undefined };
jest.mock('@fxa/shared/cloud-tasks', () => ({
  ...jest.requireActual('@fxa/shared/cloud-tasks'),
  InactiveAccountEmailTasksFactory: () => mockEmailTasksRef.current,
}));

const mocks = require('../../test/mocks');

const now = 1736500000000;
const aDayInMs = 24 * 60 * 60 * 1000;
const mockAccount = {
  email: 'a@example.gg',
  locale: 'en',
};
const mockFxaDb = mocks.mockDB(mockAccount);
const mockMailer = mocks.mockMailer();
const mockFxaMailer = mocks.mockFxaMailer();
const mockStatsd = { increment: jest.fn() };
const mockGlean = {
  inactiveAccountDeletion: {
    firstEmailSkipped: jest.fn(),
    firstEmailTaskEnqueued: jest.fn(),
    firstEmailTaskRejected: jest.fn(),
    firstEmailTaskRequest: jest.fn(),

    secondEmailSkipped: jest.fn(),
    secondEmailTaskEnqueued: jest.fn(),
    secondEmailTaskRejected: jest.fn(),
    secondEmailTaskRequest: jest.fn(),

    finalEmailSkipped: jest.fn(),
    finalEmailTaskEnqueued: jest.fn(),
    finalEmailTaskRejected: jest.fn(),
    finalEmailTaskRequest: jest.fn(),

    deletionScheduled: jest.fn(),
  },
};
const mockLog = mocks.mockLog();
const mockOAuthDb = {
  getRefreshTokensByUid: jest.fn().mockResolvedValue([]),
  getAccessTokensByUid: jest.fn().mockResolvedValue([]),
};
const mockConfig = {
  authFirestore: {},
  securityHistory: {},
  cloudTasks: { useLocalEmulator: true },
};

Container.set(AppConfig, mockConfig);

const { AccountEventsManager } = require('../account-events');
const accountEventsManager = new AccountEventsManager();
Container.set(AccountEventsManager, accountEventsManager);

const mockDeleteAccountTasks = { deleteAccount: jest.fn() };
Container.set(DeleteAccountTasks, mockDeleteAccountTasks);

const mockEmailTasks = {
  scheduleFirstEmail: jest.fn(),
  scheduleSecondEmail: jest.fn(),
  scheduleFinalEmail: jest.fn(),
};
mockEmailTasksRef.current = mockEmailTasks;

const authModels = require('fxa-shared/db/models/auth');
const EmailBounce = authModels.EmailBounce;

const { InactiveAccountsManager } = require('../inactive-accounts');

describe('InactiveAccountsManager', () => {
  const inactiveAccountManager = new InactiveAccountsManager({
    config: mockConfig,
    fxaDb: mockFxaDb,
    oauthDb: mockOAuthDb,
    mailer: mockMailer,
    statsd: mockStatsd,
    glean: mockGlean,
    log: mockLog,
  });
  const mockPayload = {
    uid: '0987654321',
    emailType: EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetEmailBounceMock();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('first email notification', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(now);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = jest.spyOn(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.mockResolvedValue([
        { lastUsedAt: Date.now() },
      ]);
      await inactiveAccountManager.handleNotificationTask(mockPayload);

      expect(isActiveSpy).toHaveBeenCalledTimes(1);
      expect(mockOAuthDb.getRefreshTokensByUid).toHaveBeenCalledTimes(1);
      expect(mockOAuthDb.getRefreshTokensByUid).toHaveBeenCalledWith(
        mockPayload.uid
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.inactive.first-email.skipped.active'
      );
      expect(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped.mock.calls[0][1]
      ).toEqual({ uid: mockPayload.uid, reason: 'active_account' });
    });

    it('should skip when email has been sent', async () => {
      jest
        .spyOn(accountEventsManager, 'findEmailEvents')
        .mockResolvedValue([{}]);

      jest.spyOn(inactiveAccountManager, 'isActive').mockResolvedValue(false);

      jest
        .spyOn(inactiveAccountManager, 'scheduleNextEmail')
        .mockResolvedValue(undefined);

      await inactiveAccountManager.handleNotificationTask(mockPayload);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.inactive.first-email.skipped.duplicate'
      );
      expect(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped.mock.calls[0][1]
      ).toEqual({ uid: mockPayload.uid, reason: 'already_sent' });
      expect(inactiveAccountManager.scheduleNextEmail).toHaveBeenCalledTimes(1);
    });

    it('should send the first email and enqueue the second', async () => {
      jest.spyOn(accountEventsManager, 'findEmailEvents').mockResolvedValue([]);
      jest.spyOn(inactiveAccountManager, 'isActive').mockResolvedValue(false);

      await inactiveAccountManager.handleNotificationTask(mockPayload);

      expect(mockFxaDb.account).toHaveBeenCalledTimes(1);
      expect(mockFxaDb.account).toHaveBeenCalledWith(mockPayload.uid);
      expect(
        mockFxaMailer.sendInactiveAccountFirstWarningEmail
      ).toHaveBeenCalledTimes(1);
      const fxaMailerCallArgs =
        mockFxaMailer.sendInactiveAccountFirstWarningEmail.mock.calls[0][0];
      expect(fxaMailerCallArgs.to).toBe(mockAccount.email);
      expect(fxaMailerCallArgs.acceptLanguage).toBe(mockAccount.locale);
      expect(fxaMailerCallArgs.deletionDate).toBeDefined();
      expect(mockEmailTasks.scheduleSecondEmail).toHaveBeenCalledTimes(1);
      expect(mockEmailTasks.scheduleSecondEmail).toHaveBeenCalledWith({
        payload: {
          uid: mockPayload.uid,
          emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
        },
        taskOptions: { taskId: '0987654321-inactive-delete-second-email' },
      });
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailTaskRequest
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailTaskRequest.mock
          .calls[0][1]
      ).toEqual({ uid: mockPayload.uid });
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailTaskEnqueued
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailTaskEnqueued.mock
          .calls[0][1]
      ).toEqual({ uid: mockPayload.uid });
    });
  });

  describe('second email notification', () => {
    const mockSecondTaskPayload = {
      ...mockPayload,
      emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
    };

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(now + 53 * aDayInMs);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = jest.spyOn(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.mockResolvedValue([
        { lastUsedAt: Date.now() },
      ]);
      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );

      expect(isActiveSpy).toHaveBeenCalledTimes(1);
      expect(mockOAuthDb.getRefreshTokensByUid).toHaveBeenCalledTimes(1);
      expect(mockOAuthDb.getRefreshTokensByUid).toHaveBeenCalledWith(
        mockSecondTaskPayload.uid
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.inactive.second-email.skipped.active'
      );
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.mock.calls[0][1]
      ).toEqual({
        uid: mockSecondTaskPayload.uid,
        reason: 'active_account',
      });
    });

    it('should skip when second email has been sent already', async () => {
      jest
        .spyOn(accountEventsManager, 'findEmailEvents')
        .mockResolvedValue([{}]);
      jest.spyOn(inactiveAccountManager, 'isActive').mockResolvedValue(false);
      jest
        .spyOn(inactiveAccountManager, 'scheduleNextEmail')
        .mockResolvedValue(undefined);
      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.inactive.second-email.skipped.duplicate'
      );
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.mock.calls[0][1]
      ).toEqual({
        uid: mockSecondTaskPayload.uid,
        reason: 'already_sent',
      });
      expect(inactiveAccountManager.scheduleNextEmail).toHaveBeenCalledTimes(1);
    });

    it('should delete the account if the first email bounced', async () => {
      jest.spyOn(inactiveAccountManager, 'isActive').mockResolvedValue(false);
      (EmailBounce.distinct as jest.Mock).mockResolvedValue([mockAccount]);
      jest
        .spyOn(inactiveAccountManager, 'scheduleNextEmail')
        .mockResolvedValue(undefined);

      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );

      expect(EmailBounce.distinct).toHaveBeenCalledTimes(1);
      expect(EmailBounce.distinct).toHaveBeenCalledWith('email');
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.inactive.second-email.skipped.bounce'
      );
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.mock.calls[0][1]
      ).toEqual({
        uid: mockSecondTaskPayload.uid,
        reason: 'first_email_bounced',
      });
      expect(mockDeleteAccountTasks.deleteAccount).toHaveBeenCalledTimes(1);
      expect(mockDeleteAccountTasks.deleteAccount).toHaveBeenCalledWith({
        uid: mockSecondTaskPayload.uid,
        customerId: undefined,
        reason: ReasonForDeletion.InactiveAccountEmailBounced,
      });

      expect(inactiveAccountManager.scheduleNextEmail).not.toHaveBeenCalled();
    });

    it('should send the second email and enqueue the final', async () => {
      jest.spyOn(accountEventsManager, 'findEmailEvents').mockResolvedValue([]);
      jest.spyOn(inactiveAccountManager, 'isActive').mockResolvedValue(false);
      (EmailBounce.distinct as jest.Mock).mockResolvedValue([]);

      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );
      expect(mockFxaDb.account).toHaveBeenCalledTimes(1);
      expect(mockFxaDb.account).toHaveBeenCalledWith(mockSecondTaskPayload.uid);
      expect(
        mockFxaMailer.sendInactiveAccountSecondWarningEmail
      ).toHaveBeenCalledTimes(1);
      const fxaMailerCallArgs =
        mockFxaMailer.sendInactiveAccountSecondWarningEmail.mock.calls[0][0];
      expect(fxaMailerCallArgs.to).toBe(mockAccount.email);
      expect(fxaMailerCallArgs.acceptLanguage).toBe(mockAccount.locale);
      expect(fxaMailerCallArgs.deletionDate).toBeDefined();
      expect(mockEmailTasks.scheduleFinalEmail).toHaveBeenCalledTimes(1);
      expect(mockEmailTasks.scheduleFinalEmail).toHaveBeenCalledWith({
        payload: {
          uid: mockSecondTaskPayload.uid,
          emailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
        },
        taskOptions: { taskId: '0987654321-inactive-delete-final-email' },
      });
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailTaskRequest
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailTaskRequest.mock.calls[0][1]
      ).toEqual({ uid: mockSecondTaskPayload.uid });
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailTaskEnqueued
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailTaskEnqueued.mock
          .calls[0][1]
      ).toEqual({ uid: mockPayload.uid });
    });
  });

  describe('final email notification', () => {
    const mockFinalTaskPayload = {
      ...mockPayload,
      emailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
    };

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(now + 59 * aDayInMs);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = jest.spyOn(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.mockResolvedValue([
        { lastUsedAt: Date.now() },
      ]);
      await inactiveAccountManager.handleNotificationTask(mockFinalTaskPayload);

      expect(isActiveSpy).toHaveBeenCalledTimes(1);
      expect(mockOAuthDb.getRefreshTokensByUid).toHaveBeenCalledTimes(1);
      expect(mockOAuthDb.getRefreshTokensByUid).toHaveBeenCalledWith(
        mockPayload.uid
      );
      expect(mockStatsd.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.inactive.final-email.skipped.active'
      );
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped.mock.calls[0][1]
      ).toEqual({ uid: mockPayload.uid, reason: 'active_account' });
    });

    it('should skip when final email has been sent already', async () => {
      jest
        .spyOn(accountEventsManager, 'findEmailEvents')
        .mockResolvedValue([{}]);

      jest.spyOn(inactiveAccountManager, 'isActive').mockResolvedValue(false);

      jest
        .spyOn(inactiveAccountManager, 'scheduleNextEmail')
        .mockResolvedValue(undefined);

      await inactiveAccountManager.handleNotificationTask(mockFinalTaskPayload);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.inactive.final-email.skipped.duplicate'
      );
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped
      ).toHaveBeenCalledTimes(1);
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped.mock.calls[0][1]
      ).toEqual({ uid: mockPayload.uid, reason: 'already_sent' });
      expect(inactiveAccountManager.scheduleNextEmail).toHaveBeenCalledTimes(1);
    });

    it('should send the final email and schedule deletion', async () => {
      jest.spyOn(accountEventsManager, 'findEmailEvents').mockResolvedValue([]);
      jest.spyOn(inactiveAccountManager, 'isActive').mockResolvedValue(false);

      await inactiveAccountManager.handleNotificationTask(mockFinalTaskPayload);

      expect(mockFxaDb.account).toHaveBeenCalledTimes(1);
      expect(mockFxaDb.account).toHaveBeenCalledWith(mockPayload.uid);
      expect(
        mockFxaMailer.sendInactiveAccountFinalWarningEmail
      ).toHaveBeenCalledTimes(1);
      const fxaMailerCallArgs =
        mockFxaMailer.sendInactiveAccountFinalWarningEmail.mock.calls[0][0];
      expect(fxaMailerCallArgs.to).toBe(mockAccount.email);
      expect(fxaMailerCallArgs.acceptLanguage).toBe(mockAccount.locale);
      expect(fxaMailerCallArgs.deletionDate).toBeDefined();
      // No email cloud task should be run. There are no more emails to schedule.
      expect(mockEmailTasks.scheduleFinalEmail).not.toHaveBeenCalled();

      expect(mockDeleteAccountTasks.deleteAccount).toHaveBeenCalledTimes(1);
      expect(mockDeleteAccountTasks.deleteAccount).toHaveBeenCalledWith(
        {
          uid: mockPayload.uid,
          customerId: undefined,
          reason: ReasonForDeletion.InactiveAccountScheduled,
        },
        {
          taskId: `${mockPayload.uid}-inactive-account-delete`,
          scheduleTime: {
            seconds: (Date.now() + aDayInMs) / 1000,
          },
        }
      );
      expect(
        mockGlean.inactiveAccountDeletion.deletionScheduled
      ).toHaveBeenCalledTimes(1);
      expect(mockStatsd.increment).toHaveBeenCalledWith(
        'account.inactive.deletion.scheduled'
      );
    });
  });
});
