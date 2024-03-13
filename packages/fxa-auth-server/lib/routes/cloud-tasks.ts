/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import isA from 'joi';
import { Container } from 'typedi';

import { ConfigType } from '../../config';
import DESCRIPTION from '../../docs/swagger/shared/descriptions';
import {
  AccountDeleteManager,
  ReasonForDeletion,
  ReasonForDeletionValues,
} from '../account-delete';
import { AuthLogger, AuthRequest } from '../types';
import validators from './validators';

export type DeleteAccountTaskPayload = {
  uid: string;
  customerId?: string;
  reason: ReasonForDeletion;
};

export class CloudTaskHandler {
  private accountDeleteManager: AccountDeleteManager;

  constructor(private log: AuthLogger) {
    this.accountDeleteManager = Container.get(AccountDeleteManager);
  }

  async deleteAccount(taskPayload: DeleteAccountTaskPayload) {
    this.log.debug('Received delete account task', taskPayload);
    await this.accountDeleteManager.deleteAccount(
      taskPayload.uid,
      taskPayload.reason,
      taskPayload.customerId
    );
    return {};
  }
}
export const accountDeleteCloudTaskPath = '/cloud-tasks/accounts/delete';

export const cloudTaskRoutes = (log: AuthLogger, config: ConfigType) => {
  const cloudTaskHandler = new CloudTaskHandler(log);
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
            reason: isA.string().valid(...ReasonForDeletionValues),
          }),
        },
      },
      handler: (request: AuthRequest) =>
        cloudTaskHandler.deleteAccount(
          request.payload as DeleteAccountTaskPayload
        ),
    },
  ];

  return routes;
};

export default cloudTaskRoutes;
