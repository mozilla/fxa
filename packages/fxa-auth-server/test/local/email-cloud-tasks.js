/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const sendEmailTaskStub = sandbox.stub();
const { EmailCloudTaskManager } = proxyquire('../../lib/email-cloud-tasks', {
  ...require('../../lib/email-cloud-tasks'),
  '@fxa/shared/cloud-tasks': {
    SendEmailTasksFactory: () => ({
      sendEmail: sendEmailTaskStub,
    }),
  },
});

describe('EmailCloudTaskManager', () => {
  const mockConfig = {};
  const mockStatsd = { increment: sandbox.stub() };
  const emailCloudTaskManager = new EmailCloudTaskManager({
    config: mockConfig,
    statsd: mockStatsd,
  });
  const mockTaskPayload = {
    emailType: 'inactiveNotification',
    uid: '5adfe2a2a4c34dd6b77a16efcafedc44',
  };
  const deliveryTime = Date.now() + 60 * 24 * 60 * 60 * 1000;

  beforeEach(() => {
    sandbox.stub(Date, 'now').returns(1736500000000);
  });

  afterEach(() => {
    Date.now.restore();
    sandbox.reset();
  });

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
        { email_type: 'inactiveNotification' }
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
});
