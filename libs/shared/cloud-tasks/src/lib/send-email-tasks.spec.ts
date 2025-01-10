/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailTypes, SendEmailTasks } from './send-email-tasks';
import { SendEmailTasksFactory } from './account-tasks.factories';

const now = 1736500000000;
jest.useFakeTimers({ now });

describe('send-email-tasks', () => {
  const mockStatsd = {
    increment: jest.fn(),
  };

  const mockCloudClient = {
    getTask: jest.fn(),
    createTask: jest.fn(),
  };

  const mockConfig = {
    cloudTasks: {
      useLocalEmulator: true,
      projectId: 'pid123',
      locationId: 'lid123',
      credentials: {
        keyFilename: 'foo.cred',
      },
      oidc: {
        aud: 'foo',
        serviceAccountEmail: 'foo@mozilla.com',
      },
      sendEmails: {
        taskUrl: 'http://localhost:9000/v1/cloud-tasks/emails/notify-inactive',
        queueName: 'notification-emails',
      },
    },
    publicUrl: 'http://localhost:9000',
    apiVersion: '1',
  };

  describe('factories', () => {
    it('produces SendEmailTasks', () => {
      const sendEmailTasks = SendEmailTasksFactory(mockConfig, mockStatsd);
      expect(sendEmailTasks).toBeDefined();
    });
  });

  describe('send email tasks', () => {
    const mockSendEmailPayload = {
      uid: 'act0123456789',
      emailType: EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION,
    };
    const mockTaskOptions = {
      taskId: 'act0123456789-inactive-delete-notification',
    };

    let sendEmailTasks: SendEmailTasks;

    beforeEach(() => {
      sendEmailTasks = new SendEmailTasks(
        mockConfig,
        mockCloudClient,
        mockStatsd
      );
    });

    it('creates email task with same delivery and schedule time', async () => {
      mockCloudClient.createTask.mockImplementation(() => {
        return [{ name: 'task123' }];
      });

      const taskName = await sendEmailTasks.sendEmail({
        payload: mockSendEmailPayload,
        taskOptions: mockTaskOptions,
      });
      expect(taskName).toEqual('task123');
      expect(mockStatsd.increment).toBeCalledWith(
        'cloud-tasks.send-email.enqueue.success',
        ['inactiveDeleteFirstNotification']
      );
      expect(mockCloudClient.createTask).toBeCalledWith({
        parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.sendEmails.queueName}`,
        task: {
          httpRequest: {
            url: mockConfig.cloudTasks.sendEmails.taskUrl,
            httpMethod: 1, // POST
            headers: {
              'Content-Type': 'application/json',
              'fxa-cloud-task-delivery-time': now.toString(),
            },
            body: Buffer.from(JSON.stringify(mockSendEmailPayload)).toString(
              'base64'
            ),
            oidcToken: {
              audience: mockConfig.cloudTasks.oidc.aud,
              serviceAccountEmail:
                mockConfig.cloudTasks.oidc.serviceAccountEmail,
            },
          },
          name: 'projects/pid123/locations/lid123/queues/notification-emails/tasks/act0123456789-inactive-delete-notification',
          scheduleTime: {
            seconds: now / 1000,
          },
        },
      });
    });

    it('creates email task with delivery beyond schedule time', async () => {
      mockCloudClient.createTask.mockImplementation(() => {
        return [{ name: 'task123' }];
      });

      await sendEmailTasks.sendEmail({
        payload: mockSendEmailPayload,
        emailOptions: { deliveryTime: now + 60 * 24 * 60 * 60 * 1000 },
        taskOptions: mockTaskOptions,
      });
      expect(mockStatsd.increment).toBeCalledWith(
        'cloud-tasks.send-email.enqueue.success',
        ['inactiveDeleteFirstNotification']
      );
      expect(mockCloudClient.createTask).toBeCalledWith({
        parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.sendEmails.queueName}`,
        task: {
          httpRequest: {
            url: mockConfig.cloudTasks.sendEmails.taskUrl,
            httpMethod: 1, // POST
            headers: {
              'Content-Type': 'application/json',
              'fxa-cloud-task-delivery-time': '1741684000000',
            },
            body: Buffer.from(JSON.stringify(mockSendEmailPayload)).toString(
              'base64'
            ),
            oidcToken: {
              audience: mockConfig.cloudTasks.oidc.aud,
              serviceAccountEmail:
                mockConfig.cloudTasks.oidc.serviceAccountEmail,
            },
          },
          name: 'projects/pid123/locations/lid123/queues/notification-emails/tasks/act0123456789-inactive-delete-notification',
          scheduleTime: {
            seconds: 1739092000,
          },
        },
      });
    });

    it('reports send email task failure', async () => {
      mockCloudClient.createTask.mockImplementation(() => {
        throw new Error('BOOM');
      });
      await expect(
        sendEmailTasks.sendEmail({
          payload: mockSendEmailPayload,
          taskOptions: mockTaskOptions,
        })
      ).rejects.toThrow('BOOM');
      expect(mockStatsd.increment).toHaveBeenLastCalledWith(
        'cloud-tasks.send-email.enqueue.failure',
        ['inactiveDeleteFirstNotification']
      );
    });
  });
});
