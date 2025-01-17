/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { CloudTasks } from './cloud-tasks';
import { CloudTasksClient } from '@google-cloud/tasks';
import {
  FxACloudTaskHeaders,
  SendEmailCloudTaskConfig,
  SendEmailTaskPayload,
} from './account-tasks.types';
import { CloudTaskOptions } from './cloud-tasks.types';

export enum EmailTypes {
  INACTIVE_DELETE_FIRST_NOTIFICATION = 'inactiveDeleteFirstNotification',
  INACTIVE_DELETE_SECOND_NOTIFICATION = 'inactiveDeleteSecondNotification',
}
export type CloudTaskEmailType = (typeof EmailTypes)[keyof typeof EmailTypes];

const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

export class SendEmailTasks extends CloudTasks {
  constructor(
    protected override config: SendEmailCloudTaskConfig,
    protected cloudTaskClient: Pick<CloudTasksClient, 'createTask' | 'getTask'>,
    protected statsd: Pick<StatsD, 'increment'>
  ) {
    super(config, cloudTaskClient);
  }

  /**
   * Enqueues a Google cloud task to send an email.
   *
   * @returns A taskName
   */
  public async sendEmail(task: {
    payload: SendEmailTaskPayload;
    emailOptions?: { deliveryTime: number };
    taskOptions?: CloudTaskOptions;
  }) {
    // schedule time is when the task is dispatched and there's a limit of
    // 30 days.  delivery time is when we want to send the email by
    // handling the task.
    const now = Date.now();
    const inThirtyDays = now + thirtyDaysInMs;
    const deliveryTime = task.emailOptions?.deliveryTime || now;
    const scheduleTime = Math.min(deliveryTime, inThirtyDays);

    const taskHeaders: FxACloudTaskHeaders = {
      'fxa-cloud-task-delivery-time': deliveryTime.toString(),
    };

    const taskOptions: CloudTaskOptions = {
      ...task.taskOptions,
      scheduleTime: {
        seconds: scheduleTime / 1000,
      },
    };

    try {
      const result = await this.enqueueTask(
        {
          queueName: this.config.cloudTasks.sendEmails.queueName,
          taskUrl: this.config.cloudTasks.sendEmails.taskUrl,
          taskPayload: task.payload,
          taskHeaders,
        },
        taskOptions
      );
      const taskName = result[0].name;

      this.statsd.increment('cloud-tasks.send-email.enqueue.success', [
        task.payload.emailType,
      ]);
      return taskName;
    } catch (err) {
      this.statsd.increment('cloud-tasks.send-email.enqueue.failure', [
        task.payload.emailType,
      ]);
      throw err;
    }
  }
}
