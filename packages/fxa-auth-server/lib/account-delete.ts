/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  deleteAllPayPalBAs,
  getAccountCustomerByUid,
  getAllPayPalBAByUid,
} from 'fxa-shared/db/models/auth';
import { StatsD } from 'hot-shots';
import { Container } from 'typedi';

import { CloudTasksClient } from '@google-cloud/tasks';
import * as Sentry from '@sentry/node';

import { ConfigType } from '../config';
import DB from './db/index';
import { ERRNO } from './error';
import OAuthDb from './oauth/db';
import { AppleIAP } from './payments/iap/apple-app-store/apple-iap';
import { PlayBilling } from './payments/iap/google-play/play-billing';
import { PayPalHelper } from './payments/paypal/helper';
import { StripeHelper } from './payments/stripe';
import { StripeFirestoreMultiError } from './payments/stripe-firestore';
import pushBuilder from './push';
import pushboxApi from './pushbox';
import { accountDeleteCloudTaskPath } from './routes/cloud-tasks';
import { AppConfig, AuthLogger, AuthRequest } from './types';

type FxaDbDeleteAccount = Pick<
  Awaited<ReturnType<ReturnType<typeof DB>['connect']>>,
  'deleteAccount' | 'accountRecord' | 'account' | 'devices'
>;
type OAuthDbDeleteAccount = Pick<typeof OAuthDb, 'removeTokensAndCodes'>;
type PushboxDeleteAccount = Pick<
  ReturnType<typeof pushboxApi>,
  'deleteAccount'
>;
type PushForDeleteAccount = Pick<
  ReturnType<typeof pushBuilder>,
  'notifyAccountDestroyed'
>;
type Log = AuthLogger & { activityEvent: (data: Record<string, any>) => void };

export const ReasonForDeletionOptions = {
  UserRequested: 'fxa_user_requested_account_delete',
  Unverified: 'fxa_unverified_account_delete',
  Cleanup: 'fxa_cleanup_account_delete',
} as const;
export type ReasonForDeletion =
  (typeof ReasonForDeletionOptions)[keyof typeof ReasonForDeletionOptions];
