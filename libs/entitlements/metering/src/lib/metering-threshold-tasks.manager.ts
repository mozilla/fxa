/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { CloudTasksClient } from '@google-cloud/tasks';

import { CloudTasks } from '@fxa/shared/cloud-tasks';
import { StatsDService, type StatsD } from '@fxa/shared/metrics/statsd';

import {
  MeteringCloudTasksConfig,
  MeteringConfig,
} from './metering.config';
import { buildThresholdTaskId } from './utils/buildThresholdTaskId';
import type { ThresholdCheckTaskPayload } from './utils/buildThresholdTaskId';
import { classifyEnqueueError } from './utils/classifyEnqueueError';
import { requireMeteringCloudTasksConfig } from './utils/requireMeteringCloudTasksConfig';

export interface ScheduleThresholdCheckResult {
  enqueued: boolean;
  taskId: string;
  reason: 'created' | 'dedup' | 'error';
}

/**
 * Enqueues threshold-check Cloud Tasks on every ingest. Task names embed a
 * 5-minute bucket of `(slug, userIdentifier)` so concurrent enqueues from
 * any number of payments-api replicas for the same user collapse to a
 * single delivery via Cloud Tasks' name-based dedup; an `ALREADY_EXISTS`
 * from `createTask` is the happy path.
 */
@Injectable()
export class MeteringThresholdTasksManager extends CloudTasks {
  private readonly meteringCloudTasksConfig: MeteringCloudTasksConfig;

  constructor(
    meteringConfig: MeteringConfig,
    @Inject(CloudTasksClient)
    cloudTasksClient: Pick<CloudTasksClient, 'createTask' | 'getTask'>,
    @Inject(StatsDService) private readonly statsd: StatsD,
    @Inject(Logger) private readonly logger: LoggerService
  ) {
    const meteringCloudTasksConfig = requireMeteringCloudTasksConfig(meteringConfig);
    super({ cloudTasks: meteringCloudTasksConfig }, cloudTasksClient);
    this.meteringCloudTasksConfig = meteringCloudTasksConfig;
  }

  async scheduleThresholdCheck(
    payload: ThresholdCheckTaskPayload,
    now: Date = new Date()
  ): Promise<ScheduleThresholdCheckResult> {
    const { bucketSizeMs, scheduleDelayMs } = this.meteringCloudTasksConfig.threshold;
    const taskId = buildThresholdTaskId(payload, now, bucketSizeMs);
    const scheduleTimeSec = (now.getTime() + scheduleDelayMs) / 1000;

    try {
      await this.enqueueTask(
        {
          queueName: this.meteringCloudTasksConfig.threshold.queueName,
          taskUrl: this.meteringCloudTasksConfig.threshold.taskUrl,
          taskPayload: payload,
        },
        {
          taskId,
          scheduleTime: { seconds: scheduleTimeSec },
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

