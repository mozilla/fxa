/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import isA from 'joi';
import { Container } from 'typedi';
import { ConfigType } from '../../config';
import DESCRIPTION from '../../docs/swagger/shared/descriptions';
import { AccountDeleteManager, ReasonForDeletion } from '../account-delete';
import DB from '../db/index';
import { AuthLogger, AuthRequest } from '../types';
import validators from './validators';
import { ERRNO } from '../error';
import pushBuilder from '../push';

export type DeleteAccountTaskPayload = {
  uid: string;
  customerId?: string;
  reason: ReasonForDeletion;
};
type FxaDbForCloudTask = Pick<
  Awaited<ReturnType<ReturnType<typeof DB>['connect']>>,
  'account' | 'devices'
>;
type PushForCloudTask = Pick<
  ReturnType<typeof pushBuilder>,
  'notifyAccountDestroyed'
>;
type Log = AuthLogger & { activityEvent: (data: Record<string, any>) => void };

export class CloudTaskHandler {
  private log: Log;
  private db: FxaDbForCloudTask;
  private push: PushForCloudTask;
  private accountDeleteManager: AccountDeleteManager;

  constructor({
    log,
    db,
    push,
  }: {
    log: Log;
    db: FxaDbForCloudTask;
    push: PushForCloudTask;
  }) {
    this.log = log;
    this.db = db;
    this.push = push;

    this.accountDeleteManager = Container.get(AccountDeleteManager);
  }

  async deleteAccount(taskPayload: DeleteAccountTaskPayload) {
    try {
      // get account from MySQL
      const account = await this.db.account(taskPayload.uid);

      // We fetch the devices to notify before deleteAccount()
      // because obviously we can't retrieve the devices list after!
      const devices = await this.db.devices(taskPayload.uid);
      const push = this.push;
      const log = this.log;

      const notify = async () => {
        try {
          log.info('accountDeleted.byCloudTask', account);
          await push.notifyAccountDestroyed(taskPayload.uid, devices);
          await log.notifyAttachedServices('delete', {} as AuthRequest, {
            uid: taskPayload.uid,
          });
          // because a cloud task request is very different from a user request
          // we cannot emit metrics in the same fashion
          if (!account.metricsOptOutAt) {
            log.activityEvent({ uid: account.uid, event: 'account.deleted' });
          }
        } catch (error) {
          log.error('CloudTask.accountDelete.notify', {
            uid: taskPayload.uid,
            error,
          });
        }
      };
      // the account still exists in MySQL, delete as usual
      await this.accountDeleteManager.deleteAccount(taskPayload.uid, {
        notify,
      });
    } catch (err) {
      // if the account is already deleted from the db, then try to clean up
      // some potentially remaining other records
      if (err.errno === ERRNO.ACCOUNT_UNKNOWN) {
        await this.accountDeleteManager.cleanupAccount(taskPayload.uid);
      } else {
        throw err;
      }
    }
    return {};
  }
}
export const accountDeleteCloudTaskPath = '/cloud-tasks/accounts/delete';

export const cloudTaskRoutes = (
  log: Log,
  db: FxaDbForCloudTask,
  config: ConfigType,
  push: PushForCloudTask
) => {
  const cloudTaskHandler = new CloudTaskHandler({ log, db, push });
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

export default cloudTaskRoutes;
