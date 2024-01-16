/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CloudTasksClient } from '@google-cloud/tasks';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';
import { ConfigType } from '../config';
import DB from './db/index';
import OAuthDb from './oauth/db';
import { AppleIAP } from './payments/iap/apple-app-store/apple-iap';
import { PlayBilling } from './payments/iap/google-play/play-billing';
import { PayPalHelper } from './payments/paypal/helper';
import { StripeHelper } from './payments/stripe';
import push from './push';
import pushboxApi from './pushbox';
import { accountDeleteCloudTaskPath } from './routes/cloud-tasks';
import { AppConfig, AuthLogger } from './types';
/*
import {
  uid as uidValidator,
  customerId as customerIdValidator,
} from './routes/validators';
//*/

export const AccountDeleteReasons = [
  'fxa_unverified_account_delete',
  'fxa_user_requested_account_delete',
] as const;

type FxaDbDeleteAccount = Pick<
  Awaited<ReturnType<ReturnType<typeof DB>['connect']>>,
  'deleteAccount' | 'accountRecord'
>;
type OAuthDbDeleteAccount = Pick<typeof OAuthDb, 'removeTokensAndCodes'>;
type PushDeleteAccount = Pick<
  ReturnType<typeof push>,
  'notifyAccountDestroyed'
>;
type PushboxDeleteAccount = Pick<
  ReturnType<typeof pushboxApi>,
  'deleteAccount'
>;

export type ReasonForDeletion = (typeof AccountDeleteReasons)[number];
type DeleteTask = {
  uid: string;
  customerId?: string;
  reason: ReasonForDeletion;
};
type EnqueueByUidParam = {
  uid: string;
  reason: ReasonForDeletion;
};
type EnqueueByEmailParam = {
  email: string;
  reason: ReasonForDeletion;
};

/*
const isValidDeleteTask = (deleteTask: DeleteTask) => {
  const uidValidationResult = uidValidator.validate(deleteTask.uid);
  const customerIdValidationResult = customerIdValidator.validate(
    deleteTask.customerId
  );

  return !uidValidationResult.error && !customerIdValidationResult.error;
};
//*/

const isEnqueueByUidParam = (
  x: EnqueueByUidParam | EnqueueByEmailParam
): x is EnqueueByUidParam => (x as EnqueueByUidParam).uid !== undefined;
const isEnqueueByEmailParam = (
  x: EnqueueByUidParam | EnqueueByEmailParam
): x is EnqueueByEmailParam => (x as EnqueueByEmailParam).email !== undefined;

export class AccountDeleteManager {
  private fxaDb: FxaDbDeleteAccount;
  private oauthDb: OAuthDbDeleteAccount;
  private push: PushDeleteAccount;
  private pushbox: PushboxDeleteAccount;
  private statsd: StatsD;
  private stripeHelper?: StripeHelper;
  private paypalHelper?: PayPalHelper;
  private appleIap?: AppleIAP;
  private playBilling?: PlayBilling;
  private log: AuthLogger;
  private config: ConfigType;
  private cloudTasksClient: CloudTasksClient;
  private queueName;
  private taskUrl;

  constructor({
    fxaDb,
    oauthDb,
    push,
    pushbox,
    statsd,
  }: {
    fxaDb: FxaDbDeleteAccount;
    oauthDb: OAuthDbDeleteAccount;
    push: PushDeleteAccount;
    pushbox: PushboxDeleteAccount;
    statsd: StatsD;
  }) {
    this.fxaDb = fxaDb;
    this.oauthDb = oauthDb;
    this.push = push;
    this.pushbox = pushbox;
    this.statsd = statsd;

    if (Container.has(StripeHelper)) {
      this.stripeHelper = Container.get(StripeHelper);
    }
    if (Container.has(PayPalHelper)) {
      this.paypalHelper = Container.get(PayPalHelper);
    }
    if (Container.has(AppleIAP)) {
      this.appleIap = Container.get(AppleIAP);
    }
    if (Container.has(PlayBilling)) {
      this.playBilling = Container.get(PlayBilling);
    }
    this.log = Container.get(AuthLogger);
    this.config = Container.get(AppConfig);
    const tasksConfig = this.config.cloudTasks;

    this.cloudTasksClient = new CloudTasksClient({
      projectId: tasksConfig.projectId,
      keyFilename: tasksConfig.credentials.keyFilename ?? undefined,
    });
    this.queueName = `projects/${tasksConfig.projectId}/locations/${tasksConfig.locationId}/queues/${tasksConfig.deleteAccounts.queueName}`;
    this.taskUrl = `${this.config.publicUrl}/v${this.config.apiVersion}${accountDeleteCloudTaskPath}`;
  }

  public async enqueue(options: EnqueueByUidParam | EnqueueByEmailParam) {
    if (isEnqueueByUidParam(options)) {
      return this.enqueueByUid(options);
    }

    if (isEnqueueByEmailParam(options)) {
      return this.enqueueByEmail(options);
    }

    throw new Error(
      `Failed to enqueue account delete cloud task with ${options}.`
    );
  }

  private async enqueueByUid(options: EnqueueByUidParam) {
    const customer = await this.stripeHelper?.fetchCustomer(options.uid);
    const task: DeleteTask = {
      uid: options.uid,
      customerId: customer?.id ?? undefined,
      reason: options.reason,
    };
    return this.enqueueTask(task);
  }

  private async enqueueByEmail(options: EnqueueByEmailParam) {
    const account = await this.fxaDb.accountRecord(options.email);
    const customer = await this.stripeHelper?.fetchCustomer(account.uid);
    const task: DeleteTask = {
      uid: account.uid,
      customerId: customer?.id ?? undefined,
      reason: options.reason,
    };
    return this.enqueueTask(task);
  }

  private async enqueueTask(task: DeleteTask) {
    try {
      const taskResult = await this.cloudTasksClient.createTask({
        parent: this.queueName,
        task: {
          httpRequest: {
            url: this.taskUrl,
            httpMethod: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.from(JSON.stringify(task)).toString('base64'),
            oidcToken: {
              audience: this.config.cloudTasks.oidc.aud,
              serviceAccountEmail:
                this.config.cloudTasks.oidc.serviceAccountEmail,
            },
          },
        },
      });
      this.statsd.increment('cloud-tasks.account-delete.enqueue.success');
      return taskResult[0].name;
    } catch (err) {
      this.statsd.increment('cloud-tasks.account-delete.enqueue.failure');
      throw err;
    }
  }

  async deleteFirestoreCustomer(uid: string) {
    this.log.debug('AccountDeleteManager.deleteFirestoreCustomer', { uid });
    const result = await this.stripeHelper?.removeFirestoreCustomer(uid);
    if (!result?.length) {
      this.log.error('AccountDeleteManager.deleteFirestoreCustomer', { uid });
    }
    return result;
  }
}
