/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import {
  DeleteAccountCloudTaskConfig,
  SendEmailCloudTaskConfig,
} from './account-tasks.types';
import { CloudTaskClientFactory } from './cloud-tasks.factories';
import { DeleteAccountTasks } from './delete-account-tasks';
import { SendEmailTasks } from './send-email-tasks';

/** Produces a DeleteAccountCloudTask instance */
export function DeleteAccountTasksFactory(
  config: DeleteAccountCloudTaskConfig,
  statsd: Pick<StatsD, 'increment'>
) {
  const client = CloudTaskClientFactory(config);
  return new DeleteAccountTasks(config, client, statsd);
}

export function SendEmailTasksFactory(
  config: SendEmailCloudTaskConfig,
  statsd: Pick<StatsD, 'increment'>
) {
  const client = CloudTaskClientFactory(config);
  return new SendEmailTasks(config, client, statsd);
}
