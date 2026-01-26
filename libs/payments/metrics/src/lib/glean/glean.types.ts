/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ResultCart } from '@fxa/payments/cart';

export const CheckoutTypes = [
  'new_account',
  'existing_account',
  'logged_out',
  'unknown',
] as const;
export type CheckoutTypesType = (typeof CheckoutTypes)[number];
import { type TaxAddress } from '@fxa/payments/customer';

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

export type GenericGleanSubManageEvent = {
  eventName: string;
  uid: string;
  commonMetrics: CommonMetrics;
  subscriptionId?: string;
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

export const PaymentsGleanProvider = Symbol('GleanServerEventsProvider');

export type PaymentsGleanServerEventsLoggerTester = {
  recordPaySetupView: () => void;
  recordPaySetupEngage: (data: any) => void;
  recordPaySetupSubmit: (data: any) => void;
  recordPaySetupSuccess: (data: any) => void;
  recordPaySetupFail: (data: any) => void;
  recordSubscriptionEnded: (data: any) => void;
};