export const ReasonForDeletionValues = Object.values(ReasonForDeletionOptions);

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
  private push: PushForDeleteAccount;
  private pushbox: PushboxDeleteAccount;
  private statsd: StatsD;
  private stripeHelper?: StripeHelper;
  private paypalHelper?: PayPalHelper;
  private appleIap?: AppleIAP;
  private playBilling?: PlayBilling;
  private log: Log;
  private config: ConfigType;
  private tasksEnabled = false;
  private tasksRequired = false;

  private cloudTasksClient: CloudTasksClient;
  private queueName;
  private taskUrl;

  constructor({
    fxaDb,
    oauthDb,
    config,
    push,
    pushbox,
    statsd,
  }: {
    fxaDb: FxaDbDeleteAccount;
    oauthDb: OAuthDbDeleteAccount;
    config: ConfigType;
    push: PushForDeleteAccount;
    pushbox: PushboxDeleteAccount;
    statsd: StatsD;
  }) {
    this.fxaDb = fxaDb;
    this.oauthDb = oauthDb;
    this.config = config;
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
    this.log = Container.get(AuthLogger) as Log;
    this.config = Container.get(AppConfig);
    const tasksConfig = this.config.cloudTasks;

    this.cloudTasksClient = new CloudTasksClient({
      projectId: tasksConfig.projectId,
      keyFilename: tasksConfig.credentials.keyFilename ?? undefined,
    });
    this.queueName = `projects/${tasksConfig.projectId}/locations/${tasksConfig.locationId}/queues/${tasksConfig.deleteAccounts.queueName}`;
    this.taskUrl = `${this.config.publicUrl}/v${this.config.apiVersion}${accountDeleteCloudTaskPath}`;
    this.tasksEnabled = !!tasksConfig.credentials.keyFilename;
    this.tasksRequired = ['stage', 'prod'].includes(this.config.env);
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
    const { stripeCustomerId } =
      (await getAccountCustomerByUid(options.uid)) || {};
    const task: DeleteTask = {
      uid: options.uid,
      customerId: stripeCustomerId,
      reason: options.reason,
    };
    return this.enqueueTask(task);
  }

  private async enqueueByEmail(options: EnqueueByEmailParam) {
    const account = await this.fxaDb.accountRecord(options.email);
    const { stripeCustomerId } =
      (await getAccountCustomerByUid(account.uid)) || {};
    const task: DeleteTask = {
      uid: account.uid,
      customerId: stripeCustomerId,
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
   * @param uid User id
   * @param reason Enum describing the reason for the deletion.
   * @param customerId Stripe customer id if the user had/has a subscription.
   */
  public async deleteAccount(
    uid: string,
    reason: ReasonForDeletion,
    customerId?: string
  ) {
    const existsInDatabase = await this.deleteAccountFromDb(uid);
    await this.deleteOAuthTokens(uid);
    // see comment in the function on why we are not awaiting
    this.deletePushboxRecords(uid);

    await this.deleteSubscriptions(uid, reason, customerId);
    await this.deleteFirestoreCustomer(uid);
    await this.appleIap?.purchaseManager.deletePurchases(uid);
    await this.playBilling?.purchaseManager.deletePurchases(uid);

    // This is to avoid logging the same event twice if the account was already
    // deleted from the db.
    if (existsInDatabase) {
      this.log.activityEvent({ uid, event: 'account.deleted' });
    }
  }

  /**
   * Delete the account from the FxA database, OAuth database, and pushbox database.
   * This method is intended to be used when the user is waiting to be deleted from
   * the system so it only clears up the immediate database records and logs out the
   * user. The rest of the cleanup is handled later after queuing the account for
   * deletion.
   */
  public async quickDelete(uid: string, reason: ReasonForDeletion) {
    if (reason !== ReasonForDeletionOptions.UserRequested) {
      throw new Error('quickDelete only supports user requested deletions');
    }

    try {
      await this.deleteAccountFromDb(uid);
      await this.deleteOAuthTokens(uid);
    } catch (error) {
      // If the account wasn't fully deleted, we should log the error and
      // still queue the account for cleanup.
      this.log.error('quickDelete', { uid, error });
    }
    // Only queue if enabled or is in stage/prod.
    if (this.tasksEnabled || this.tasksRequired) {
      await this.enqueueByUid({ uid, reason });
    }
  }

  /**
   * Delete the account from the FxA database and notify devices and attached
   * services about the account deletion.
   */
  private async deleteAccountFromDb(uid: string) {
    // We fetch the devices to notify before attempting delete
    // because obviously we can't retrieve the devices list after!
    try {
      // Check to see if we have an account, this throws if it was deleted
      await this.fxaDb.account(uid);
      const devices = await this.fxaDb.devices(uid);

      await this.fxaDb.deleteAccount({ uid });
      try {
        await this.push.notifyAccountDestroyed(uid, devices);
        await this.log.notifyAttachedServices('delete', {} as AuthRequest, {
          uid,
        });
      } catch (error) {
        this.log.error('accountDeleteManager.notify', {
          uid,
          error,
        });
      }
    } catch (error) {
      if (error.errno === ERRNO.ACCOUNT_UNKNOWN) {
        // Proceed if the account is already deleted from the db.
        return false;
      }
      throw error;
    }
    return true;
  }

  /**
   * Delete the account from the OAuth database. This will remove all tokens and
   * codes associated with the account.
   */
  private async deleteOAuthTokens(uid: string) {
    await this.oauthDb.removeTokensAndCodes(uid);
  }

  /**
   * Delete the account from the pushbox database.
   */
  private deletePushboxRecords(uid: string) {
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

  private async refundSubscriptions(
    deleteReason: ReasonForDeletion,
    customerId?: string,
    refundPeriod?: number
  ) {
    if (!this.stripeHelper || !this.paypalHelper) {
      return;
    }

    this.log.debug('AccountDeleteManager.refundSubscriptions.start', {
      customerId,
    });

    // Currently only support auto refund of invoices for unverified accounts
    if (deleteReason !== ReasonForDeletionOptions.Unverified || !customerId) {
      return;
    }

    const createdDate = refundPeriod
      ? new Date(new Date().setDate(new Date().getDate() - refundPeriod))
      : undefined;
    const invoices =
      await this.stripeHelper.fetchInvoicesForActiveSubscriptions(
        customerId,
        'paid',
        createdDate
      );
    if (!invoices.length) return;
    this.log.debug('AccountDeleteManager.refundSubscriptions', {
      customerId,
      invoicesToRefund: invoices.length,
    });

    // Attempt Stripe and PayPal refunds
    const results = await Promise.allSettled([
      this.stripeHelper.refundInvoices(invoices),
      this.paypalHelper.refundInvoices(invoices),
    ]);
    results.forEach((result) => {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    });
  }

  /**
   * Delete the account's subscriptions from Stripe and PayPal.
   * This will cancel any active subscriptions and remove the customer.
   *
   * @param refundPeriod -- @@TODO temporary default to 30. Remove if not necessary
   */
  private async deleteSubscriptions(
    uid: string,
    deleteReason: ReasonForDeletion,
    customerId?: string,
    refundPeriod?: number
  ) {
    if (
      !this.config.subscriptions?.enabled ||
      !this.stripeHelper ||
      !this.paypalHelper
    ) {
      return;
    }
    try {
      // Before removing the Stripe Customer, refund the subscriptions if necessary
      await this.refundSubscriptions(deleteReason, customerId, refundPeriod);
      await this.stripeHelper.removeCustomer(uid, {
        cancellation_reason: deleteReason,
      });
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

  private async deleteFirestoreCustomer(uid: string) {
    this.log.debug('AccountDeleteManager.deleteFirestoreCustomer', { uid });
    try {
      return await this.stripeHelper?.removeFirestoreCustomer(uid);
    } catch (error) {
      // check for an instance of an error where the firestore service version
      // does not support `BatchWrite`
      if (error instanceof StripeFirestoreMultiError) {
        const originalError = error.getPrimaryError().cause();
        if (
          originalError?.stack?.includes(
            'UNIMPLEMENTED: Method google.firestore.v1.Firestore/BatchWrite is unimplemented'
          )
        ) {
          return;
        }
      }
      this.log.error('AccountDeleteManager.deleteFirestoreCustomer', {
        uid,
        error:
          error instanceof StripeFirestoreMultiError
            ? error.getSummary()
            : String(error),
      });
      throw error;
    }
  }
}
