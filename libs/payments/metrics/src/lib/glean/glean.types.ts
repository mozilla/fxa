/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { ResultCart } from '@fxa/payments/cart';
import type { SubplatInterval } from '@fxa/payments/customer';

export const CheckoutTypes = [
  'new_account',
  'existing_account',
  'logged_out',
  'unknown',
] as const;
export type CheckoutTypesType = (typeof CheckoutTypes)[number];
import type { TaxAddress } from '@fxa/payments/customer';

export const PaymentProvidersTypePartial = [
  'stripe',
  'google_iap',
  'apple_iap',
  'paypal',
] as const;

export type CommonMetrics = {
  ipAddress: string;
  deviceType: string;
  userAgent: string;
  experimentationId: string;
  isFreeTrial: boolean;
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

export type CartMetrics = Pick<
  ResultCart,
  | 'uid'
  | 'errorReasonId'
  | 'couponCode'
  | 'currency'
  | 'stripeCustomerId'
  | 'taxAddress'
>;

export type ExperimentationData = {
  nimbusUserId: string;
};

export type CmsMetricsData = {
  productId: string;
  priceId: string;
};

export type SubPlatCmsMetricsData = {
  offeringId?: string;
  interval?: string;
};

export type StripeMetricsData = {
  customerId?: string;
  couponCode?: string;
  currency?: string;
  taxAddress?: TaxAddress;
  productId?: string;
  priceId?: string;
};

export type AccountsMetricsData = {
  uid: string;
  metricsOptOut: boolean;
  locale?: string;
};

export type SessionMetricsData = {
  locale?: string;
  ipAddress: string;
  deviceType: string;
  userAgent: string;
};

export type SubManageMetricsArgs = {
  uid: string;
  commonMetrics: CommonMetrics;
  subscriptionId?: string;
};

export type GenericGleanSubManageEvent = SubManageMetricsArgs & {
  eventName: string;
};

export type GleanMetricsData = {
  stripe: StripeMetricsData;
  accounts: AccountsMetricsData;
  cms: SubPlatCmsMetricsData;
  session: SessionMetricsData;
  experimentation: ExperimentationData;
};

export enum CancellationReason {
  CustomerInitiated = 'customer_initiated',
  Involuntary = 'involuntary',
  Redundant = 'redundant',
}

export type SubscriptionCancellationData = {
  offeringId?: string;
  interval?: string;
  cancellationReason: CancellationReason;
  providerEventId: string;
};

export type TrialConversionData = {
  conversionStatus: 'successful' | 'unsuccessful';
  providerEventId: string;
  productId: string;
  billingCountry?: string;
};

export const PaymentsGleanProvider = Symbol('GleanServerEventsProvider');

export type PaymentsGleanServerEventsLoggerTester = {
  recordPaySetupView: () => void;
  recordPaySetupEngage: (data: any) => void;
  recordPaySetupSubmit: (data: any) => void;
  recordPaySetupSuccess: (data: any) => void;
  recordPaySetupFail: (data: any) => void;
  recordSubscriptionEnded: (data: any) => void;
  recordSubscriptionTrialConverted: (data: any) => void;
};

export type PageName = 'management' | 'payment_method';

export type Entrypoint = 'email' | 'internal_nav' | 'subscription-management';
export type EligibilityStatus = 'cancel' | 'stay' | 'offer' | 'not_eligible';
export type FlowType = 'cancel' | 'stay';
export type Action =
  | 'redeem_coupon'
  | 'cancel_subscription'
  | 'stay_subscribed'
  | 'keep_subscription'
  | 'offer'
  | 'upgrade'
  | 'remain_canceled';
export type Outcome =
  | 'redeem_success'
  | 'customer_canceled'
  | 'stay_subscribed_success'
  | 'upgrade_success'
  | 'error';

export const ErrorReasons = [
  'customer_mismatch',
  'discount_already_applied',
  'general_error',
  'no_churn_intervention_found',
  'redemption_limit_exceeded',
  'subscription_not_active',
  'subscription_not_found',
  'subscription_still_active',
  'operation_denied',
  'unexpected_exception',
] as const;

export type ErrorReason = (typeof ErrorReasons)[number];

export type Interval = SubplatInterval;

export type PageMetricsData = {
  pageName: PageName;
  entrypoint?: Entrypoint;
};

export type RetentionFlowCommonData = {
  flowType: FlowType;
  eligibilityStatus?: EligibilityStatus;
  offeringId?: string;
  interval?: Interval;
  entrypoint?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  nimbusUserId?: string;
};

export type RetentionFlowEngageData = RetentionFlowCommonData & {
  action: Action;
};

export type RetentionFlowSubmitData = RetentionFlowCommonData & {
  action: Action;
};

export type RetentionFlowResultData = RetentionFlowCommonData & {
  action?: Action;
  outcome: Outcome;
  errorReason?: ErrorReason;
};

export type InterstitialOfferCommonData = {
  entrypoint?: string;
  offeringId?: string;
  interval?: Interval;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  nimbusUserId?: string;
};

export type InterstitialOfferViewData = InterstitialOfferCommonData & {
  action?: Action;
};

export type InterstitialOfferEngageData = InterstitialOfferCommonData & {
  action: Action;
};

export type InterstitialOfferSubmitData = InterstitialOfferCommonData & {
  action: Action;
};

export type InterstitialOfferResultData = InterstitialOfferCommonData & {
  action?: Action;
  outcome: Outcome;
  errorReason?: ErrorReason;
};
