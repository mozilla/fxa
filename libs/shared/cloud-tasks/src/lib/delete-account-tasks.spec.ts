/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DeleteAccountTasks } from './delete-account-tasks';
import { DeleteAccountTasksFactory } from './account-tasks.factories';
import { ReasonForDeletion } from './account-tasks.types';

describe('account-tasks', () => {
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
      deleteAccounts: {
        taskUrl: 'http://localhost:9000/v1/cloud-tasks/account/delete',
        queueName: 'delete-account',
      },
    },
    publicUrl: 'http://localhost:9000',
    apiVersion: '1',
  };

  describe('factories', () => {
    it('produces AccountTasks', () => {
      const accountTasks = DeleteAccountTasksFactory(mockConfig, mockStatsd);
      expect(accountTasks).toBeDefined();
    });
  });

  describe('account delete tasks', () => {
    const mockDeleteTaskPayload = {
      uid: 'act0123456789',
      customerId: 'stripe0123456789',
      reason: ReasonForDeletion.Cleanup,
    };

    let deleteAccountCloudTask: DeleteAccountTasks;

    beforeEach(() => {
      deleteAccountCloudTask = new DeleteAccountTasks(
        {
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
            deleteAccounts: {
              taskUrl: 'http://localhost:9000/v1/cloud-tasks/accounts/delete',
              queueName: 'delete-account',
            },
          },
          publicUrl: 'http://localhost:9000',
          apiVersion: '1',
        },
        mockCloudClient,
        mockStatsd
      );
    });

    it('should exist', () => {
      expect(deleteAccountCloudTask).toBeDefined();
    });

    it('creates delete task', async () => {
      mockCloudClient.createTask.mockImplementation(() => {
        return [{ name: 'task123' }];
      });

      const taskName = await deleteAccountCloudTask.deleteAccount(
        mockDeleteTaskPayload
      );
      expect(taskName).toEqual('task123');
      expect(mockStatsd.increment).toBeCalledWith(
        'cloud-tasks.account-delete.enqueue.success'
      );
      expect(mockCloudClient.createTask).toBeCalledWith({
        parent: `projects/${mockConfig.cloudTasks.projectId}/locations/${mockConfig.cloudTasks.locationId}/queues/${mockConfig.cloudTasks.deleteAccounts.queueName}`,
        task: {
          httpRequest: {
            url: 'http://localhost:9000/v1/cloud-tasks/accounts/delete',
            httpMethod: 1, // POST
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.from(JSON.stringify(mockDeleteTaskPayload)).toString(
              'base64'
            ),
            oidcToken: {
              audience: mockConfig.cloudTasks.oidc.aud,
              serviceAccountEmail:
                mockConfig.cloudTasks.oidc.serviceAccountEmail,
            },
          },
        },
      });
    });

    it('reports delete task failure', async () => {
      mockCloudClient.createTask.mockImplementation(() => {
        throw new Error('BOOM');
      });
      await expect(
        deleteAccountCloudTask.deleteAccount(mockDeleteTaskPayload)
      ).rejects.toThrow('BOOM');
      expect(mockStatsd.increment).toBeCalledWith(
        'cloud-tasks.account-delete.enqueue.failure'
      );
    });

    it('retrieves delete task status', async () => {
      mockCloudClient.getTask.mockImplementation(() => {
        return { status: 'pending' };
      });
      const result = await deleteAccountCloudTask.getTaskStatus('task123');
      expect(result).toEqual({ status: 'pending' });
    });
  });
});
