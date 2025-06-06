/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CancellationReason,
  CartMetrics,
  CmsMetricsData,
  CommonMetrics,
  PaymentProvidersType,
} from '@fxa/payments/metrics';
import { LocationStatus } from '@fxa/payments/eligibility';
import { TaxChangeAllowedStatus } from '@fxa/payments/cart';

export type CheckoutEvents = CommonMetrics;
export type CheckoutPaymentEvents = CommonMetrics & {
  paymentProvider?: PaymentProvidersType;
};

export type SubscriptionEndedEvents = {
  productId: string;
  priceId: string;
  priceInterval?: string;
  priceIntervalCount?: number;
  paymentProvider?: PaymentProvidersType;
  providerEventId: string;
  cancellationReason: CancellationReason;
  uid?: string;
};

export const PaymentsEmitterEventsKeys = [
  'checkoutView',
  'checkoutEngage',
  'checkoutSubmit',
  'checkoutSuccess',
  'checkoutFail',
] as const;
export type PaymentsEmitterEventsKeysType =
  (typeof PaymentsEmitterEventsKeys)[number];

export type SP3RolloutEvent = {
  version: '2' | '3';
  offeringId: string;
  interval: string;
  shadowMode: boolean;
};

export type AuthEvents = {
  type: 'signin' | 'signout' | 'prompt_none_fail' | 'error';
  errorMessage?: string;
}

export type PaymentsEmitterEvents = {
  checkoutView: CheckoutEvents;
  checkoutEngage: CheckoutEvents;
  checkoutSubmit: CheckoutPaymentEvents;
  checkoutSuccess: CheckoutPaymentEvents;
  checkoutFail: CheckoutPaymentEvents;
  subscriptionEnded: SubscriptionEndedEvents;
  sp3Rollout: SP3RolloutEvent;
  locationView: LocationStatus | TaxChangeAllowedStatus;
  auth: AuthEvents;
};

export type AdditionalMetricsData = {
  cmsMetricsData: CmsMetricsData;
  cartMetricsData: CartMetrics;
};
