/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { getQueueCapacity, queuePath } from './cloud-tasks';
import {
  CloudTaskClientFactory,
  CloudTasksConvictConfigFactory,
  CloudTasksQueueStatsClientFactory,
} from './cloud-tasks.factories';

const config = {
  cloudTasks: {
    useLocalEmulator: true,
    projectId: 'project.id',
    locationId: 'locator.id',
    credentials: {
      keyFilename: 'keys.file',
    },
    oidc: {
      aud: 'oidc.aud',
      serviceAccountEmail: 'service.account.email',
    },
  },
};

describe('cloud-tasks', () => {
  describe('factories', () => {
    it('creates config', () => {
      const configSection = CloudTasksConvictConfigFactory();
      expect(configSection.useLocalEmulator.env).toEqual(
        'AUTH_CLOUDTASKS_USE_LOCAL_EMULATOR'
      );
      expect(configSection.projectId.env).toEqual('AUTH_CLOUDTASKS_PROJECT_ID');
      expect(configSection.locationId.env).toEqual(
        'AUTH_CLOUDTASKS_LOCATION_ID'
      );
      expect(configSection.credentials.keyFilename.env).toEqual(
        'AUTH_CLOUDTASKS_KEY_FILE'
      );
      expect(configSection.oidc.aud.env).toEqual('AUTH_CLOUDTASKS_OIDC_AUD');
      expect(configSection.oidc.serviceAccountEmail.env).toEqual(
        'AUTH_CLOUDTASKS_OIDC_EMAIL'
      );
      expect(configSection.deleteAccounts.queueName.env).toEqual(
        'AUTH_CLOUDTASKS_DEL_ACCT_QUEUENAME'
      );
      expect(configSection.deleteAccounts.taskUrl.env).toEqual(
        'AUTH_CLOUDTASKS_DEL_ACCT_TASK_URL'
      );
    });

    it('creates client from config', () => {
      const client = CloudTaskClientFactory(config);
      expect(client).toBeDefined();
    });

    it('creates a queue stats client', () => {
      const client = CloudTasksQueueStatsClientFactory(config);
      expect(client).toBeDefined();
    });
  });

  describe('queuePath', () => {
    it('builds the queue resource name', () => {
      expect(queuePath(config, 'first-email')).toBe(
        'projects/project.id/locations/locator.id/queues/first-email'
      );
    });
  });

  describe('getQueueCapacity', () => {
    const name = 'projects/project.id/locations/locator.id/queues/first-email';
    const queueWithCapacity = {
      stats: { tasksCount: '1200' },
      rateLimits: { maxDispatchesPerSecond: 10 },
    };
    let client: { getQueue: jest.Mock };

    beforeEach(() => {
      client = { getQueue: jest.fn().mockResolvedValue([queueWithCapacity]) };
    });

    it('requests rate limits and task statistics', async () => {
      await getQueueCapacity(client, name);

      expect(client.getQueue).toHaveBeenCalledWith({
        name,
        readMask: { paths: ['rate_limits', 'stats'] },
      });
    });

    it('parses the task count and dispatch rate', async () => {
      await expect(getQueueCapacity(client, name)).resolves.toEqual({
        tasksCount: 1200,
        maxDispatchesPerSecond: 10,
      });
    });

    it.each([null, {}])('rejects a missing task count (%p)', async (stats) => {
      client.getQueue.mockResolvedValue([{ ...queueWithCapacity, stats }]);

      await expect(getQueueCapacity(client, name)).rejects.toThrow(
        `Queue ${name} returned no task count.`
      );
    });

    it.each([null, {}, { maxDispatchesPerSecond: 0 }])(
      'rejects missing or zero dispatch rates (%p)',
      async (rateLimits) => {
        client.getQueue.mockResolvedValue([
          { ...queueWithCapacity, rateLimits },
        ]);

        await expect(getQueueCapacity(client, name)).rejects.toThrow(
          `Queue ${name} returned no dispatch rate.`
        );
      }
    );

    it('propagates queue read failures', async () => {
      client.getQueue.mockRejectedValue(new Error('PERMISSION_DENIED'));

      await expect(getQueueCapacity(client, name)).rejects.toThrow(
        'PERMISSION_DENIED'
      );
    });
  });
});
