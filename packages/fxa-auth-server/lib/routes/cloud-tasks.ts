/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import isA from 'joi';
import { ConfigType } from '../../config';
import DESCRIPTION from '../../docs/swagger/shared/descriptions';
import { ReasonForDeletion } from '../account-delete';
import { AuthRequest } from '../types';
import validators from './validators';

export type DeleteAccountTaskPayload = {
  uid: string;
  customerId?: string;
  reason: ReasonForDeletion;
};

export class CloudTaskHandler {
  private config: ConfigType;

  constructor(config: ConfigType) {
    this.config = config;
  }

  deleteAccount(taskPayload: DeleteAccountTaskPayload) {
    return {};
  }
}
export const accountDeleteCloudTaskPath = '/cloud-tasks/accounts/delete';

export const cloudTaskRoutes = (config: ConfigType) => {
  const cloudTaskHandler = new CloudTaskHandler(config);
  const routes = [
    {
      method: 'POST',
      path: accountDeleteCloudTaskPath,
      options: {
        auth: {
          mode: 'required',
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
            reason: validators.accountDeleteReason,
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
