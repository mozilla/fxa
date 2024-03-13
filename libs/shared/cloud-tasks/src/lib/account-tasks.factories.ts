/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { DeleteAccountCloudTaskConfig } from './account-tasks.types';
import { CloudTaskClientFactory } from './cloud-tasks.factories';
import { AccountTasks } from './account-tasks';

/** Produces a DeleteAccountCloudTask instance */
export function AccountTasksFactory(
  config: DeleteAccountCloudTaskConfig,
  statsd: Pick<StatsD, 'increment'>
) {
  const client = CloudTaskClientFactory(config);
  return new AccountTasks(config, client, statsd);
}
