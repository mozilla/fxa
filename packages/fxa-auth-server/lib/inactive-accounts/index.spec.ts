/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { Container } from 'typedi';
import {
  EmailTypes,
  DeleteAccountTasks,
  ReasonForDeletion,
} from '@fxa/shared/cloud-tasks';
import { AppConfig } from '../types';

// Fix proxyquire path resolution for test/mocks.js when loaded from a subdirectory.
// proxyquire uses callsite detection which resolves relative to the spec file under Jest,
// not relative to the file that calls proxyquire. From lib/inactive-accounts/, the path
// '../lib/metrics/amplitude' incorrectly resolves to lib/lib/metrics/amplitude.
jest.mock('proxyquire', () => {
  const path = require('path');
  const testDir = path.resolve(__dirname, '../../test');
  return (id: string, _stubs: any) => {
    const resolvedPath = path.resolve(testDir, id);
    return require(resolvedPath);
  };
});

// Mock fxa-shared/db/models/auth with EmailBounce (chainable query builder),
// Account.metricsEnabled (needed by amplitude loaded via test/mocks.js),
// and getAccountCustomerByUid.
jest.mock('fxa-shared/db/models/auth', () => {
  const emailBounceInstance: any = {};
  emailBounceInstance.query = jest.fn().mockReturnValue(emailBounceInstance);
  emailBounceInstance.where = jest.fn().mockReturnValue(emailBounceInstance);
  emailBounceInstance.whereIn = jest.fn().mockReturnValue(emailBounceInstance);
  emailBounceInstance.whereNull = jest.fn().mockReturnValue(emailBounceInstance);
  emailBounceInstance.join = jest.fn().mockReturnValue(emailBounceInstance);
  emailBounceInstance.distinct = jest.fn().mockResolvedValue([]);
  return {
    Account: { metricsEnabled: jest.fn().mockResolvedValue(true) },
    EmailBounce: emailBounceInstance,
    getAccountCustomerByUid: jest.fn(),
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
const sandbox = sinon.createSandbox();
const mockAccount = {
  email: 'a@example.gg',
  locale: 'en',
};
const mockFxaDb = mocks.mockDB(mockAccount, sandbox);
const mockMailer = mocks.mockMailer(sandbox);
const mockFxaMailer = mocks.mockFxaMailer();
const mockStatsd = { increment: sandbox.stub() };
const mockGlean = {
  inactiveAccountDeletion: {
    firstEmailSkipped: sandbox.stub(),
    firstEmailTaskEnqueued: sandbox.stub(),
    firstEmailTaskRejected: sandbox.stub(),
    firstEmailTaskRequest: sandbox.stub(),

    secondEmailSkipped: sandbox.stub(),
    secondEmailTaskEnqueued: sandbox.stub(),
    secondEmailTaskRejected: sandbox.stub(),
    secondEmailTaskRequest: sandbox.stub(),

    finalEmailSkipped: sandbox.stub(),
    finalEmailTaskEnqueued: sandbox.stub(),
    finalEmailTaskRejected: sandbox.stub(),
    finalEmailTaskRequest: sandbox.stub(),

    deletionScheduled: sandbox.stub(),
  },
};
const mockLog = mocks.mockLog(sandbox);
const mockOAuthDb = {
  getRefreshTokensByUid: sandbox.stub().resolves([]),
  getAccessTokensByUid: sandbox.stub().resolves([]),
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

const mockDeleteAccountTasks = { deleteAccount: sandbox.stub() };
Container.set(DeleteAccountTasks, mockDeleteAccountTasks);

const mockEmailTasks = {
  scheduleFirstEmail: sandbox.stub(),
  scheduleSecondEmail: sandbox.stub(),
  scheduleFinalEmail: sandbox.stub(),
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
    mockFxaDb.account.resetHistory();
    mockOAuthDb.getRefreshTokensByUid.resetHistory();
    mockStatsd.increment.resetHistory();
    mockGlean.inactiveAccountDeletion.firstEmailSkipped.resetHistory();
    mockGlean.inactiveAccountDeletion.secondEmailSkipped.resetHistory();
    mockGlean.inactiveAccountDeletion.finalEmailSkipped.resetHistory();
    Object.values(mockEmailTasks).forEach((stub: any) => stub.resetHistory());
    (EmailBounce.distinct as jest.Mock).mockClear();
    (EmailBounce.distinct as jest.Mock).mockResolvedValue([]);
    mockDeleteAccountTasks.deleteAccount.resetHistory();
    mockFxaMailer.sendInactiveAccountFirstWarningEmail.resetHistory();
    mockFxaMailer.sendInactiveAccountSecondWarningEmail.resetHistory();
    mockFxaMailer.sendInactiveAccountFinalWarningEmail.resetHistory();
    sandbox.resetHistory();
    sinon.resetHistory();
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  describe('first email notification', () => {
    beforeEach(() => {
      sinon.stub(Date, 'now').returns(now);
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = sandbox.spy(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.resolves([
        { lastUsedAt: Date.now() },
      ]);
      await inactiveAccountManager.handleNotificationTask(mockPayload);

      sinon.assert.calledOnce(isActiveSpy);
      sinon.assert.calledOnceWithExactly(
        mockOAuthDb.getRefreshTokensByUid,
        mockPayload.uid
      );
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.inactive.first-email.skipped.active'
      );
      sinon.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped
      );
      expect(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped.args[0][1]
      ).toEqual({ uid: mockPayload.uid, reason: 'active_account' });
    });

    it('should skip when email has been sent', async () => {
      sinon.stub(accountEventsManager, 'findEmailEvents').resolves([{}]);

      sinon.stub(inactiveAccountManager, 'isActive').resolves(false);

      sinon.stub(inactiveAccountManager, 'scheduleNextEmail').resolves();

      await inactiveAccountManager.handleNotificationTask(mockPayload);
      sinon.assert.calledWithExactly(
        mockStatsd.increment,
        'account.inactive.first-email.skipped.duplicate'
      );
      sinon.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped
      );
      expect(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped.args[0][1]
      ).toEqual({ uid: mockPayload.uid, reason: 'already_sent' });
      sinon.assert.calledOnce(inactiveAccountManager.scheduleNextEmail);
    });

    it('should send the first email and enqueue the second', async () => {
      sinon.stub(accountEventsManager, 'findEmailEvents').resolves([]);
      sinon.stub(inactiveAccountManager, 'isActive').resolves(false);

      await inactiveAccountManager.handleNotificationTask(mockPayload);

      sinon.assert.calledOnceWithExactly(mockFxaDb.account, mockPayload.uid);
      sinon.assert.calledOnce(
        mockFxaMailer.sendInactiveAccountFirstWarningEmail
      );
      const fxaMailerCallArgs =
        mockFxaMailer.sendInactiveAccountFirstWarningEmail.getCall(0).args[0];
      expect(fxaMailerCallArgs.to).toBe(mockAccount.email);
      expect(fxaMailerCallArgs.acceptLanguage).toBe(mockAccount.locale);
      expect(fxaMailerCallArgs.deletionDate).toBeDefined();
      sinon.assert.calledOnceWithExactly(mockEmailTasks.scheduleSecondEmail, {
        payload: {
          uid: mockPayload.uid,
          emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
        },
        taskOptions: { taskId: '0987654321-inactive-delete-second-email' },
      });
      sinon.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.secondEmailTaskRequest
      );
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailTaskRequest.args[0][1]
      ).toEqual({ uid: mockPayload.uid });
      sinon.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.secondEmailTaskEnqueued
      );
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailTaskEnqueued.args[0][1]
      ).toEqual({ uid: mockPayload.uid });
    });
  });

  describe('second email notification', () => {
    const mockSecondTaskPayload = {
      ...mockPayload,
      emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
    };

    beforeEach(() => {
      sinon.stub(Date, 'now').returns(now + 53 * aDayInMs);
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = sandbox.spy(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.resolves([
        { lastUsedAt: Date.now() },
      ]);
      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );

      sandbox.assert.calledOnce(isActiveSpy);
      sandbox.assert.calledOnceWithExactly(
        mockOAuthDb.getRefreshTokensByUid,
        mockSecondTaskPayload.uid
      );
      sandbox.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.inactive.second-email.skipped.active'
      );
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped
      );
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.args[0][1]
      ).toEqual({
        uid: mockSecondTaskPayload.uid,
        reason: 'active_account',
      });
    });

    it('should skip when second email has been sent already', async () => {
      sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([{}]);
      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);
      sandbox.stub(inactiveAccountManager, 'scheduleNextEmail').resolves();
      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );
      sandbox.assert.calledWithExactly(
        mockStatsd.increment,
        'account.inactive.second-email.skipped.duplicate'
      );
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped
      );
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.args[0][1]
      ).toEqual({
        uid: mockSecondTaskPayload.uid,
        reason: 'already_sent',
      });
      sandbox.assert.calledOnce(inactiveAccountManager.scheduleNextEmail);
    });

    it('should delete the account if the first email bounced', async () => {
      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);
      (EmailBounce.distinct as jest.Mock).mockResolvedValue([mockAccount]);
      sandbox.stub(inactiveAccountManager, 'scheduleNextEmail').resolves();

      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );

      expect(EmailBounce.distinct).toHaveBeenCalledTimes(1);
      expect(EmailBounce.distinct).toHaveBeenCalledWith('email');
      sinon.assert.calledWithExactly(
        mockStatsd.increment,
        'account.inactive.second-email.skipped.bounce'
      );
      sinon.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped
      );
      expect(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.args[0][1]
      ).toEqual({
        uid: mockSecondTaskPayload.uid,
        reason: 'first_email_bounced',
      });
      sinon.assert.calledOnceWithExactly(
        mockDeleteAccountTasks.deleteAccount,
        {
          uid: mockSecondTaskPayload.uid,
          customerId: undefined,
          reason: ReasonForDeletion.InactiveAccountEmailBounced,
        }
      );

      sinon.assert.notCalled(inactiveAccountManager.scheduleNextEmail);
    });

    it('should send the second email and enqueue the final', async () => {
      sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([]);
      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);
      (EmailBounce.distinct as jest.Mock).mockResolvedValue([]);

      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );
      sandbox.assert.calledOnceWithExactly(
        mockFxaDb.account,
        mockSecondTaskPayload.uid
      );
      sandbox.assert.calledOnce(
        mockFxaMailer.sendInactiveAccountSecondWarningEmail
      );
      const fxaMailerCallArgs =
        mockFxaMailer.sendInactiveAccountSecondWarningEmail.getCall(0).args[0];
      expect(fxaMailerCallArgs.to).toBe(mockAccount.email);
      expect(fxaMailerCallArgs.acceptLanguage).toBe(mockAccount.locale);
      expect(fxaMailerCallArgs.deletionDate).toBeDefined();
      sandbox.assert.calledOnceWithExactly(mockEmailTasks.scheduleFinalEmail, {
        payload: {
          uid: mockSecondTaskPayload.uid,
          emailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
        },
        taskOptions: { taskId: '0987654321-inactive-delete-final-email' },
      });
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.finalEmailTaskRequest
      );
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailTaskRequest.args[0][1]
      ).toEqual({ uid: mockSecondTaskPayload.uid });
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.finalEmailTaskEnqueued
      );
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailTaskEnqueued.args[0][1]
      ).toEqual({ uid: mockPayload.uid });
    });
  });

  describe('final email notification', () => {
    const mockFinalTaskPayload = {
      ...mockPayload,
      emailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
    };

    beforeEach(() => {
      sinon.stub(Date, 'now').returns(now + 59 * aDayInMs);
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = sandbox.spy(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.resolves([
        { lastUsedAt: Date.now() },
      ]);
      await inactiveAccountManager.handleNotificationTask(
        mockFinalTaskPayload
      );

      sandbox.assert.calledOnce(isActiveSpy);
      sandbox.assert.calledOnceWithExactly(
        mockOAuthDb.getRefreshTokensByUid,
        mockPayload.uid
      );
      sandbox.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'account.inactive.final-email.skipped.active'
      );
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped
      );
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped.args[0][1]
      ).toEqual({ uid: mockPayload.uid, reason: 'active_account' });
    });

    it('should skip when final email has been sent already', async () => {
      sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([{}]);

      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);

      sandbox.stub(inactiveAccountManager, 'scheduleNextEmail').resolves();

      await inactiveAccountManager.handleNotificationTask(
        mockFinalTaskPayload
      );
      sandbox.assert.calledWithExactly(
        mockStatsd.increment,
        'account.inactive.final-email.skipped.duplicate'
      );
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped
      );
      expect(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped.args[0][1]
      ).toEqual({ uid: mockPayload.uid, reason: 'already_sent' });
      sandbox.assert.calledOnce(inactiveAccountManager.scheduleNextEmail);
    });

    it('should send the final email and schedule deletion', async () => {
      sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([]);
      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);

      await inactiveAccountManager.handleNotificationTask(
        mockFinalTaskPayload
      );

      sandbox.assert.calledOnceWithExactly(mockFxaDb.account, mockPayload.uid);
      sandbox.assert.calledOnce(
        mockFxaMailer.sendInactiveAccountFinalWarningEmail
      );
      const fxaMailerCallArgs =
        mockFxaMailer.sendInactiveAccountFinalWarningEmail.getCall(0).args[0];
      expect(fxaMailerCallArgs.to).toBe(mockAccount.email);
      expect(fxaMailerCallArgs.acceptLanguage).toBe(mockAccount.locale);
      expect(fxaMailerCallArgs.deletionDate).toBeDefined();
      // No email cloud task should be run. There are no more emails to schedule.
      sandbox.assert.notCalled(mockEmailTasks.scheduleFinalEmail);

      sandbox.assert.calledOnceWithExactly(
        mockDeleteAccountTasks.deleteAccount,
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
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.deletionScheduled
      );
      sandbox.assert.calledWithExactly(
        mockStatsd.increment,
        'account.inactive.deletion.scheduled'
      );
    });
  });
});
