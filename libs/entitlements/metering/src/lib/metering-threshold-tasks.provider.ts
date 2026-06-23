/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import type { CloudTasksClient } from '@google-cloud/tasks';

import { CloudTaskClientFactory } from '@fxa/shared/cloud-tasks';

import { MeteringConfig } from './metering.config';
import { MeteringCloudTasksClient } from './metering-threshold-tasks.manager';

export const MeteringCloudTasksClientProvider: Provider<CloudTasksClient> = {
  provide: MeteringCloudTasksClient,
  useFactory: (meteringConfig: MeteringConfig) =>
    CloudTaskClientFactory({ cloudTasks: meteringConfig.cloudTasks }),
  inject: [MeteringConfig],
};
