/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/apple-app-store/subscription-purchase';
import { PlayStoreSubscriptionPurchase } from 'fxa-shared/payments/iap/google-play/subscription-purchase';
import { PaymentState } from 'fxa-shared/payments/iap/google-play/types';
import { AbbrevPlan } from 'fxa-shared/subscriptions/types';
import Stripe from 'stripe';
import { MozSubscription } from '../gql/model/moz-subscription.model';

/**
 * Responsible for converting a Stripe.Subscription to a MozSubscription
 */
export class StripeFormatter {
  static toMozSubscription(
    subscription: MozStripeSubscriptionDetails,
    plan?: MozPlanDetails,
    invoice?: MozInvoiceDetails,
    manageSubscriptionLink?: string
  ) {
    return {
      created: subscription.created,
      currentPeriodEnd: subscription.current_period_end,
      currentPeriodStart: subscription.current_period_start,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      endedAt: subscription.ended_at,
      latestInvoice: invoice?.hosted_invoice_url || 'NA',
      manageSubscriptionLink: manageSubscriptionLink || '',
      planId: plan?.plan_id || 'NA',
      productName: plan?.product_name || 'NA',
      productId: plan?.product_id || 'NA',
      status: subscription.status || 'Undetermined',
      subscriptionId: subscription.id,
    } as MozSubscription;
  }
}
export type MozStripeSubscriptionDetails = Pick<
  Stripe.Subscription,
  | 'created'
  | 'current_period_end'
  | 'cancel_at_period_end'
  | 'current_period_start'
  | 'ended_at'
  | 'status'
  | 'id'
>;
export type MozPlanDetails = Pick<
  AbbrevPlan,
  'plan_id' | 'product_name' | 'product_id'
> | null;
export type MozInvoiceDetails = Pick<
  Stripe.Invoice,
  'hosted_invoice_url'
> | null;

/**
 * Responsible for converting an AppStoreSubscriptionPurchase to a MozSubscription
 */
export class AppStoreFormatter {
  static toMozSubscription(
    subscription: MozAppSubscriptionType,
    plan?: MozPlanDetails | null
  ) {
    return {
      created: subscription.originalPurchaseDate,
      currentPeriodEnd: subscription.expiresDate,
      currentPeriodStart: subscription.verifiedAt,
      cancelAtPeriodEnd: subscription.willRenew() === false,
      endedAt: subscription.isExpired()
        ? subscription.expiresDate
        : null || null,
      latestInvoice: '',
      planId: plan?.plan_id,
      productName: plan?.product_name,
      productId: plan?.product_id,
      status: this.toStatus(subscription) || 'Undetermined',
      subscriptionId: subscription.originalTransactionId, // Not sure
    } as MozSubscription;
  }

  static toStatus(
    subscription: MozAppSubscriptionStatusType
  ): Stripe.Subscription.Status | null {
    // Mappings are not 1 to 1, which makes this tricky. Going with a very minimal set of mappings,
    // that seem generally true.

    // https://developer.apple.com/documentation/appstoreserverapi/get_all_subscription_statuses
    // https://stripe.com/docs/api/subscriptions/object

    if (subscription.isInBillingRetryPeriod()) {
      return 'unpaid';
    } else if (subscription.isInGracePeriod()) {
      return 'past_due';
    } else if (subscription.isExpired()) {
      return 'canceled';
    } else if (subscription.isFreeTrial()) {
      return 'trialing';
    } else if (subscription.isEntitlementActive()) {
      return 'active';
    } else {
      return null;
    }
  }
}
export type MozAppSubscriptionType = Pick<
  AppStoreSubscriptionPurchase,
  | 'originalPurchaseDate'
  | 'expiresDate'
  | 'verifiedAt'
  | 'willRenew'
  | 'isExpired'
  | 'originalTransactionId'
  | 'isFreeTrial'
  | 'isEntitlementActive'
  | 'isInBillingRetryPeriod'
  | 'isInGracePeriod'
>;
export type MozAppSubscriptionStatusType = Pick<
  MozAppSubscriptionType,
  | 'isFreeTrial'
  | 'isEntitlementActive'
  | 'isInBillingRetryPeriod'
  | 'isInGracePeriod'
  | 'isExpired'
>;

/**
 * Responsible for converting a PlayStoreSubscriptionPurchase to a MozSubscription
 */
export class PlayStoreFormatter {
  static toMozSubscription(
    subscription: MozPlaySubscriptionType,
    plan?: MozPlanDetails | null
  ) {
    return {
      created: subscription.startTimeMillis,
      currentPeriodEnd: subscription.expiryTimeMillis,
      currentPeriodStart: subscription.verifiedAt,
      cancelAtPeriodEnd: subscription.autoRenewing === false,
      endedAt: subscription.userCancellationTimeMillis || null,
      latestInvoice: '',
      planId: plan?.plan_id || 'NA',
      productName: plan?.product_name || 'NA',
      productId: plan?.product_id || 'NA',
      status: this.toStatus(subscription) || 'Undetermined',
      subscriptionId: subscription.purchaseToken,
    } as MozSubscription;
  }

  static toStatus(subscription: MozPlaySubscriptionStatusType) {
    // Mappings are not 1 to 1, which makes this tricky. Going with a very minimal set of mappings,
    // that seem generally true.

    // https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions#SubscriptionPurchase
    // https://stripe.com/docs/api/subscriptions/object

    const now = Date.now();
    if (subscription.replacedByAnotherPurchase) {
      return 'canceled';
    } else if (now >= subscription.expiryTimeMillis) {
      return 'canceled';
    } else if (PaymentState.FREE_TRIAL === subscription.paymentState) {
      return 'trialing';
    } else if (
      PaymentState.PENDING_DEFERRED === subscription.paymentState ||
      PaymentState.PENDING == subscription.paymentState
    ) {
      return 'unpaid';
    } else if (PaymentState.RECEIVED === subscription.paymentState) {
      return 'active';
    } else {
      return null;
    }
  }
}
export type MozPlaySubscriptionType = Pick<
  PlayStoreSubscriptionPurchase,
  | 'startTimeMillis'
  | 'expiryTimeMillis'
  | 'verifiedAt'
  | 'autoRenewing'
  | 'userCancellationTimeMillis'
  | 'purchaseToken'
  | 'replacedByAnotherPurchase'
  | 'paymentState'
>;
export type MozPlaySubscriptionStatusType = Pick<
  MozPlaySubscriptionType,
  'expiryTimeMillis' | 'replacedByAnotherPurchase' | 'paymentState'
>;
