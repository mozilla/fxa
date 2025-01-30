/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import isA from 'joi';
import { Container } from 'typedi';
import { StatsD } from 'hot-shots';

import { ConfigType } from '../../config';
import DESCRIPTION from '../../docs/swagger/shared/descriptions';
import { AccountDeleteManager } from '../account-delete';
import { AuthLogger, AuthRequest } from '../types';
import validators from './validators';

import { DeleteAccountTask, EmailTypes } from '@fxa/shared/cloud-tasks';
import { EmailCloudTaskManager } from '../email-cloud-tasks';

/** Work around for path module resolution in validator.js which is still using cjs. */
export { ReasonForDeletion } from '@fxa/shared/cloud-tasks';

export class CloudTaskHandler {
  private accountDeleteManager: AccountDeleteManager;
  private emailCloudTaskManager: EmailCloudTaskManager;

  constructor(private log: AuthLogger, config: ConfigType, statsd: StatsD) {
    this.accountDeleteManager = Container.get(AccountDeleteManager);
    this.emailCloudTaskManager = Container.get(EmailCloudTaskManager);
  }

  async deleteAccount(taskPayload: DeleteAccountTask) {
    this.log.debug('Received delete account task', taskPayload);
    await this.accountDeleteManager.deleteAccount(
      taskPayload.uid,
      taskPayload.reason,
      taskPayload.customerId
    );
    return {};
  }

  async sendInactiveAccountNotification(request: AuthRequest) {
    this.log.debug('Received inactive account notification task', request);
    await this.emailCloudTaskManager.handleInactiveAccountNotification(request);
    return {};
  }
}

export const accountDeleteCloudTaskPath = '/cloud-tasks/accounts/delete';
export const inactiveNotificationsCloudTaskPath =
  '/cloud-tasks/emails/notify-inactive';

export const cloudTaskRoutes = (
  log: AuthLogger,
  config: ConfigType,
  statsd: StatsD
) => {
  const cloudTaskHandler = new CloudTaskHandler(log, config, statsd);
  const routes = [
    {
      method: 'POST',
      path: accountDeleteCloudTaskPath,
      options: {
        auth: {
          mode: config.cloudTasks.useLocalEmulator ? 'try' : 'required',
          payload: false,
          strategy: 'cloudTasksOIDC',
        },
        validate: {
          headers: isA.object({
            'x-cloudtasks-queuename': isA
              .string()
              .equal(config.cloudTasks.deleteAccounts.queueName),
          }),
          payload: isA.object({
            uid: validators.uid.required().description(DESCRIPTION.uid),
            customerId: isA
              .string()
              .optional()
              .description(DESCRIPTION.customerId),
            reason: validators.reasonForAccountDeletion,
          }),
        },
      },
      handler: (request: AuthRequest) =>
        cloudTaskHandler.deleteAccount(request.payload as DeleteAccountTask),
    },

    {
      method: 'POST',
      path: inactiveNotificationsCloudTaskPath,
      options: {
        auth: {
          mode: config.cloudTasks.useLocalEmulator ? 'try' : 'required',
          payload: false,
          strategy: 'cloudTasksOIDC',
        },
        validate: {
          headers: isA.object({
            'x-cloudtasks-queuename': isA
              .string()
              .valid(
                config.cloudTasks.inactiveAccountEmails.firstEmailQueueName,
                config.cloudTasks.inactiveAccountEmails.secondEmailQueueName,
                config.cloudTasks.inactiveAccountEmails.thirdEmailQueueName
              ),
          }),
          payload: isA.object({
            uid: validators.uid.required().description(DESCRIPTION.uid),
            emailType: isA
              .string()
              .valid(...Object.values(EmailTypes))
              .description(DESCRIPTION.cloudTaskEmailType),
          }),
        },
      },
      handler: (request: AuthRequest) =>
        cloudTaskHandler.sendInactiveAccountNotification(request),
    },
  ];

  return routes;
};

export default cloudTaskRoutes;
