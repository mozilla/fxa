/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cloneDeep from 'lodash.clonedeep';
import { Stripe } from 'stripe';

import {
  AppStoreSubscription,
  PlayStoreSubscription,
} from '../dto/auth/payments/iap-subscription';
import { LatestInvoiceItems } from '../dto/auth/payments/invoice';
import { PlanConfigurationDtoT } from '../dto/auth/payments/plan-configuration';

export type PlanInterval = Stripe.Plan['interval'];

export interface RawMetadata {
  [propName: string]: any;
}

// A mapping of OAuth client ids to their corresponding capabilities.
export type ClientIdCapabilityMap = Record<string, readonly string[]>;
export const ClientIdCapabilityMap = {
  merge(
    a: ClientIdCapabilityMap,
    b: ClientIdCapabilityMap
  ): ClientIdCapabilityMap {
    return Object.entries(b).reduce((acc, [clientId, capabilities]) => {
      if (!acc[clientId]) {
        acc[clientId] = cloneDeep(capabilities);
        return acc;
      }
      for (const capability of capabilities) {
        if (!acc[clientId].includes(capability)) {
          acc[clientId] = [...acc[clientId], capability];
        }
      }
      return acc;
    }, cloneDeep(a));
  },
};

export interface Plan {
  amount: number | null;
  currency: string;
  interval_count: number;
  interval: PlanInterval;
  plan_id: string;
  plan_metadata: RawMetadata | null;
  plan_name?: string;
  product_id: string;
  product_metadata: RawMetadata | null;
  product_name: string;
  active: boolean;
  // TODO remove the '?' here when removing the SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED feature flag
  configuration?: PlanConfigurationDtoT | null;
}

export enum CheckoutType {
  WITH_ACCOUNT = 'with-account',
  WITHOUT_ACCOUNT = 'without-account',
}

export type ConfiguredPlan = Stripe.Plan & {
  configuration: PlanConfigurationDtoT | null;
};

export interface PlanMetadata {
  // note: empty for now, but may be expanded in the future
}

// https://mozilla.github.io/ecosystem-platform/tutorials/subscription-platform#product-metadata
export interface ProductMetadata {
  appStoreLink?: string;
  capabilities?: string;
  emailIconURL?: string | null;
  newsletterSlug?: string;
  newsletterLabelTextCode?: string;
  playStoreLink?: string;
  productOrder?: string | null;
  productSet: string[];
  upgradeCTA?: string | null;
  webIconBackground?: string | null;
  webIconURL: string | null;
  'product:termsOfServiceDownloadURL': string;
  'product:termsOfServiceURL': string;
  'product:privacyNoticeDownloadURL'?: string;
  'product:privacyNoticeURL': string;
  'product:cancellationSurveyURL'?: string;
  successActionButtonURL: string | null;
  // capabilities:{clientID}: string // filtered out or ignored for now
}

// The ProductDetails type is exploded out into enums describing keys to
// make Stripe metadata parsing & validation easier.
export enum ProductDetailsStringProperties {
  'name',
  'subtitle',
  'successActionButtonLabel',
  'termsOfServiceURL',
  'termsOfServiceDownloadURL',
  'privacyNoticeURL',
  'privacyNoticeDownloadURL',
  'cancellationSurveyURL',
}
export enum ProductDetailsListProperties {
  'details',
}
export type ProductDetailsStringProperty =
  keyof typeof ProductDetailsStringProperties;
export type ProductDetailsListProperty =
  keyof typeof ProductDetailsListProperties;
export type ProductDetails = {
  [key in ProductDetailsStringProperty]?: string;
} & { [key in ProductDetailsListProperty]?: string[] };

export type AbbrevProduct = {
  product_id: string;
  product_metadata: Stripe.Product['metadata'];
  product_name: string;
};

