/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  deleteAllPayPalBAs,
  getAllPayPalBAByUid,
} from 'fxa-shared/db/models/auth';
import { Container } from 'typedi';
import { Logger } from 'mozlog';
import { StatsD } from 'hot-shots';

import * as Sentry from '@sentry/node';

import { ConfigType } from '../config';
import { ERRNO } from './error';
import OAuthDb from './oauth/db';
import { AppleIAP } from './payments/iap/apple-app-store/apple-iap';
import { PlayBilling } from './payments/iap/google-play/play-billing';
import { PayPalHelper } from './payments/paypal/helper';
import { StripeHelper } from './payments/stripe';
import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';
import { StripeFirestoreMultiError } from './payments/stripe-firestore';
import pushBuilder from './push';
import pushboxApi from './pushbox';
import { AppConfig, AuthLogger, AuthRequest } from './types';
import { DB } from './db';
import { reportSentryError } from './sentry';
import { GleanMetricsType } from './metrics/glean';
import {
  InactiveAccountsManager,
  InactiveStatusOAuthDb,
  requestForGlean,
} from './inactive-accounts';

type OAuthDbDeleteAccount = Pick<typeof OAuthDb, 'removeTokensAndCodes'> &
  InactiveStatusOAuthDb;
type PushboxDeleteAccount = Pick<
  ReturnType<typeof pushboxApi>,
  'deleteAccount'
>;
type PushForDeleteAccount = Pick<
  ReturnType<typeof pushBuilder>,
  'notifyAccountDestroyed'
>;
type Log = AuthLogger & { activityEvent: (data: Record<string, any>) => void };

export class AccountDeleteManager {
  private fxaDb: DB;
  private oauthDb: OAuthDbDeleteAccount;
  private push: PushForDeleteAccount;
  private pushbox: PushboxDeleteAccount;
  private stripeHelper?: StripeHelper;
  private paypalHelper?: PayPalHelper;
  private appleIap?: AppleIAP;
  private playBilling?: PlayBilling;
  private log: Log;
  private config: ConfigType;
  private glean: GleanMetricsType;
  private statsd: StatsD;
  private inactiveAccountsManager: InactiveAccountsManager;

  constructor({
    fxaDb,
    oauthDb,
    config,
    push,
    pushbox,
    mailer,
    statsd,
    glean,
    log,
  }: {
    fxaDb: DB;
    oauthDb: OAuthDbDeleteAccount;
    config: ConfigType;
    push: PushForDeleteAccount;
    pushbox: PushboxDeleteAccount;
    mailer: any;
    statsd: StatsD;
    glean: GleanMetricsType;
    log: Logger;
  }) {
    this.fxaDb = fxaDb;
    this.oauthDb = oauthDb;
    this.config = config;
    this.push = push;
    this.pushbox = pushbox;
    this.glean = glean;
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

    // Is this intentional? Config is passed in the constructor
    this.config = Container.get(AppConfig);

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
    customerId?: string,
    request?: AuthRequest
  ) {
    // there's a day's time between shceduling and deletion so we need to check
    // if the account has became active in the meantime
    if (
      reason === ReasonForDeletion.InactiveAccountScheduled &&
      (await this.inactiveAccountsManager.isActive(uid))
    ) {
      this.glean.inactiveAccountDeletion.deletionSkipped(
        request ?? requestForGlean,
        {
          uid,
          reason: 'active_account',
        }
      );
      this.statsd.increment('account.inactive.deletion.skipped.active');
      return;
    }

    await this.deleteAccountFromDb(uid);
    await this.deleteOAuthTokens(uid);

    // data eng rely on this to delete the account data from BQ.
    // user self-deletes are logged when the client request was handled
    if (reason !== ReasonForDeletion.UserRequested) {
      this.log.info('accountDeleted.byCloudTask', { uid });
    }

    // see comment in the function on why we are not awaiting
    this.deletePushboxRecords(uid);

    await this.deleteSubscriptions(uid, reason, customerId);
    await this.deleteFirestoreCustomer(uid);
    await this.appleIap?.purchaseManager.deletePurchases(uid);
    await this.playBilling?.purchaseManager.deletePurchases(uid);
    this.statsd.increment('account.destroy.success', { reason });
    this.glean.account.deleteTaskHandled(request ?? requestForGlean, {
      reason,
    });
  }

  /**
   * Delete the account from the FxA database, OAuth database, and pushbox database.
   * This method is intended to be used when the user is waiting to be deleted from
   * the system so it only clears up the immediate database records and logs out the
   * user. The rest of the cleanup is handled later after queuing the account for
   * deletion.
   */
  public async quickDelete(uid: string, reason: ReasonForDeletion) {
    if (reason !== ReasonForDeletion.UserRequested) {
      throw new Error('quickDelete only supports user requested deletions');
    }

    try {
      await this.deleteAccountFromDb(uid);
      await this.deleteOAuthTokens(uid);
      this.statsd.increment('account.destroy.quick-delete');
    } catch (error) {
      // If the account wasn't fully deleted, we should log the error and
      // still queue the account for cleanup.
      this.log.error('quickDelete', { uid, error });
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
      const account = await this.fxaDb.account(uid);

      const devices = await this.fxaDb.devices(uid);

      await this.fxaDb.deleteAccount({ uid });
      this.log.activityEvent({
        uid,
        email: account.primaryEmail?.email,
        emailVerified: account.primaryEmail?.isVerified,
        event: 'account.deleted',
      });

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
        reportSentryError(err);
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
    if (deleteReason !== ReasonForDeletion.Unverified || !customerId) {
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
