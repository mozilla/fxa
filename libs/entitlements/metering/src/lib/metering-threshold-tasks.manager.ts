/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import type { CloudTasksClient } from '@google-cloud/tasks';

import { CloudTasks } from '@fxa/shared/cloud-tasks';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import { MeteringCloudTasksConfig, MeteringConfig } from './metering.config';
import {
  buildThresholdTaskId,
  type ThresholdCheckTaskPayload,
} from './utils/buildThresholdTaskId';
import { classifyEnqueueError } from './utils/classifyEnqueueError';

const MS_PER_SECOND = 1000;
const NS_PER_MS = 1_000_000;

/** Separate token so this client isn't shared with other payments-api consumers. */
export const MeteringCloudTasksClient = Symbol('METERING_CLOUD_TASKS_CLIENT');

export interface ScheduleThresholdCheckResult {
  enqueued: boolean;
  taskId: string;
  reason: 'created' | 'dedup' | 'error';
}

@Injectable()
export class MeteringThresholdTasksManager extends CloudTasks {
  private readonly meteringCloudTasksConfig: MeteringCloudTasksConfig;

  constructor(
    meteringConfig: MeteringConfig,
    @Inject(MeteringCloudTasksClient)
    cloudTasksClient: Pick<CloudTasksClient, 'createTask' | 'getTask'>,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {
    super({ cloudTasks: meteringConfig.cloudTasks }, cloudTasksClient);
    this.meteringCloudTasksConfig = meteringConfig.cloudTasks;
  }

  async scheduleThresholdCheck(
    payload: ThresholdCheckTaskPayload,
    now: Date = new Date()
  ): Promise<ScheduleThresholdCheckResult> {
    const { bucketSizeMs, scheduleDelayMs, queueName, taskUrl } =
      this.meteringCloudTasksConfig.threshold;
    const taskId = buildThresholdTaskId(payload, now, bucketSizeMs);
    const fireTimeMs = now.getTime() + scheduleDelayMs;

    try {
      await this.enqueueTask(
        {
          queueName,
          taskUrl,
          taskPayload: payload,
        },
        {
          taskId,
          scheduleTime: {
            seconds: Math.floor(fireTimeMs / MS_PER_SECOND),
            nanos: (fireTimeMs % MS_PER_SECOND) * NS_PER_MS,
          },
        }
      );
      this.statsd.increment('metering.tasks.enqueue');
      return { enqueued: true, taskId, reason: 'created' };
    } catch (err) {
      const reason = classifyEnqueueError(err);
      if (reason === 'dedup') {
        this.statsd.increment('metering.tasks.enqueue.dedup');
        return { enqueued: false, taskId, reason: 'dedup' };
      }
      this.statsd.increment('metering.tasks.enqueue_error', { reason });
      this.logger.error(err);
      return { enqueued: false, taskId, reason: 'error' };
    }
  }
}
