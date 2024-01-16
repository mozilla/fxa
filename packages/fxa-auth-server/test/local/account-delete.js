/*  */ /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sinon = require('sinon');
const { assert } = require('chai');
const proxyquire = require('proxyquire');
const { default: Container } = require('typedi');
const { AppConfig, AuthLogger } = require('../../lib/types');
const { StripeHelper } = require('../../lib/payments/stripe');
const mocks = require('../mocks');

let createTaskStub;
const { AccountDeleteManager } = proxyquire('../../lib/account-delete', {
  '@google-cloud/tasks': {
    CloudTasksClient: class CloudTasksClient {
      constructor() {}
      createTask(...args) {
        return createTaskStub.apply(null, args);
      }
    },
  },
});

const uid = 'uid';
const email = 'testo@example.gg';
const sandbox = sinon.createSandbox();

describe('AccountDeleteManager', () => {
  let mockFxaDb;
  let mockOAuthDb;
  let mockPush;
  let mockPushbox;
  let mockStatsd;
  let mockStripeHelper;
  let mockLog;
  let mockConfig;
  let accountDeleteManager;

  beforeEach(() => {
    sandbox.reset();
    createTaskStub = sandbox.stub();
    mockFxaDb = mocks.mockDB({ email, uid });
    mockOAuthDb = {};
    mockPush = mocks.mockPush();
    mockPushbox = mocks.mockPushbox();
    mockStatsd = { increment: sandbox.stub() };
    mockStripeHelper = {};
    mockLog = mocks.mockLog();

    Container.set(StripeHelper, mockStripeHelper);
    Container.set(AuthLogger, mockLog);

    mockConfig = {
      apiVersion: 1,
      cloudTasks: mocks.mockCloudTasksConfig,
      publicUrl: 'https://tasks.example.io',
    };

    Container.set(AppConfig, mockConfig);

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
});
