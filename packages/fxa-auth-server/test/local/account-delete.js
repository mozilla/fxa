/*  */ /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const { assert } = require('chai');
const proxyquire = require('proxyquire');
const { default: Container } = require('typedi');
const { AppConfig, AuthLogger } = require('../../lib/types');
const mocks = require('../mocks');
const uuid = require('uuid');

const email = 'foo@example.com';
const uid = uuid.v4({}, Buffer.alloc(16)).toString('hex');
const expectedSubscriptions = [
  { uid, subscriptionId: '123' },
  { uid, subscriptionId: '456' },
  { uid, subscriptionId: '789' },
];

describe('AccountDeleteManager', function () {
  this.timeout(10000);

  const sandbox = sinon.createSandbox();

  let mockFxaDb;
  let mockOAuthDb;
  let mockPush;
  let mockPushbox;
  let mockStatsd;
  let mockStripeHelper;
  let mockPaypalHelper;
  let mockLog;
  let mockConfig;
  let accountDeleteManager;
  let mockAuthModels;
  let createTaskStub;

  beforeEach(() => {
    const { PayPalHelper } = require('../../lib/payments/paypal/helper');
    const { StripeHelper } = require('../../lib/payments/stripe');

    sandbox.reset();
    createTaskStub = sandbox.stub();
    mockFxaDb = {
      ...mocks.mockDB({ email: email, uid: uid }),
      fetchAccountSubscriptions: sinon.spy(
        async (uid) => expectedSubscriptions
      ),
    };
    mockOAuthDb = {};
    mockPush = mocks.mockPush();
    mockPushbox = mocks.mockPushbox();
    mockStatsd = { increment: sandbox.stub() };
    mockStripeHelper = {};
    mockLog = mocks.mockLog();

    mockConfig = {
      apiVersion: 1,
      cloudTasks: mocks.mockCloudTasksConfig,
      publicUrl: 'https://tasks.example.io',
      subscriptions: {
        enabled: true,
        paypalNvpSigCredentials: {
          enabled: true,
        },
      },
      domain: 'wibble',
    };
    Container.set(AppConfig, mockConfig);

    mockStripeHelper = mocks.mockStripeHelper([
      'removeCustomer',
      'removeFirestoreCustomer',
    ]);
    mockStripeHelper.removeCustomer = sandbox.stub().resolves();
    mockStripeHelper.removeFirestoreCustomer = sandbox.stub().resolves();
    mockPaypalHelper = mocks.mockPayPalHelper(['cancelBillingAgreement']);
    mockPaypalHelper.cancelBillingAgreement = sandbox.stub().resolves();
    mockAuthModels = {};
    mockAuthModels.getAllPayPalBAByUid = sinon.spy(async () => {
      return [{ status: 'Active', billingAgreementId: 'B-test' }];
    });
    mockAuthModels.deleteAllPayPalBAs = sinon.spy(async () => {});

    mockOAuthDb = {
      removeTokensAndCodes: sinon.fake.resolves(),
      removePublicAndCanGrantTokens: sinon.fake.resolves(),
    };

    Container.set(StripeHelper, mockStripeHelper);
    Container.set(PayPalHelper, mockPaypalHelper);
    Container.set(AuthLogger, mockLog);
    Container.set(AppConfig, mockConfig);

    const { AccountDeleteManager } = proxyquire('../../lib/account-delete', {
      '@google-cloud/tasks': {
        CloudTasksClient: class CloudTasksClient {
          constructor() {}
          createTask(...args) {
            return createTaskStub.apply(null, args);
          }
        },
      },
      'fxa-shared/db/models/auth': mockAuthModels,
    });

    accountDeleteManager = new AccountDeleteManager({
      fxaDb: mockFxaDb,
      oauthDb: mockOAuthDb,
      push: mockPush,
      pushbox: mockPushbox,
      statsd: mockStatsd,
    });
  });

  afterEach(() => {
    Container.reset();
    sandbox.reset();
  });

  it('can be instantiated', () => {
    assert.ok(accountDeleteManager);
  });

  describe('create tasks', function () {
    it('creates a delete account task by uid', async () => {
      const fetchCustomerStub = sandbox.stub().resolves({ id: 'cus_997' });
      mockStripeHelper['fetchCustomer'] = fetchCustomerStub;
      const taskId = 'proj/testo/loc/us-n/q/del0/tasks/123';
      createTaskStub = sandbox.stub().resolves([{ name: taskId }]);
      const result = await accountDeleteManager.enqueue({
        uid,
        reason: 'fxa_unverified_account_delete',
      });
      sinon.assert.calledOnceWithExactly(fetchCustomerStub, uid);
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'cloud-tasks.account-delete.enqueue.success'
      );
      sinon.assert.calledOnceWithExactly(createTaskStub, {
        parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.deleteAccounts.queueName}`,
        task: {
          httpRequest: {
            url: `${mockConfig.publicUrl}/v${mockConfig.apiVersion}/cloud-tasks/accounts/delete`,
            httpMethod: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.from(
              JSON.stringify({
                uid,
                customerId: 'cus_997',
                reason: 'fxa_unverified_account_delete',
              })
            ).toString('base64'),
            oidcToken: {
              audience: mockConfig.cloudTasks.oidc.aud,
              serviceAccountEmail:
                mockConfig.cloudTasks.oidc.serviceAccountEmail,
            },
          },
        },
      });
      assert.equal(result, taskId);
    });

    it('creates a delete account task by email', async () => {
      const fetchCustomerStub = sandbox.stub().resolves({ id: 'cus_993' });
      mockStripeHelper['fetchCustomer'] = fetchCustomerStub;
      const taskId = 'proj/testo/loc/us-n/q/del0/tasks/134';
      createTaskStub = sandbox.stub().resolves([{ name: taskId }]);
      const result = await accountDeleteManager.enqueue({
        email,
        reason: 'fxa_unverified_account_delete',
      });
      sinon.assert.calledOnceWithExactly(fetchCustomerStub, uid);
      sinon.assert.calledOnceWithExactly(createTaskStub, {
        parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.deleteAccounts.queueName}`,
        task: {
          httpRequest: {
            url: `${mockConfig.publicUrl}/v${mockConfig.apiVersion}/cloud-tasks/accounts/delete`,
            httpMethod: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.from(
              JSON.stringify({
                uid,
                customerId: 'cus_993',

                reason: 'fxa_unverified_account_delete',
              })
            ).toString('base64'),
            oidcToken: {
              audience: mockConfig.cloudTasks.oidc.aud,
              serviceAccountEmail:
                mockConfig.cloudTasks.oidc.serviceAccountEmail,
            },
          },
        },
      });
      assert.equal(result, taskId);
    });

    it('throws when task creation fails', async () => {
      const fetchCustomerStub = sandbox.stub().resolves({ id: 'cus_997' });
      mockStripeHelper['fetchCustomer'] = fetchCustomerStub;
      createTaskStub = sandbox.stub().throws();
      try {
        await accountDeleteManager.enqueue({
          uid,
          reason: 'fxa_unverified_account_delete',
        });
        assert.fail('An error should have been thrown.');
      } catch (err) {
        sinon.assert.calledOnceWithExactly(
          mockStatsd.increment,
          'cloud-tasks.account-delete.enqueue.failure'
        );
        assert.instanceOf(err, Error);
      }
    });
  });

  describe('delete account', function () {
    it('should delete the account', async () => {
      const options = { notify: sandbox.stub().resolves() };

      await accountDeleteManager.deleteAccount(uid, options);

      sinon.assert.calledWithMatch(mockFxaDb.deleteAccount, {
        uid,
      });
      sinon.assert.callCount(options.notify, 1);
      sinon.assert.callCount(mockStripeHelper.removeCustomer, 1);
      sinon.assert.calledWithMatch(mockStripeHelper.removeCustomer, uid);

      sinon.assert.calledOnceWithExactly(
        mockAuthModels.getAllPayPalBAByUid,
        uid
      );
      sinon.assert.calledOnceWithExactly(
        mockPaypalHelper.cancelBillingAgreement,
        'B-test'
      );
      sinon.assert.calledOnceWithExactly(
        mockAuthModels.deleteAllPayPalBAs,
        uid
      );
      sinon.assert.calledOnceWithExactly(mockPushbox.deleteAccount, uid);
      sinon.assert.calledOnceWithExactly(mockOAuthDb.removeTokensAndCodes, uid);
    });

    it('does not fail if pushbox fails to delete', async () => {
      mockPushbox.deleteAccount = sinon.fake.rejects();
      try {
        await accountDeleteManager.deleteAccount(uid);
      } catch (err) {
        assert.fail('no exception should have been thrown');
      }
    });

    it('should fail if stripeHelper update customer fails', async () => {
      mockStripeHelper.removeCustomer(async () => {
        throw new Error('wibble');
      });
      try {
        await accountDeleteManager.deleteAccount(uid);
        assert.fail('method should throw an error');
      } catch (err) {
        assert.isObject(err);
      }
    });

    it('should fail if paypalHelper cancel billing agreement fails', async () => {
      mockPaypalHelper.cancelBillingAgreement(async () => {
        throw new Error('wibble');
      });
      try {
        await accountDeleteManager.deleteAccount(uid);
        assert.fail('method should throw an error');
      } catch (err) {
        assert.isObject(err);
      }
    });
  });

  describe('clean up account', () => {
    it('should clean up subscription and oauth related records', async () => {
      await accountDeleteManager.cleanupAccount(uid);

      sinon.assert.callCount(mockStripeHelper.removeCustomer, 1);
      sinon.assert.calledWithMatch(mockStripeHelper.removeCustomer, uid);

      sinon.assert.calledOnceWithExactly(
        mockAuthModels.getAllPayPalBAByUid,
        uid
      );
      sinon.assert.calledOnceWithExactly(
        mockPaypalHelper.cancelBillingAgreement,
        'B-test'
      );
      sinon.assert.calledOnceWithExactly(
        mockAuthModels.deleteAllPayPalBAs,
        uid
      );
      sinon.assert.calledOnceWithExactly(mockOAuthDb.removeTokensAndCodes, uid);
    });
  });
});
