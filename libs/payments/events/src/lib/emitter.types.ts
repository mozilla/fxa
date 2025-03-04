/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  CartMetrics,
  CmsMetricsData,
  CommonMetrics,
  PaymentProvidersType,
} from '@fxa/payments/metrics';

export type CheckoutEvents = CommonMetrics;
export type CheckoutPaymentEvents = CommonMetrics & {
  paymentProvider?: PaymentProvidersType;
};

export type SubscriptionEnded = {
  productId: string;
  priceId: string;
  priceInterval?: string;
  priceIntervalCount?: number;
  paymentProvider?: PaymentProvidersType;
  providerEventId: string;
  subscriptionId: string;
  voluntaryCancellation?: boolean;
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

export type PaymentsEmitterEvents = {
  checkoutView: CheckoutEvents;
  checkoutEngage: CheckoutEvents;
  checkoutSubmit: CheckoutPaymentEvents;
  checkoutSuccess: CheckoutPaymentEvents;
  checkoutFail: CheckoutPaymentEvents;
  subscriptionEnded: SubscriptionEnded;
  sp3Rollout: SP3RolloutEvent;
};

export type AdditionalMetricsData = {
  cmsMetricsData: CmsMetricsData;
  cartMetricsData: CartMetrics;
};
