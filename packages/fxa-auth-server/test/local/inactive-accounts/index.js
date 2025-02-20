/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const { Container } = require('typedi');
const {
  EmailTypes,
  DeleteAccountTasks,
  ReasonForDeletion,
} = require('@fxa/shared/cloud-tasks');
const mocks = require('../../mocks');
const { AppConfig } = require('../../../lib/types');

const now = 1736500000000;
const aDayInMs = 24 * 60 * 60 * 1000;
const sandbox = sinon.createSandbox();
const mockAccount = {
  email: 'a@example.gg',
  locale: 'en',
};
const mockFxaDb = mocks.mockDB(mockAccount, sandbox);
const mockMailer = mocks.mockMailer(sandbox);
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

const { AccountEventsManager } = require('../../../lib/account-events');
const accountEventsManager = new AccountEventsManager();
Container.set(AccountEventsManager, accountEventsManager);

const mockDeleteAccountTasks = { deleteAccount: sandbox.stub() };
Container.set(DeleteAccountTasks, mockDeleteAccountTasks);

const mockEmailTasks = {
  scheduleFirstEmail: sandbox.stub(),
  scheduleSecondEmail: sandbox.stub(),
  scheduleFinalEmail: sandbox.stub(),
};

const getAccountCustomerByUid = sandbox.stub();
const emailBounceSelect = sandbox.stub().resolves([]);
const emailBounceWhere = sandbox.stub();
const emailBounceJoin = sandbox.stub();
const emailBounceQuery = sandbox.stub();
const EmailBounce = new (class {
  query() {
    emailBounceQuery.apply(this, arguments);
    return this;
  }
  where() {
    emailBounceWhere.apply(this, arguments);
    return this;
  }
  whereIn() {
    emailBounceWhere.apply(this, arguments);
    return this;
  }
  whereNull() {
    emailBounceWhere.apply(this, arguments);
    return this;
  }
  join() {
    emailBounceJoin.apply(this, arguments);
    return this;
  }
  select() {
    return emailBounceSelect.apply(this, arguments);
  }
})();

