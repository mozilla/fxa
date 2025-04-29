/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ResultCart } from '@fxa/payments/cart';
import Stripe from 'stripe';

export const CheckoutTypes = ['with-accounts', 'without-accounts'] as const;
export type CheckoutTypesType = (typeof CheckoutTypes)[number];

export const PaymentProvidersTypePartial = [
  'card',
  'google_iap',
  'apple_iap',
  'external_paypal',
] as const;
export type PaymentProvidersType =
  | Stripe.PaymentMethod.Type
  | 'google_iap'
  | 'apple_iap'
  | 'external_paypal';

export type CommonMetrics = {
  ipAddress: string;
  deviceType: string;
  userAgent: string;
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

export type CartMetrics = Pick<
  ResultCart,
  'uid' | 'errorReasonId' | 'couponCode' | 'currency'
>;

export type CmsMetricsData = {
  productId: string;
  priceId: string;
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