export type AbbrevPlan = {
  amount: Stripe.Plan['amount'];
  currency: Stripe.Plan['currency'];
  interval_count: Stripe.Plan['interval_count'];
  interval: Stripe.Plan['interval'];
  plan_id: string;
  plan_metadata: Stripe.Plan['metadata'];
  plan_name: string;
  product_id: string;
  product_metadata: Stripe.Product['metadata'];
  product_name: string;
  active: boolean;
  // TODO remove the '?' here when removing the SUBSCRIPTIONS_FIRESTORE_CONFIGS_ENABLED feature flag
  configuration?: PlanConfigurationDtoT | null;
};

// Do not re-order the list items without updating their references.
export const SUBSCRIPTION_TYPES = ['web', 'iap_google', 'iap_apple'] as const;
export type SubscriptionTypes = typeof SUBSCRIPTION_TYPES;
export type SubscriptionType = SubscriptionTypes[number];
export const MozillaSubscriptionTypes = {
  WEB: SUBSCRIPTION_TYPES[0],
  IAP_GOOGLE: SUBSCRIPTION_TYPES[1],
  IAP_APPLE: SUBSCRIPTION_TYPES[2],
} as const;
export type WebSubscription = Pick<
  Stripe.Subscription,
  | 'created'
  | 'current_period_end'
  | 'current_period_start'
  | 'cancel_at_period_end'
> &
  Partial<Pick<Stripe.Charge, 'failure_code' | 'failure_message'>> & {
    _subscription_type: SubscriptionTypes[0];
    end_at: Stripe.Subscription['ended_at'];
    latest_invoice: string;
    latest_invoice_items: LatestInvoiceItems;
    plan_id: Stripe.Plan['id'];
    product_name: Stripe.Product['name'];
    product_id: Stripe.Product['id'];
    status: Omit<
      Stripe.Subscription.Status,
      'incomplete' | 'incomplete_expired'
    >;
    subscription_id: Stripe.Subscription['id'];
    promotion_amount_off?: number | null;
    promotion_code?: string;
    promotion_duration: string | null;
    promotion_end: number | null;
    promotion_name?: string | null;
    promotion_percent_off?: number | null;
  };

export type IapSubscription = PlayStoreSubscription | AppStoreSubscription;
export type MozillaSubscription = WebSubscription | IapSubscription;

export const PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT = 'missing_agreement';
export const PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE = 'funding_source';
export type PaypalPaymentError =
  | typeof PAYPAL_PAYMENT_ERROR_MISSING_AGREEMENT
  | typeof PAYPAL_PAYMENT_ERROR_FUNDING_SOURCE;

export type SentEmailParams = {
  subscriptionId: string;
};

// Used to represent upgrade eligibility only
// Invalid is used in cases where plan is not an upgrade/downgrade
// including new subscriptions
export const SubscriptionUpdateEligibility = {
  UPGRADE: 'upgrade',
  DOWNGRADE: 'downgrade',
  INVALID: 'invalid',
} as const;

// Used to represent plan eligibility in general
export enum SubscriptionEligibilityResult {
  CREATE = 'create',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  BLOCKED_IAP = 'blocked_iap',
  INVALID = 'invalid',
}

export type SubscriptionUpdateEligibility =
  (typeof SubscriptionUpdateEligibility)[keyof typeof SubscriptionUpdateEligibility];

export enum SubscriptionStripeErrorType {
  NO_MIN_CHARGE_AMOUNT = 'Currency does not have a minimum charge amount available.',
}

export class SubscriptionStripeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionStripeError';
  }
}

export type InvoicePreview = [
  invoicePreview: Stripe.UpcomingInvoice,
  proratedInvoice?: Stripe.UpcomingInvoice,
];

export type SubscriptionChangeEligibility = {
  subscriptionEligibilityResult: SubscriptionEligibilityResult;
  eligibleSourcePlan?: AbbrevPlan;
  redundantOverlaps?: SubscriptionChangeEligibility[];
};
