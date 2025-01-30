/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { CloudTasks } from './cloud-tasks';
import { CloudTasksClient } from '@google-cloud/tasks';
import {
  FxACloudTaskHeaders,
  InactiveAccountEmailCloudTaskConfig,
  InactiveAccountEmailTaskPayloadParam,
  SendEmailTaskPayload,
} from './account-tasks.types';
import { CloudTaskOptions } from './cloud-tasks.types';

// @TODO use these directly in teh three schedule functions
export enum EmailTypes {
  INACTIVE_DELETE_FIRST_NOTIFICATION = 'inactiveDeleteFirstNotification',
  INACTIVE_DELETE_SECOND_NOTIFICATION = 'inactiveDeleteSecondNotification',
  INACTIVE_DELETE_FINAL_NOTIFICATION = 'inactiveDeleteFinalNotification',
}
export type CloudTaskEmailType = (typeof EmailTypes)[keyof typeof EmailTypes];

const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

export class InactiveAccountEmailTasks extends CloudTasks {
  constructor(
    protected override config: InactiveAccountEmailCloudTaskConfig,
    protected cloudTaskClient: Pick<CloudTasksClient, 'createTask' | 'getTask'>,
    protected statsd: Pick<StatsD, 'increment'>
  ) {
    super(config, cloudTaskClient);
  }

  public async scheduleFirstEmail(task: {
    payload: InactiveAccountEmailTaskPayloadParam;
    emailOptions?: { deliveryTime: number };
    taskOptions?: CloudTaskOptions;
  }) {
    return this.scheduleEmail({
      ...task,
      payload: {
        ...task.payload,
        emailType: EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION,
      },
      queueName:
        this.config.cloudTasks.inactiveAccountEmails.firstEmailQueueName,
    });
  }

  public async scheduleSecondEmail(task: {
    payload: InactiveAccountEmailTaskPayloadParam;
    emailOptions?: { deliveryTime: number };
    taskOptions?: CloudTaskOptions;
  }) {
    return this.scheduleEmail({
      ...task,
      payload: {
        ...task.payload,
        emailType: EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION,
      },
      queueName:
        this.config.cloudTasks.inactiveAccountEmails.secondEmailQueueName,
      emailOptions: task.emailOptions ?? {
        deliveryTime:
          Date.now() +
          this.config.cloudTasks.inactiveAccountEmails
            .firstToSecondEmailIntervalMs,
      },
    });
  }

  public async scheduleFinalEmail(task: {
    payload: InactiveAccountEmailTaskPayloadParam;
    emailOptions?: { deliveryTime: number };
    taskOptions?: CloudTaskOptions;
  }) {
    return this.scheduleEmail({
      ...task,
      payload: {
        ...task.payload,
        emailType: EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION,
      },
      queueName:
        this.config.cloudTasks.inactiveAccountEmails.thirdEmailQueueName,
      emailOptions: task.emailOptions ?? {
        deliveryTime:
          Date.now() +
          this.config.cloudTasks.inactiveAccountEmails
            .secondToThirdEmailIntervalMs,
      },
    });
  }

  /**
   * Enqueues a Google cloud task to send an email about an inactive account
   * that will be deleted.
   *
   * @returns A taskName
   */
  private async scheduleEmail(opts: {
    queueName: string;
    payload: SendEmailTaskPayload;
    emailOptions?: { deliveryTime: number };
    taskOptions?: CloudTaskOptions;
  }) {
    // schedule time is when the task is dispatched and there's a limit of
    // 30 days.  delivery time is when we want to send the email by
    // handling the task.
    const now = Date.now();
    const inThirtyDays = now + thirtyDaysInMs;
    const deliveryTime = opts.emailOptions?.deliveryTime || now;
    const scheduleTime = Math.min(deliveryTime, inThirtyDays);

    const taskHeaders: FxACloudTaskHeaders = {
      'fxa-cloud-task-delivery-time': deliveryTime.toString(),
    };

    const taskOptions: CloudTaskOptions = {
      ...opts.taskOptions,
      scheduleTime: {
        seconds: scheduleTime / 1000,
      },
    };

    try {
      const result = await this.enqueueTask(
        {
          queueName: opts.queueName,
          taskUrl: this.config.cloudTasks.inactiveAccountEmails.taskUrl,
          taskPayload: opts.payload,
          taskHeaders,
        },
        taskOptions
      );
      const taskName = result[0].name;

      this.statsd.increment(
        'cloud-tasks.inactive-account-email.enqueue.success',
        [opts.payload.emailType]
      );
      return taskName;
    } catch (err) {
      this.statsd.increment(
        'cloud-tasks.inactive-account-email.enqueue.failure',
        [opts.payload.emailType]
      );
      throw err;
    }
  }
}
