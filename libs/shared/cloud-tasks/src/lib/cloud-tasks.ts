/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { CloudTasksClient } from '@google-cloud/tasks';
import { CloudTasksConfig } from './cloud-tasks.types';

/** Base class for encapsulating common cloud task operations */
export class CloudTasks {
  /**
   * Indicates if a queue has been configured and is enabled.
   */
  public get queueEnabled() {
    // If a keyFilename was supplied, the cloud task queue can be considered enabled.
    if (this.config.cloudTasks.credentials.keyFilename) {
      return true;
    }

    // If we specify a local emulator is being used, then no keyFilename is required,
    // and the task queue can be considered enabled.
    if (this.config.cloudTasks.useLocalEmulator) {
      return true;
    }

    return false;
  }

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
   * @param queueName - Name of queue to add task to
   * @param taskUrl - The URL that handles task processing
   * @param task - The task payload. Public implementation should provide structure for this type!
   * @returns The resulting task
   */
  protected async enqueueTask(opts: {
    task: unknown;
    taskUrl: string;
    queueName: string;
  }) {
    const payload = {
      parent: this.getQueuePath(opts.queueName),
      task: {
        httpRequest: {
          url: opts.taskUrl,
          httpMethod: 1, // HttpMethod.POST
          headers: { 'Content-Type': 'application/json' },
          body: Buffer.from(JSON.stringify(opts.task)).toString('base64'),
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
