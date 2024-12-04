/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { protos } from '@google-cloud/tasks';

/** Represents the config needed for running cloud tasks */
export type CloudTasksConfig = {
  cloudTasks: {
    useLocalEmulator: boolean;
    projectId: string;
    locationId: string;
    credentials: {
      keyFilename: string;
    };
    oidc: {
      aud: string;
      serviceAccountEmail: string;
    };
  };
};

export type CloudTaskOptions = Partial<
  {
    // See TASK_ID for the `name` field in https://cloud.google.com/tasks/docs/reference/rest/v2/projects.locations.queues.tasks#Task
    taskId: string;
  } & Pick<protos.google.cloud.tasks.v2.ITask, 'scheduleTime'>
>;
