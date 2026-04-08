/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { Container } from 'typedi';
import { ReasonForDeletion, EmailTypes } from '@fxa/shared/cloud-tasks';

const mocks = require('../../test/mocks');
const { getRoute } = require('../../test/routes_helpers');
const { cloudTaskRoutes } = require('./cloud-tasks');
const { AccountDeleteManager } = require('../account-delete');
const { EmailCloudTaskManager } = require('../email-cloud-tasks');

const mockConfig = {
  cloudTasks: {
    deleteAccounts: { queueName: 'del-accts' },
    inactiveAccountEmails: {
      firstEmailQueueName: 'inactives-first-email',
      secondEmailQueueName: 'inactives-second-email',
      thirdEmailQueueName: 'inactives-third-email',
    },
  },
};

const sandbox = sinon.createSandbox();
const deleteAccountStub = sandbox
  .stub()
  .callsFake((uid: any, reason: any, customerId: any) => {});
const inactiveNotificationStub = sandbox.stub();

afterAll(() => {
  Container.reset();
});

describe('/cloud-tasks/accounts/delete', () => {
  const uid = '0f0f0f9001';
  let mockLog: any;
  let route: any, routes: any;

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
    const req = {
      payload: { uid, reason: ReasonForDeletion.Unverified },
    };

    await route.handler(req);

    sinon.assert.calledOnce(deleteAccountStub);
    expect(deleteAccountStub.args[0][0]).toBe(uid);
  });
});

describe('/cloud-tasks/emails/notify-inactive', () => {
  let mockLog: any;
  let routes: any, route: any;

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

    await route.handler(req);
    sinon.assert.calledOnceWithExactly(inactiveNotificationStub, req);
  });
});
