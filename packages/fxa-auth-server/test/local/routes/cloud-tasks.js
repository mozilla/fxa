/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Container } = require('typedi');
const { assert } = require('chai');
const sinon = require('sinon');
const mocks = require('../../mocks');

const { ReasonForDeletion, EmailTypes } = require('@fxa/shared/cloud-tasks');

const getRoute = require('../../routes_helpers').getRoute;
const { cloudTaskRoutes } = require('../../../lib/routes/cloud-tasks');
const { AccountDeleteManager } = require('../../../lib/account-delete');
const { EmailCloudTaskManager } = require('../../../lib/email-cloud-tasks');
const mockConfig = {
  cloudTasks: {
    deleteAccounts: { queueName: 'del-accts' },
    sendEmails: { queueName: 'send-emails' },
  },
};

const sandbox = sinon.createSandbox();
const deleteAccountStub = sandbox
  .stub()
  .callsFake((uid, reason, customerId) => {});
const inactiveNotificationStub = sandbox.stub();

describe('/cloud-tasks/accounts/delete', () => {
  const uid = '0f0f0f9001';
  let mockLog;
  let route, routes;

  beforeEach(() => {
    mockLog = mocks.mockLog();
    sandbox.reset();

    Container.set(AccountDeleteManager, {
      deleteAccount: deleteAccountStub,
    });
    Container.set(EmailCloudTaskManager, {
      handleInactiveAccountNotification: inactiveNotificationStub,
    });

    routes = cloudTaskRoutes(mockLog, mockConfig);
    route = getRoute(routes, '/cloud-tasks/accounts/delete');
  });

  it('should delete the account', async () => {
    try {
      const req = {
        payload: { uid, reason: ReasonForDeletion.Unverified },
      };

      await route.handler(req);

      sinon.assert.calledOnce(deleteAccountStub);
      assert.equal(deleteAccountStub.args[0][0], uid);
    } catch (err) {
      console.log(err);
      assert.fail('An error should not have been thrown.');
    }
  });
});

describe('/cloud-tasks/emails/notify-inactive', () => {
  let mockLog;
  let routes, route;

  beforeEach(() => {
    sandbox.reset();
    mockLog = mocks.mockLog();

    Container.set(AccountDeleteManager, {
      deleteAccount: deleteAccountStub,
    });
    Container.set(EmailCloudTaskManager, {
      handleInactiveAccountNotification: inactiveNotificationStub,
    });

    routes = cloudTaskRoutes(mockLog, mockConfig);
    route = getRoute(routes, '/cloud-tasks/emails/notify-inactive');
  });

  it('should handle the inactive notification email task', async () => {
    const req = {
      payload: {
        uid: 'act0123456789',
        emailType: EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION,
      },
      raw: {
        req: {
          headers: {
            'fxa-cloud-task-delivery-time': '17365000000',
            'x-cloudtasks-taskname': 'act0123456789-inactive-notification',
          },
        },
      },
    };
    try {
      await route.handler(req);
      sinon.assert.calledOnceWithExactly(inactiveNotificationStub, req);
    } catch (err) {
      assert.fail('An error should not have been thrown.');
    }
  });
});
