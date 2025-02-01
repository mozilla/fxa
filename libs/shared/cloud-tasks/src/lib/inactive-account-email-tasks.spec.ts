/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  EmailTypes,
  InactiveAccountEmailTasks,
} from './inactive-account-email-tasks';
import { InactiveAccountEmailTasksFactory } from './account-tasks.factories';

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
      inactiveAccountEmails: {
        taskUrl: 'http://localhost:9000/v1/cloud-tasks/emails/notify-inactive',
        firstEmailQueueName: 'inactive-first-email',
        secondEmailQueueName: 'inactive-second-email',
        thirdEmailQueueName: 'inactive-third-email',
        firstToSecondEmailIntervalMs: 53 * 24 * 60 * 60 * 1000,
        secondToThirdEmailIntervalMs: 6 * 24 * 60 * 60 * 1000,
      },
    },
    publicUrl: 'http://localhost:9000',
    apiVersion: '1',
  };

  describe('factories', () => {
    it('produces InactiveAccountEmailTasks', () => {
      const inactiveAccountEmailTasks = InactiveAccountEmailTasksFactory(
        mockConfig,
        mockStatsd
      );
      expect(inactiveAccountEmailTasks).toBeDefined();
    });
  });

  describe('inactive account email tasks', () => {
    const mockTaskOptions = {
      taskId: 'act0123456789-inactive-delete-notification',
    };

    let inactiveAccountEmailTasks: InactiveAccountEmailTasks;

    beforeEach(() => {
      inactiveAccountEmailTasks = new InactiveAccountEmailTasks(
        mockConfig,
        mockCloudClient,
        mockStatsd
      );
    });

    describe('first email', () => {
      const mockInactiveAccountEmailPayload = {
        uid: 'act0123456789',
        emailType: EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION,
      };

      it('creates email task with same delivery and schedule time', async () => {
        mockCloudClient.createTask.mockImplementation(() => {
          return [{ name: 'task123' }];
        });

        const taskName = await inactiveAccountEmailTasks.scheduleFirstEmail({
          payload: mockInactiveAccountEmailPayload,
          taskOptions: mockTaskOptions,
        });
        expect(taskName).toEqual('task123');
        expect(mockStatsd.increment).toBeCalledWith(
          'cloud-tasks.inactive-account-email.enqueue.success',
          ['inactiveDeleteFirstNotification']
        );
        expect(mockCloudClient.createTask).toBeCalledWith({
          parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.inactiveAccountEmails.firstEmailQueueName}`,
          task: {
            httpRequest: {
              url: mockConfig.cloudTasks.inactiveAccountEmails.taskUrl,
              httpMethod: 1, // POST
              headers: {
                'Content-Type': 'application/json',
                'fxa-cloud-task-delivery-time': now.toString(),
              },
              body: Buffer.from(
                JSON.stringify(mockInactiveAccountEmailPayload)
              ).toString('base64'),
              oidcToken: {
                audience: mockConfig.cloudTasks.oidc.aud,
                serviceAccountEmail:
                  mockConfig.cloudTasks.oidc.serviceAccountEmail,
              },
            },
            name: `projects/pid123/locations/lid123/queues/${mockConfig.cloudTasks.inactiveAccountEmails.firstEmailQueueName}/tasks/act0123456789-inactive-delete-notification`,
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

        await inactiveAccountEmailTasks.scheduleFirstEmail({
          payload: mockInactiveAccountEmailPayload,
          emailOptions: { deliveryTime: now + 60 * 24 * 60 * 60 * 1000 },
          taskOptions: mockTaskOptions,
        });
        expect(mockStatsd.increment).toBeCalledWith(
          'cloud-tasks.inactive-account-email.enqueue.success',
          ['inactiveDeleteFirstNotification']
        );
        expect(mockCloudClient.createTask).toBeCalledWith({
          parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.inactiveAccountEmails.firstEmailQueueName}`,
          task: {
            httpRequest: {
              url: mockConfig.cloudTasks.inactiveAccountEmails.taskUrl,
              httpMethod: 1, // POST
              headers: {
                'Content-Type': 'application/json',
                'fxa-cloud-task-delivery-time': '1741684000000',
              },
              body: Buffer.from(
                JSON.stringify(mockInactiveAccountEmailPayload)
              ).toString('base64'),
              oidcToken: {
                audience: mockConfig.cloudTasks.oidc.aud,
                serviceAccountEmail:
                  mockConfig.cloudTasks.oidc.serviceAccountEmail,
              },
            },
            name: `projects/pid123/locations/lid123/queues/${mockConfig.cloudTasks.inactiveAccountEmails.firstEmailQueueName}/tasks/act0123456789-inactive-delete-notification`,
            scheduleTime: {
              seconds: 1739092000,
            },
          },
        });
      });
    });

    describe('second email', () => {
      const mockInactiveAccountEmailPayload = {
        uid: 'act0123456789',
      };

      it('creates an email task in the correct queue', async () => {
        mockCloudClient.createTask.mockImplementation(() => {
          return [{ name: 'task123' }];
        });

        const taskName = await inactiveAccountEmailTasks.scheduleSecondEmail({
          payload: mockInactiveAccountEmailPayload,
          taskOptions: mockTaskOptions,
        });
        expect(taskName).toEqual('task123');
        expect(mockStatsd.increment).toBeCalledWith(
          'cloud-tasks.inactive-account-email.enqueue.success',
          ['inactiveDeleteSecondNotification']
        );
        expect(mockCloudClient.createTask).toBeCalledWith({
          parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.inactiveAccountEmails.secondEmailQueueName}`,
          task: {
            httpRequest: {
              url: mockConfig.cloudTasks.inactiveAccountEmails.taskUrl,
              httpMethod: 1, // POST
              headers: {
                'Content-Type': 'application/json',
                'fxa-cloud-task-delivery-time': (
                  now +
                  53 * 24 * 60 * 60 * 1000
                ).toString(),
              },
              body: Buffer.from(
                JSON.stringify({
                  ...mockInactiveAccountEmailPayload,
                  emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
                })
              ).toString('base64'),
              oidcToken: {
                audience: mockConfig.cloudTasks.oidc.aud,
                serviceAccountEmail:
                  mockConfig.cloudTasks.oidc.serviceAccountEmail,
              },
            },
            name: `projects/pid123/locations/lid123/queues/${mockConfig.cloudTasks.inactiveAccountEmails.secondEmailQueueName}/tasks/act0123456789-inactive-delete-notification`,
            scheduleTime: {
              seconds: 1739092000,
            },
          },
        });
      });
    });

    describe('third email', () => {
      const mockInactiveAccountEmailPayload = {
        uid: 'act0123456789',
      };

      it('creates an email task in the correct queue', async () => {
        mockCloudClient.createTask.mockImplementation(() => {
          return [{ name: 'task123' }];
        });

        const taskName = await inactiveAccountEmailTasks.scheduleFinalEmail({
          payload: mockInactiveAccountEmailPayload,
          taskOptions: mockTaskOptions,
        });
        expect(taskName).toEqual('task123');
        expect(mockStatsd.increment).toBeCalledWith(
          'cloud-tasks.inactive-account-email.enqueue.success',
          ['inactiveDeleteFinalNotification']
        );
        expect(mockCloudClient.createTask).toBeCalledWith({
          parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.inactiveAccountEmails.thirdEmailQueueName}`,
          task: {
            httpRequest: {
              url: mockConfig.cloudTasks.inactiveAccountEmails.taskUrl,
              httpMethod: 1, // POST
              headers: {
                'Content-Type': 'application/json',
                'fxa-cloud-task-delivery-time': (
                  now +
                  6 * 24 * 60 * 60 * 1000
                ).toString(),
              },
              body: Buffer.from(
                JSON.stringify({
                  ...mockInactiveAccountEmailPayload,

                  emailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
                })
              ).toString('base64'),
              oidcToken: {
                audience: mockConfig.cloudTasks.oidc.aud,
                serviceAccountEmail:
                  mockConfig.cloudTasks.oidc.serviceAccountEmail,
              },
            },
            name: `projects/pid123/locations/lid123/queues/${mockConfig.cloudTasks.inactiveAccountEmails.thirdEmailQueueName}/tasks/act0123456789-inactive-delete-notification`,
            scheduleTime: {
              seconds: (now + 6 * 24 * 60 * 60 * 1000) / 1000,
            },
          },
        });
      });
    });

    it('reports send email task failure', async () => {
      mockCloudClient.createTask.mockImplementation(() => {
        throw new Error('BOOM');
      });
      await expect(
        inactiveAccountEmailTasks.scheduleFirstEmail({
          payload: {
            uid: 'act0123456789',
          },
          taskOptions: mockTaskOptions,
        })
      ).rejects.toThrow('BOOM');
      expect(mockStatsd.increment).toHaveBeenLastCalledWith(
        'cloud-tasks.inactive-account-email.enqueue.failure',
        ['inactiveDeleteFirstNotification']
      );
    });
  });
});
