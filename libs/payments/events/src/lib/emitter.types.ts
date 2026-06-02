/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CancellationReason,
  CartMetrics,
  type CheckoutFailPayload,
  type CheckoutSuccessPayload,
  CmsMetricsData,
  CommonMetrics,
  type GenericGleanSubManageEvent,
} from '@fxa/payments/metrics';
import { LocationStatus } from '@fxa/payments/eligibility';
import { TaxChangeAllowedStatus } from '@fxa/payments/cart';
import {
  PaymentProvidersType,
  type SubPlatPaymentMethodType,
} from '@fxa/payments/customer';

export enum GleanGenericEventNames {
  CancelRouteChurnContent = 'recordCancelRouteChurnContent',
  CancelRouteInterstitialOffer = 'recordCancelRouteInterstitialOffer',
  CancelRouteStandard = 'recordCancelRouteStandard',
  CancelRouteError = 'recordCancelRouteError',
  StayRouteChurnContent = 'recordStayRouteChurnContent',
  StayRouteStandard = 'recordStayRouteStandard',
  StayRouteError = 'recordStayRouteError',
  ChurnCancelRedeemed = 'recordChurnCancelRedeemed',
  ChurnStayRedeemed = 'recordChurnStayRedeemed',
  CancelInterstitialOfferRedeemed = 'recordCancelInterstitialOfferRedeemed',
}

export type CheckoutEvents = CommonMetrics;
export type CheckoutPaymentEvents = CommonMetrics & {
  paymentProvider?: PaymentProvidersType;
  paymentMethod?: SubPlatPaymentMethodType;
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

export type TrialConvertedEvents = {
  productId: string;
  priceId: string;
  conversionStatus: 'successful' | 'unsuccessful';
  providerEventId: string;
  uid?: string;
  billingCountry?: string;
};

export const PaymentsEmitterEventsKeys = [
  'checkoutView',
  'checkoutEngage',
  'checkoutSubmit',
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
};

export type GenericGleanEvent = {
  eventName: GleanGenericEventNames;
  commonMetrics: CommonMetrics;
};

export type PaymentsEmitterEvents = {
  checkoutView: CheckoutEvents;
  checkoutEngage: CheckoutEvents;
  checkoutSubmit: CheckoutPaymentEvents;
  // Backend-triggered events emitted at the cart state transition rather
  // than from frontend polling. See @fxa/payments/metrics for the typed
  // payloads consumed by cart-side code via CHECKOUT_EVENT_EMITTER_TOKEN.
  checkoutSuccess: CheckoutSuccessPayload;
  checkoutFail: CheckoutFailPayload;
  genericGleanEvent: GenericGleanEvent;
  genericGleanSubManageEvent: GenericGleanSubManageEvent;
  subscriptionEnded: SubscriptionEndedEvents;
  trialConverted: TrialConvertedEvents;
  sp3Rollout: SP3RolloutEvent;
  locationView: LocationStatus | TaxChangeAllowedStatus;
  auth: AuthEvents;
};

export type AdditionalMetricsData = {
  cmsMetricsData: CmsMetricsData;
  cartMetricsData: CartMetrics;
  locale: string;
};
