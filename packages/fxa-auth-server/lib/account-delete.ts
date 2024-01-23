/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CloudTasksClient } from '@google-cloud/tasks';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';
import DB from './db/index';
import OAuthDb from './oauth/db';
import { AppleIAP } from './payments/iap/apple-app-store/apple-iap';
import { PlayBilling } from './payments/iap/google-play/play-billing';
import { PayPalHelper } from './payments/paypal/helper';
import { StripeHelper } from './payments/stripe';
import pushboxApi from './pushbox';
import { accountDeleteCloudTaskPath } from './routes/cloud-tasks';
import { AccountDeleteReasons, AppConfig, AuthLogger } from './types';

import {
  deleteAllPayPalBAs,
  getAllPayPalBAByUid,
} from 'fxa-shared/db/models/auth';
import { ConfigType } from '../config';
import * as Sentry from '@sentry/node';

type FxaDbDeleteAccount = Pick<
  Awaited<ReturnType<ReturnType<typeof DB>['connect']>>,
  'deleteAccount' | 'accountRecord' | 'account'
>;
type OAuthDbDeleteAccount = Pick<typeof OAuthDb, 'removeTokensAndCodes'>;
type PushboxDeleteAccount = Pick<
  ReturnType<typeof pushboxApi>,
  'deleteAccount'
>;

export type ReasonForDeletion = (typeof AccountDeleteReasons)[number];
export type AccountDeleteOptions = { notify?: () => Promise<void> };

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

const isEnqueueByUidParam = (
  x: EnqueueByUidParam | EnqueueByEmailParam
): x is EnqueueByUidParam => (x as EnqueueByUidParam).uid !== undefined;
const isEnqueueByEmailParam = (
  x: EnqueueByUidParam | EnqueueByEmailParam
): x is EnqueueByEmailParam => (x as EnqueueByEmailParam).email !== undefined;

export class AccountDeleteManager {
  private fxaDb: FxaDbDeleteAccount;
  private oauthDb: OAuthDbDeleteAccount;
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
    config,
    pushbox,
    statsd,
  }: {
    fxaDb: FxaDbDeleteAccount;
    oauthDb: OAuthDbDeleteAccount;
    config: ConfigType;
    pushbox: PushboxDeleteAccount;
    statsd: StatsD;
  }) {
    this.fxaDb = fxaDb;
    this.oauthDb = oauthDb;
    this.config = config;
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

  /**
   * Delete the account from the FxA database, OAuth database, pushbox database, and
   * cancel any active subscriptions.
   *
   * @param accountRecord Account
   * @param options AccountDeleteOptions optional object with an optional `notify` function that will be called after the account's removed from MySQL.
   */
  public async deleteAccount(uid: string, options?: AccountDeleteOptions) {
    await this.deleteAccountFromDb(uid, options);
    await this.deleteOAuthTokens(uid);
    // see comment in the function on why we are not awaiting
    this.deletePushboxRecords(uid);

    await this.deleteSubscriptions(uid);
    await this.deleteFirestoreCustomer(uid);
  }

  public async cleanupAccount(uid: string) {
    await this.deleteSubscriptions(uid);
    await this.deleteFirestoreCustomer(uid);
    await this.deleteOAuthTokens(uid);
  }

  /**
   * Delete the account from the FxA database.
   *
   * @param accountRecord
   */
  public async deleteAccountFromDb(
    uid: string,
    options?: AccountDeleteOptions
  ) {
    await this.fxaDb.deleteAccount({ uid });
    if (options?.notify) {
      await options.notify();
    }
  }

  /**
   * Delete the account from the OAuth database. This will remove all tokens and
   * codes associated with the account.
   *
   * @param accountRecord
   */
  public async deleteOAuthTokens(uid: string) {
    await this.oauthDb.removeTokensAndCodes(uid);
  }

  /**
   * Delete the account from the pushbox database.
   *
   * @param accountRecord
   */
  public async deletePushboxRecords(uid: string) {
    // No need to await and block the other notifications. The pushbox records
    // will be deleted once they expire even if they were not successfully
    // deleted here.
    this.pushbox.deleteAccount(uid).catch((err: Error) => {
      Sentry.withScope((scope) => {
        scope.setContext('pushboxDeleteAccount', { uid });
        Sentry.captureException(err);
      });
    });
  }

  /**
   * Delete the account's subscriptions from Stripe and PayPal.
   * This will cancel any active subscriptions and remove the customer.
   *
   * @param accountRecord
   */
  public async deleteSubscriptions(uid: string) {
    if (this.config.subscriptions?.enabled && this.stripeHelper) {
      try {
        await this.stripeHelper.removeCustomer(uid);
      } catch (err) {
        if (err.message === 'Customer not available') {
          // if Stripe didn't know about the customer, no problem.
          // This should not stop the user from deleting their account.
          // See https://github.com/mozilla/fxa/issues/2900
          // https://github.com/mozilla/fxa/issues/2896
        } else {
          throw err;
        }
      }
      if (this.paypalHelper) {
        const agreementIds = await getAllPayPalBAByUid(uid);
        // Only cancelled and expired are terminal states, any others
        // should be canceled to ensure they can't be used again.
        const activeIds = agreementIds.filter((ba: any) =>
          ['active', 'pending', 'suspended'].includes(ba.status.toLowerCase())
        );
        await Promise.all(
          activeIds.map((ba) =>
            (this.paypalHelper as PayPalHelper).cancelBillingAgreement(
              ba.billingAgreementId
            )
          )
        );
        await deleteAllPayPalBAs(uid);
      }
    }
  }

  async deleteFirestoreCustomer(uid: string) {
    this.log.debug('AccountDeleteManager.deleteFirestoreCustomer', { uid });
    try {
      return await this.stripeHelper?.removeFirestoreCustomer(uid);
    } catch (error) {
      this.log.error('AccountDeleteManager.deleteFirestoreCustomer', {
        uid,
        error,
      });
      throw error;
    }
  }
}
