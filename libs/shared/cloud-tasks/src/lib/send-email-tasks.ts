/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';
import { CloudTasks } from './cloud-tasks';
import { CloudTasksClient } from '@google-cloud/tasks';
import {
  SendEmailCloudTaskConfig,
  SendEmailTaskPayload,
} from './account-tasks.types';
import { CloudTaskOptions } from './cloud-tasks.types';

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
  public async sendEmail(
    sendEmailTask: SendEmailTaskPayload,
    taskOptions?: CloudTaskOptions
  ) {
    try {
      const result = await this.enqueueTask(
        {
          queueName: this.config.cloudTasks.sendEmails.queueName,
          taskUrl: this.config.cloudTasks.sendEmails.taskUrl,
          taskPayload: sendEmailTask,
        },
        taskOptions
      );
      const taskName = result[0].name;

      this.statsd.increment('cloud-tasks.send-email.enqueue.success', [
        sendEmailTask.emailType,
      ]);
      return taskName;
    } catch (err) {
      this.statsd.increment('cloud-tasks.send-email.enqueue.failure', [
        sendEmailTask.emailType,
      ]);
      throw err;
    }
  }
}
