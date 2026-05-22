/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MeteringCloudTasksConfig,
  MeteringConfig,
} from '../metering.config';

export function requireMeteringCloudTasksConfig(
  meteringConfig: MeteringConfig
): MeteringCloudTasksConfig {
  if (!meteringConfig.cloudTasks) {
    throw new Error(
      'MeteringConfig.cloudTasks is required for threshold task enqueue'
    );
  }
  if (!meteringConfig.cloudTasks.threshold.queueName) {
    throw new Error(
      'MeteringConfig.cloudTasks.threshold.queueName is required'
    );
  }
  if (!meteringConfig.cloudTasks.threshold.taskUrl) {
    throw new Error(
      'MeteringConfig.cloudTasks.threshold.taskUrl is required'
    );
  }
  return meteringConfig.cloudTasks;
}
