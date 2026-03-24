/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
import { Container } from 'typedi';
import { AppConfig } from './types';
import { AccountEventsManager } from './account-events';

const sandbox = sinon.createSandbox();

const mockEmailTasks = {
  scheduleFirstEmail: sandbox.stub(),
  scheduleSecondEmail: sandbox.stub(),
  scheduleFinalEmail: sandbox.stub(),
};
const notificationHandlerStub = sandbox.stub();

jest.mock('@fxa/shared/cloud-tasks', () => {
  const actual = jest.requireActual('@fxa/shared/cloud-tasks');
  return {
    ...actual,
    InactiveAccountEmailTasksFactory: () => mockEmailTasks,
  };
});

jest.mock('./inactive-accounts', () => {
  const actual = jest.requireActual('./inactive-accounts');
  return {
    ...actual,
    InactiveAccountsManager: class InactiveAccountsManager {
      async handleNotificationTask(...args: unknown[]) {
        notificationHandlerStub.call(this, ...args);
      }
    },
  };
});

const { EmailCloudTaskManager } = require('./email-cloud-tasks');
const { EmailTypes } = require('@fxa/shared/cloud-tasks');

describe('EmailCloudTaskManager', () => {
  const mockConfig = {
    authFirestore: {},
    securityHistory: {},
    cloudTasks: {
      useLocalEmulator: true,
    },
  };
  const aDayInMs = 24 * 60 * 60 * 1000;
  let deliveryTime: number;
  let mockStatsd: { increment: sinon.SinonStub };
  let emailCloudTaskManager: InstanceType<typeof EmailCloudTaskManager>;

  beforeEach(() => {
    sandbox.stub(Date, 'now').returns(1736500000000);
    deliveryTime = Date.now() + 60 * aDayInMs;

    Container.set(AppConfig, mockConfig);
    const accountEventsManager = new AccountEventsManager();
    Container.set(AccountEventsManager, accountEventsManager);
    mockStatsd = { increment: sandbox.stub() };
    emailCloudTaskManager = new EmailCloudTaskManager({
      config: mockConfig,
      statsd: mockStatsd,
    });
  });

  afterEach(() => {
    (Date.now as sinon.SinonStub).restore();
    sandbox.reset();
    Container.reset();
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
      sinon.assert.calledOnceWithExactly(mockEmailTasks.scheduleFirstEmail, {
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
      sinon.assert.calledOnceWithExactly(mockEmailTasks.scheduleFirstEmail, {
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
        mockFinalTaskPayload
      );
    });
  });
});
