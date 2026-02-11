/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CloudTaskClientFactory,
  CloudTasksConvictConfigFactory,
} from './cloud-tasks.factories';

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
      const client = CloudTaskClientFactory({
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
      });
      expect(client).toBeDefined();
    });
  });
});
