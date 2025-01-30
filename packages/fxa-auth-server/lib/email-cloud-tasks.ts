/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';

import {
  EmailTypes,
  SendEmailTaskPayload,
  InactiveAccountEmailTasks,
  InactiveAccountEmailTasksFactory,
} from '@fxa/shared/cloud-tasks';

import { ConfigType } from '../config';
import { AuthRequest } from './types';
import { IncomingHttpHeaders } from 'http';
import AppError from './error';
import {
  InactiveAccountsManager,
  emailTypeToHandlerVals,
} from './inactive-accounts';
import { DB } from './db';
import { ConnectedServicesDb } from 'fxa-shared/connected-services';
import { GleanMetricsType } from './metrics/glean';
import { Logger } from 'mozlog';

const fxaCloudTaskDeliveryTimeHeaderName = 'fxa-cloud-task-delivery-time';

// If the task has the optional delivery time, and it's in the future, we
// reschedule the task.
const mustReschedule = (headers: IncomingHttpHeaders) =>
  headers[fxaCloudTaskDeliveryTimeHeaderName] &&
  Date.now() < parseInt(headers[fxaCloudTaskDeliveryTimeHeaderName] as string);

// The task id needs to be unique.  We'll create a new one if there was one so
// there won't a conflict.
const maybeNewTaskId = (request: AuthRequest) => {
  if (
    request.raw.req.headers['x-cloudtasks-taskname'] &&
    (request.raw.req.headers['x-cloudtasks-taskname'] as string).startsWith(
      (request.payload as SendEmailTaskPayload).uid
    )
  ) {
    if (
      request.raw.req.headers['x-cloudtasks-taskname'].includes('reschedule')
    ) {
      const parts = (
        request.raw.req.headers['x-cloudtasks-taskname'] as string
      ).split('-');
      let prevVer = parseInt(parts.pop() as string);
      return `${parts.join('-')}-${++prevVer}`;
    }

    return `${request.raw.req.headers['x-cloudtasks-taskname']}-reschedule-1`;
  }

  return;
};

export class EmailCloudTaskManager {
  private config: ConfigType;
  private statsd: StatsD;
  private emailCloudTasks: InactiveAccountEmailTasks;
  private inactiveAccountsManager: InactiveAccountsManager;

  constructor({
    config,
    statsd,
    mailer,
    fxaDb,
    oauthDb,
    glean,
    log,
  }: {
    config: ConfigType;
    statsd: StatsD;
    mailer: any;
    fxaDb: DB;
    oauthDb: ConnectedServicesDb;
    glean: GleanMetricsType;
    log: Logger;
  }) {
    this.config = config;
    this.statsd = statsd;

    this.emailCloudTasks = InactiveAccountEmailTasksFactory(config, statsd);
    this.inactiveAccountsManager = new InactiveAccountsManager({
      fxaDb,
      oauthDb,
      mailer,
      config,
      statsd,
      glean,
      log,
    });
  }

  async handleInactiveAccountNotification(request: AuthRequest) {
    // in the request handler, request.headers only contains the very first
    // 'x-' header, not sure why, so we need to use request.raw.req.headers
    // instead
    if (mustReschedule(request.raw.req.headers)) {
      const maybeUpdateTaskId = maybeNewTaskId(request);

      const emailTypeSpecificVals =
        emailTypeToHandlerVals[
          (request.payload as SendEmailTaskPayload).emailType
        ];
      await this.emailCloudTasks[emailTypeSpecificVals.taskScheduler]({
        payload: request.payload as SendEmailTaskPayload,
        emailOptions: {
          deliveryTime: parseInt(
            request.raw.req.headers[
              fxaCloudTaskDeliveryTimeHeaderName
            ] as string
          ),
        },
        taskOptions: {
          ...(maybeUpdateTaskId ? { taskId: maybeUpdateTaskId } : {}),
        },
      });

      this.statsd.increment('cloud-tasks.send-email.rescheduled', {
        email_type: (request.payload as SendEmailTaskPayload).emailType,
      });

      return;
    }

    switch ((request.payload as SendEmailTaskPayload).emailType) {
      case EmailTypes.INACTIVE_DELETE_FIRST_NOTIFICATION:
      case EmailTypes.INACTIVE_DELETE_SECOND_NOTIFICATION:
      case EmailTypes.INACTIVE_DELETE_FINAL_NOTIFICATION:
        await this.inactiveAccountsManager.handleNotificationTask(
          request.payload as SendEmailTaskPayload
        );
        break;
      default:
        // the payload is validated before it reaches the handler, so in the
        // normal course of handling a cloud task, this should not happen.  but
        // this code can also be called from outside of the request handler.
        throw AppError.invalidCloudTaskEmailType();
    }
  }
}
