/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Container } = require('typedi');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const { AppConfig } = require('../../lib/types');
const { AccountEventsManager } = require('../../lib/account-events');
const sendEmailTaskStub = sandbox.stub();
const notificationHandlerStub = sandbox.stub();
const { EmailCloudTaskManager } = proxyquire('../../lib/email-cloud-tasks', {
  ...require('../../lib/email-cloud-tasks'),
  '@fxa/shared/cloud-tasks': {
    ...require('@fxa/shared/cloud-tasks'),
    SendEmailTasksFactory: () => ({
      sendEmail: sendEmailTaskStub,
    }),
  },
  './inactive-accounts': {
    InactiveAccountsManager: class InactiveAccountsManager {
      async handleNotificationTask() {
        notificationHandlerStub.call(this, ...arguments);
      }
    },
  },
});
import { EmailTypes } from '@fxa/shared/cloud-tasks';

describe('EmailCloudTaskManager', () => {
  const mockConfig = {
    authFirestore: {},
    securityHistory: {},
    cloudTasks: { useLocalEmulator: true },
  };
  Container.set(AppConfig, mockConfig);
  const accountEventsManager = new AccountEventsManager();
  Container.set(AccountEventsManager, accountEventsManager);
  const mockStatsd = { increment: sandbox.stub() };
  const emailCloudTaskManager = new EmailCloudTaskManager({
    config: mockConfig,
    statsd: mockStatsd,
  });

  const aDayInMs = 24 * 60 * 60 * 1000;
  const deliveryTime = Date.now() + 60 * aDayInMs;

  beforeEach(() => {
    sandbox.stub(Date, 'now').returns(1736500000000);
  });

  afterEach(() => {
    Date.now.restore();
    sandbox.reset();
  });

  const mockTaskPayload = {
    emailType: EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION,
    uid: '5adfe2a2a4c34dd6b77a16efcafedc44',
  };
  const mockSecondTaskPayload = {
    emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
    uid: mockTaskPayload.uid,
  };
  const mockFinalTaskPayload = {
    emailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
    uid: mockTaskPayload.uid,
  };

  describe('reschedule', () => {
    it('should reschedule a task', async () => {
      await emailCloudTaskManager.handleInactiveAccountNotification({
        payload: mockTaskPayload,
        raw: {
          req: {
            headers: {
              'fxa-cloud-task-delivery-time': deliveryTime.toString(),
              'x-cloudtasks-taskname': `${mockTaskPayload.uid}-inactive-notification`,
            },
          },
        },
      });
      sinon.assert.calledOnceWithExactly(sendEmailTaskStub, {
        payload: mockTaskPayload,
        emailOptions: {
          deliveryTime,
        },
        taskOptions: {
          taskId: `${mockTaskPayload.uid}-inactive-notification-reschedule-1`,
        },
      });
      sinon.assert.calledOnceWithExactly(
        mockStatsd.increment,
        'cloud-tasks.send-email.rescheduled',
        { email_type: EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION }
      );
    });

    it('should increment the reschedule task id', async () => {
      await emailCloudTaskManager.handleInactiveAccountNotification({
        payload: mockTaskPayload,
        raw: {
          req: {
            headers: {
              'fxa-cloud-task-delivery-time': deliveryTime.toString(),
              'x-cloudtasks-taskname': `${mockTaskPayload.uid}-inactive-notification-reschedule-1`,
            },
          },
        },
      });
      sinon.assert.calledOnceWithExactly(sendEmailTaskStub, {
        payload: mockTaskPayload,
        emailOptions: {
          deliveryTime,
        },
        taskOptions: {
          taskId: `${mockTaskPayload.uid}-inactive-notification-reschedule-2`,
        },
      });
    });
  });

  describe('inactive account notifications', () => {
    it('should handle the first notification', async () => {
      await emailCloudTaskManager.handleInactiveAccountNotification({
        payload: mockTaskPayload,
        raw: {
          req: {
            headers: {
              'fxa-cloud-task-delivery-time': Date.now(),
            },
          },
        },
      });
      sinon.assert.calledOnceWithExactly(
        notificationHandlerStub,
        'first',
        mockTaskPayload
      );
    });

    it('should handle the second notification', async () => {
      await emailCloudTaskManager.handleInactiveAccountNotification({
        payload: mockSecondTaskPayload,
        raw: {
          req: {
            headers: {
              'fxa-cloud-task-delivery-time': Date.now(),
            },
          },
        },
      });
      sinon.assert.calledOnceWithExactly(
        notificationHandlerStub,
        'second',
        mockSecondTaskPayload
      );
    });

    it('should handle the final notification', async () => {
      await emailCloudTaskManager.handleInactiveAccountNotification({
        payload: mockFinalTaskPayload,
        raw: {
          req: {
            headers: {
              'fxa-cloud-task-delivery-time': Date.now(),
            },
          },
        },
      });
      sinon.assert.calledOnceWithExactly(
        notificationHandlerStub,
        'final',
        mockFinalTaskPayload
      );
    });
  });
});