const { InactiveAccountsManager } = proxyquire(
  '../../../lib/inactive-accounts',
  {
    ...require('../../../lib/inactive-accounts'),
    '@fxa/shared/cloud-tasks': {
      ...require('@fxa/shared/cloud-tasks'),
      InactiveAccountEmailTasksFactory: () => mockEmailTasks,
    },
    'fxa-shared/db/models/auth': {
      EmailBounce,
      getAccountCustomerByUid,
    },
  }
);

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
    Object.values(mockEmailTasks).forEach((stub) => stub.resetHistory());
    emailBounceSelect.resetHistory();
    mockDeleteAccountTasks.deleteAccount.resetHistory();
    sandbox.resetHistory();
    sinon.resetHistory();
  });

  afterEach(() => {
    sandbox.restore();
    sinon.restore();
  });

  describe('first email notification', () => {
    beforeEach(() => {
      // The first email goes out at an arbitrary time.
      sinon.stub(Date, 'now').returns(now);
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = sandbox.spy(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.resolves([{ lastUsedAt: Date.now() }]);
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
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped.args[0][1],
        { uid: mockPayload.uid, reason: 'active_account' }
      );
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
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.firstEmailSkipped.args[0][1],
        { uid: mockPayload.uid, reason: 'already_sent' }
      );
      sinon.assert.calledOnce(inactiveAccountManager.scheduleNextEmail);
    });

    it('should send the first email and enqueue the second', async () => {
      sinon.stub(accountEventsManager, 'findEmailEvents').resolves([]);
      sinon.stub(inactiveAccountManager, 'isActive').resolves(false);

      await inactiveAccountManager.handleNotificationTask(mockPayload);

      sinon.assert.calledOnceWithExactly(mockFxaDb.account, mockPayload.uid);
      const account = await mockFxaDb.account.returnValues[0];
      sinon.assert.calledOnceWithExactly(
        mockMailer.sendInactiveAccountFirstWarningEmail,
        account.emails,
        account,
        {
          acceptLanguage: mockAccount.locale,
          inactiveDeletionEta: now + 60 * aDayInMs,
        }
      );
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
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.secondEmailTaskRequest.args[0][1],
        { uid: mockPayload.uid }
      );
      sinon.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.secondEmailTaskEnqueued
      );
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.secondEmailTaskEnqueued.args[0][1],
        { uid: mockPayload.uid }
      );
    });
  });

  describe('second email notification', () => {
    const mockSecondTaskPayload = {
      ...mockPayload,
      emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
    };

    beforeEach(() => {
      // Fifty three days after the first email is sent, the next email will be sent.
      sinon.stub(Date, 'now').returns(now + 53 * aDayInMs);
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = sandbox.spy(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.resolves([{ lastUsedAt: Date.now() }]);
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
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.args[0][1],
        { uid: mockSecondTaskPayload.uid, reason: 'active_account' }
      );
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
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.args[0][1],
        { uid: mockSecondTaskPayload.uid, reason: 'already_sent' }
      );
      sandbox.assert.calledOnce(inactiveAccountManager.scheduleNextEmail);
    });

    it('should delete the account if the first email bounced - edge case', async () => {
      mockAccount.createdAt = new Date('2023-01-15').valueOf();
      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);
      sandbox
        .stub(accountEventsManager, 'findEmailEvents')
        .resolves([{ createdAt: now }]);
      emailBounceSelect.resolves([{ uid: mockPayload.uid }]);
      sandbox.stub(inactiveAccountManager, 'scheduleNextEmail').resolves();

      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );
      mockAccount.createdAt = undefined;
      sinon.assert.calledOnceWithExactly(
        accountEventsManager.findEmailEvents,
        mockPayload.uid,
        'emailBounced',
        'inactiveAccountFirstWarning',
        1736413600000,
        1736586400000
      );
      sinon.assert.calledOnceWithExactly(emailBounceSelect, [
        'email',
        'createdAt',
      ]);
      sinon.assert.calledWithExactly(
        mockStatsd.increment,
        'account.inactive.second-email.skipped.bounce'
      );
      sinon.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped
      );
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.args[0][1],
        { uid: mockSecondTaskPayload.uid, reason: 'first_email_bounced' }
      );
      sinon.assert.calledOnceWithExactly(mockDeleteAccountTasks.deleteAccount, {
        uid: mockSecondTaskPayload.uid,
        customerId: undefined,
        reason: ReasonForDeletion.InactiveAccountEmailBounced,
      });

      sinon.assert.notCalled(inactiveAccountManager.scheduleNextEmail);
    });

    it('should delete the account if the first email bounced', async () => {
      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);
      emailBounceSelect.resolves([mockAccount]);
      sandbox.stub(inactiveAccountManager, 'scheduleNextEmail').resolves();

      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );

      sinon.assert.calledOnceWithExactly(emailBounceSelect, ['email']);
      sinon.assert.calledWithExactly(
        mockStatsd.increment,
        'account.inactive.second-email.skipped.bounce'
      );
      sinon.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped
      );
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.secondEmailSkipped.args[0][1],
        { uid: mockSecondTaskPayload.uid, reason: 'first_email_bounced' }
      );
      sinon.assert.calledOnceWithExactly(mockDeleteAccountTasks.deleteAccount, {
        uid: mockSecondTaskPayload.uid,
        customerId: undefined,
        reason: ReasonForDeletion.InactiveAccountEmailBounced,
      });

      sinon.assert.notCalled(inactiveAccountManager.scheduleNextEmail);
    });

    it('should send the second email and enqueue the final', async () => {
      sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([]);
      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);
      emailBounceSelect.resolves([]);

      await inactiveAccountManager.handleNotificationTask(
        mockSecondTaskPayload
      );
      sandbox.assert.calledOnceWithExactly(
        mockFxaDb.account,
        mockSecondTaskPayload.uid
      );
      const account = await mockFxaDb.account.returnValues[0];
      sandbox.assert.calledOnceWithExactly(
        mockMailer.sendInactiveAccountSecondWarningEmail,
        account.emails,
        account,
        {
          acceptLanguage: mockAccount.locale,
          inactiveDeletionEta: Date.now() + 7 * aDayInMs,
        }
      );
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
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.finalEmailTaskRequest.args[0][1],
        { uid: mockSecondTaskPayload.uid }
      );
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.finalEmailTaskEnqueued
      );
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.finalEmailTaskEnqueued.args[0][1],
        { uid: mockPayload.uid }
      );
    });
  });

  describe('final email notification', () => {
    const mockFinalTaskPayload = {
      ...mockPayload,
      emailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
    };

    beforeEach(() => {
      // Six days after the second email is sent, the final email is sent.
      sinon.stub(Date, 'now').returns(now + 59 * aDayInMs);
    });
    afterEach(() => {
      sinon.restore();
    });

    it('should skip when account is active', async () => {
      const isActiveSpy = sandbox.spy(inactiveAccountManager, 'isActive');
      mockOAuthDb.getRefreshTokensByUid.resolves([{ lastUsedAt: Date.now() }]);
      await inactiveAccountManager.handleNotificationTask(mockFinalTaskPayload);

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
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped.args[0][1],
        { uid: mockPayload.uid, reason: 'active_account' }
      );
    });

    it('should skip when final email has been sent already', async () => {
      sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([{}]);

      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);

      sandbox.stub(inactiveAccountManager, 'scheduleNextEmail').resolves();

      await inactiveAccountManager.handleNotificationTask(mockFinalTaskPayload);
      sandbox.assert.calledWithExactly(
        mockStatsd.increment,
        'account.inactive.final-email.skipped.duplicate'
      );
      sandbox.assert.calledOnce(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped
      );
      assert.deepEqual(
        mockGlean.inactiveAccountDeletion.finalEmailSkipped.args[0][1],
        { uid: mockPayload.uid, reason: 'already_sent' }
      );
      sandbox.assert.calledOnce(inactiveAccountManager.scheduleNextEmail);
    });

    it('should send the final email and schedule deletion', async () => {
      sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([]);
      sandbox.stub(inactiveAccountManager, 'isActive').resolves(false);

      await inactiveAccountManager.handleNotificationTask(mockFinalTaskPayload);

      sandbox.assert.calledOnceWithExactly(mockFxaDb.account, mockPayload.uid);
      const account = await mockFxaDb.account.returnValues[0];
      sandbox.assert.calledOnceWithExactly(
        mockMailer.sendInactiveAccountFinalWarningEmail,
        account.emails,
        account,
        {
          acceptLanguage: mockAccount.locale,
          inactiveDeletionEta: Date.now() + 1 * aDayInMs,
        }
      );
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
