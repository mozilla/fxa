/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CloudTasksClient } from '@google-cloud/tasks';
import { CloudTaskOptions, CloudTasksConfig } from './cloud-tasks.types';

/** Base class for encapsulating common cloud task operations */
export class CloudTasks {
  protected constructor(
    protected readonly config: CloudTasksConfig,
    protected readonly client: Pick<CloudTasksClient, 'createTask' | 'getTask'>
  ) {}

  /** Returns the fully qualified path for the queue */
  protected getQueuePath(queueName: string) {
    return `projects/${this.config.cloudTasks.projectId}/locations/${this.config.cloudTasks.locationId}/queues/${queueName}`;
  }

  /**
   * Enqueues a task
   * @param opts - Options object with `taskPayload`, `taskUrl`, and `queueName`.
   * @param taskOptions - an optional CloudTaskOptions object
   * @returns The resulting task
   */
  protected async enqueueTask(
    opts: {
      taskPayload: unknown;
      taskUrl: string;
      queueName: string;
    },
    taskOptions?: CloudTaskOptions
  ) {
    const parent = this.getQueuePath(opts.queueName);
    const payload = {
      parent,
      task: {
        ...(taskOptions?.taskId && {
          name: `${parent}/tasks/${taskOptions.taskId}`,
        }),
        ...(taskOptions?.scheduleTime && {
          scheduleTime: taskOptions.scheduleTime,
        }),
        httpRequest: {
          url: opts.taskUrl,
          httpMethod: 1, // HttpMethod.POST
          headers: { 'Content-Type': 'application/json' },
          body: Buffer.from(JSON.stringify(opts.taskPayload)).toString(
            'base64'
          ),
          oidcToken: {
            audience: this.config.cloudTasks.oidc.aud,
            serviceAccountEmail:
              this.config.cloudTasks.oidc.serviceAccountEmail,
          },
        },
      },
    };

    const result = await this.client.createTask(payload);
    return result;
  }

  /**
   * Looks up the status for a task
   * @param taskName
   */
  public async getTaskStatus(taskName: string) {
    return await this.client.getTask({
      name: taskName,
    });
  }
}
