/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const { Container } = require('typedi');

const { EmailTypes } = require('@fxa/shared/cloud-tasks');

const mocks = require('../../mocks');
const mockAccount = { email: 'a@example.gg', locale: 'en' };
const mockFxaDb = mocks.mockDB(mockAccount);
const mockMailer = mocks.mockMailer();
const mockStatsd = { increment: sandbox.stub() };
const mockGlean = {
  inactiveAccountDeletion: {
    firstEmailSkipped: sandbox.stub(),
    secondEmailTaskRequest: sandbox.stub(),
    secondEmailTaskEnqueued: sandbox.stub(),
  },
};
const mockLog = mocks.mockLog();
const mockOAuthDb = {
  getRefreshTokensByUid: sandbox.stub().resolves([]),
  getAccessTokensByUid: sandbox.stub().resolves([]),
};
const mockConfig = {
  authFirestore: {},
  securityHistory: {},
  cloudTasks: { useLocalEmulator: true },
};
const { AppConfig } = require('../../../lib/types');
Container.set(AppConfig, mockConfig);

const { AccountEventsManager } = require('../../../lib/account-events');
const accountEventsManager = new AccountEventsManager();
Container.set(AccountEventsManager, accountEventsManager);

const sendEmailTaskStub = sandbox.stub();
const { InactiveAccountsManager } = proxyquire(
  '../../../lib/inactive-accounts',
  {
    ...require('../../../lib/inactive-accounts'),
    '@fxa/shared/cloud-tasks': {
      ...require('@fxa/shared/cloud-tasks'),
      SendEmailTasksFactory: () => ({
        sendEmail: sendEmailTaskStub,
      }),
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
  const stuffToRestore = [];

  afterEach(() => {
    // calling sandbox.restore here will break sandbox.reset so we restore
    // selectively/directly
    let x = stuffToRestore.pop();
    while (x) {
      x.restore();
      x = stuffToRestore.pop();
    }
    sandbox.reset();
  });

  describe('first email notification', () => {
    it('should skip when account is active', async () => {
      const isActiveSpy = sandbox.spy(inactiveAccountManager, 'isActive');
      stuffToRestore.push(isActiveSpy);
      mockOAuthDb.getRefreshTokensByUid.resolves([{ lastUsedAt: Date.now() }]);
      await inactiveAccountManager.handleFirstNotificationTask(mockPayload);

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
      stuffToRestore.push(
        sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([{}])
      );
      stuffToRestore.push(
        sandbox.stub(inactiveAccountManager, 'isActive').resolves(false)
      );
      stuffToRestore.push(
        sandbox.stub(inactiveAccountManager, 'scheduleSecondEmail').resolves()
      );
      await inactiveAccountManager.handleFirstNotificationTask(mockPayload);
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
      sinon.assert.calledOnce(inactiveAccountManager.scheduleSecondEmail);
    });

    it('should send the first email and enqueue the second', async () => {
      const now = 1736500000000;
      stuffToRestore.push(sandbox.stub(Date, 'now').returns(now));
      stuffToRestore.push(
        sandbox.stub(accountEventsManager, 'findEmailEvents').resolves([])
      );
      stuffToRestore.push(
        sandbox.stub(inactiveAccountManager, 'isActive').resolves(false)
      );
      await inactiveAccountManager.handleFirstNotificationTask(mockPayload);
      sinon.assert.calledOnceWithExactly(mockFxaDb.account, mockPayload.uid);
      const account = await mockFxaDb.account.returnValues[0];
      sinon.assert.calledOnceWithExactly(
        mockMailer.sendInactiveAccountFirstWarningEmail,
        account.emails,
        account,
        {
          acceptLanguage: mockAccount.locale,
          inactiveDeletionEta: now + 60 * 24 * 60 * 60 * 1000,
        }
      );
      sinon.assert.calledOnceWithExactly(sendEmailTaskStub, {
        payload: {
          uid: mockPayload.uid,
          emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
        },
        emailOptions: { deliveryTime: now + 53 * 24 * 60 * 60 * 1000 },
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
});
